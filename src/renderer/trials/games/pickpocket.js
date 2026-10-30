/**
 * Модуль мини-игры: Карманная кража (Pickpocketing)
 * Полноценная D&D 5e стелс-механика: Sleight of Hand против Passive Perception (DC).
 * Контроль внимания жертвы с предупреждениями (Telegraph), натяжение шнура кошеля (Belt Tension),
 * тактильный ритм вытягивания добычи и процедурный объёмный звук монет и ткани.
 */

import { audio } from '../audio.js';
import { dnd } from '../dnd-engine.js';

export class PickpocketGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;

    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;

    // Состояния внимания жертвы:
    // 'DISTRACTED' (пьёт/зевает) -> 'SUSPICIOUS' (микро-предупреждение) -> 'ALERT' (смотрит на пояс)
    this.targetState = 'DISTRACTED';
    this.stateTimer = 0;
    this.stateDuration = 2.0;

    // Шкала подозрения (0..100%)
    this.suspicion = 0;

    // Шкала извлечения добычи (0..100%)
    this.progress = 0;

    // Шкала натяжения шнура/пояса (0..100%) при непрерывном вытягивании
    this.beltTension = 0;
    this.pullDuration = 0; // сколько секунд игрок непрерывно тянет без паузы

    // Статусы сессии
    this.isExtracting = false;
    this.isCaught = false;
    this.isStolen = false;

    // Таймеры фаз
    this.telegraphTimer = 0;
    this.alertLookTimer = 0;
    this.clothSoundCooldown = 0;
    this.heartbeatTimer = 0;

    // Параметры D&D (динамически рассчитываются от DC и Бонуса)
    this.extractionSpeed = 18; // % в секунду
    this.maxSafeTug = 0.55; // максимальное время непрерывного рывка до натяжения
    this.distractedMin = 1.4;
    this.distractedMax = 2.4;
    this.telegraphDuration = 0.6;
    this.alertDuration = 1.1;
    this.suspicionMult = 1.0;

    // Частицы блеска золота
    this.particles = [];

    // Привязанные события
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundResize = this.setupCanvas.bind(this);
  }

  init() {
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    this.calculateDndParams();
    this.reset();
    this.startAnimationLoop();
  }

  renderDOM() {
    this.container.innerHTML = `
      <div class="stage-container pickpocket-stage">
        <div class="stage-header">
          <h2 class="stage-title">🪙 Карманная кража</h2>
          <p class="stage-subtitle">Тяните кошель короткими аккуратными рывками. Замрите при настороженности жертвы!</p>
        </div>

        <div class="pickpocket-layout">
          <!-- Карточка внимания жертвы -->
          <div class="npc-awareness-card" id="npcAwarenessBox">
            <div class="awareness-header">
              <span class="awareness-icon" id="awarenessIcon">🍺</span>
              <div class="awareness-info">
                <span class="awareness-label">Внимание цели (Passive Perception DC <strong id="hudDcVal">${dnd.dc}</strong>):</span>
                <span class="awareness-status" id="awarenessStatus">Отвлечён (Считает кружки эля)</span>
              </div>
            </div>
            
            <div class="suspicion-bar-wrap">
              <div class="suspicion-label-row">
                <span>Уровень подозрения жертвы:</span>
                <span id="suspicionVal" style="font-weight: 700;">0%</span>
              </div>
              <div class="suspicion-track">
                <div class="suspicion-fill" id="suspicionFill" style="width: 0%;"></div>
              </div>
            </div>

            <!-- Шкала натяжения шнура / ритма рывка -->
            <div class="suspicion-bar-wrap" style="margin-top: 4px;">
              <div class="suspicion-label-row">
                <span>Натяжение шнура (Ритм рывка):</span>
                <span id="tensionVal" style="font-weight: 600; color: #60a5fa;">0%</span>
              </div>
              <div class="tension-track" style="width: 100%; height: 5px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden;">
                <div class="tension-fill" id="tensionFill" style="width: 0%; height: 100%; background: #3b82f6; transition: width 0.04s linear, background 0.15s;"></div>
              </div>
            </div>
          </div>

          <!-- Холст сцены кошеля и извлечения -->
          <div class="pickpocket-canvas-wrapper">
            <canvas id="pickpocketCanvas" class="game-canvas"></canvas>
            
            <div class="extraction-progress-overlay">
              <div class="progress-label-row">
                <span>Добыча срезана / извлечена:</span>
                <span id="extractionPercent" style="font-weight: 700; color: var(--accent-gold);">0%</span>
              </div>
              <div class="extraction-track">
                <div class="extraction-fill" id="extractionFill" style="width: 0%;"></div>
              </div>
            </div>
          </div>

          <!-- Кнопка действия (для мыши, тача и доступности) -->
          <div class="pickpocket-controls-row">
            <button type="button" class="btn fantasy-btn primary" id="btnTouchSteal" style="min-width: 260px; padding: 12px 28px; font-size: 1rem; font-weight: 700;">
              <span>🤏</span> Тянуть добычу (Зажать ПРОБЕЛ / ЛКМ)
            </button>
          </div>
        </div>

        <div class="lock-controls-guide" style="margin-top: 14px;">
          <div class="guide-pill">
            <span class="guide-key">Короткий зажим</span>
            <span>Потянуть на 0.4–0.6 сек</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Отпустить</span>
            <span>Сбросить натяжение пояса</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">👂 / 👁️ Замри!</span>
            <span>Не тянуть, пока цель смотрит</span>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#pickpocketCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.npcAwarenessBox = this.container.querySelector('#npcAwarenessBox');
    this.awarenessIcon = this.container.querySelector('#awarenessIcon');
    this.awarenessStatus = this.container.querySelector('#awarenessStatus');
    this.suspicionVal = this.container.querySelector('#suspicionVal');
    this.suspicionFill = this.container.querySelector('#suspicionFill');
    this.tensionVal = this.container.querySelector('#tensionVal');
    this.tensionFill = this.container.querySelector('#tensionFill');
    this.extractionPercent = this.container.querySelector('#extractionPercent');
    this.extractionFill = this.container.querySelector('#extractionFill');
    this.btnTouchSteal = this.container.querySelector('#btnTouchSteal');
    this.hudDcVal = this.container.querySelector('#hudDcVal');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const width = Math.min(480, Math.min(window.innerWidth - 48, 480));
    const height = 340;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.logicalWidth = width;
    this.logicalHeight = height;
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', this.boundPointerDown);
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('resize', this.boundResize);

    const start = (e) => {
      e.preventDefault();
      this.startStealing();
    };
    const stop = (e) => {
      e.preventDefault();
      this.stopStealing();
    };

    if (this.btnTouchSteal) {
      this.btnTouchSteal.addEventListener('pointerdown', start);
      this.btnTouchSteal.addEventListener('pointerup', stop);
      this.btnTouchSteal.addEventListener('pointerleave', stop);
    }
  }

  // Расчет параметров D&D 5e
  calculateDndParams(advantage = null) {
    const dc = dnd.dc;
    const bonus = dnd.bonus;
    const adv = advantage || dnd.getEffectiveAdvantage();

    // 1. Скорость вытягивания: базово ~16%, каждый +1 к бонусу персонажа даёт +1.5%
    const baseSpeed = 16 + (bonus * 1.5);
    const speedMultiplier = adv?.extraDurability ? 1.25 : adv?.toleranceFactor || 1.0;
    this.extractionSpeed = Math.max(10, baseSpeed * speedMultiplier);

    // 2. Длительность безопасного окна (жертва отвлечена):
    // При DC 10: 2.2 – 3.2 сек
    // При DC 15: 1.5 – 2.3 сек
    // При DC 20: 1.0 – 1.6 сек
    // При DC 25+: 0.7 – 1.2 сек
    this.distractedMin = Math.max(0.7, 2.2 - (dc - 10) * 0.08);
    this.distractedMax = Math.max(1.2, 3.2 - (dc - 10) * 0.10);

    // 3. Окно предупреждения (Telegraph): время игрока среагировать и замереть
    // При DC 10: 0.8 сек; при DC 15: 0.6 сек; при DC 20+: 0.45 сек
    this.telegraphDuration = Math.max(0.35, 0.78 - (dc - 10) * 0.024);

    // 4. Длительность пристального взгляда (Alert):
    this.alertDuration = Math.max(0.8, 1.1 + (dc - 15) * 0.035);

    // 5. Максимально безопасный непрерывный рывок:
    this.maxSafeTug = Math.max(0.36, Math.min(0.85, 0.54 + (bonus * 0.025) - ((dc - 15) * 0.015)));

    // 6. Множитель роста подозрения от DC:
    this.suspicionMult = 1.0 + Math.max(0, (dc - 12) * 0.05);

    if (this.hudDcVal) {
      this.hudDcVal.textContent = dc;
    }
  }

  onParametersChanged(advantage) {
    this.calculateDndParams(advantage);
    this.reset();
  }

  startStealing() {
    if (this.isCaught || this.isStolen) return;
    this.isExtracting = true;
    if (this.btnTouchSteal) {
      this.btnTouchSteal.classList.add('active');
    }
    audio.ensureContext();
    audio.playClothRustle(0.04);
  }

  stopStealing() {
    this.isExtracting = false;
    this.pullDuration = 0;
    if (this.btnTouchSteal) {
      this.btnTouchSteal.classList.remove('active');
    }
  }

  onPointerDown(e) {
    if (e.button === 0) {
      this.startStealing();
    }
  }

  onPointerUp() {
    this.stopStealing();
  }

  onKeyDown(e) {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    if (e.code === 'Space') {
      if (!this.isExtracting) {
        this.startStealing();
      }
      e.preventDefault();
    }
  }

  onKeyUp(e) {
    if (e.code === 'Space') {
      this.stopStealing();
      e.preventDefault();
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
    }
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('resize', this.boundResize);
  }

  reset() {
    this.targetState = 'DISTRACTED';
    this.stateTimer = 0;
    this.stateDuration = this.getDistractedDuration();
    this.suspicion = 0;
    this.progress = 0;
    this.beltTension = 0;
    this.pullDuration = 0;
    this.isExtracting = false;
    this.isCaught = false;
    this.isStolen = false;
    this.telegraphTimer = 0;
    this.alertLookTimer = 0;
    this.clothSoundCooldown = 0;
    this.heartbeatTimer = 0;
    this.particles = [];

    if (this.btnTouchSteal) {
      this.btnTouchSteal.classList.remove('active');
    }
    this.updateHUD();
  }

  start() {
    this.calculateDndParams();
    this.reset();
  }

  getDistractedDuration() {
    return this.distractedMin + Math.random() * (this.distractedMax - this.distractedMin);
  }

  // --- ИГРОВОЙ ЦИКЛ ---
  startAnimationLoop() {
    let lastTime = performance.now();
    const loop = (currentTime) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      this.update(dt);
      this.draw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  update(dt) {
    if (this.isCaught || this.isStolen) return;

    // 1. АВТОМАТ СОСТОЯНИЙ ВНИМАНИЯ ЖЕРТВЫ
    if (this.targetState === 'DISTRACTED') {
      this.stateTimer += dt;
      if (this.stateTimer >= this.stateDuration) {
        // Переход к настороженности (предупреждение игроку!)
        this.targetState = 'SUSPICIOUS';
        this.telegraphTimer = this.telegraphDuration;
        audio.playTargetSuspicious();
      }

      // Вытягивание кошеля
      if (this.isExtracting) {
        this.pullDuration += dt;
        this.progress = Math.min(100, this.progress + this.extractionSpeed * dt);

        // Мягкий шелест ткани при непрерывном движении
        this.clothSoundCooldown -= dt;
        if (this.clothSoundCooldown <= 0) {
          audio.playClothRustle(0.04);
          this.clothSoundCooldown = 0.18;
        }

        // Рост натяжения ремня при непрерывном удержании
        if (this.pullDuration > this.maxSafeTug) {
          this.beltTension = Math.min(100, this.beltTension + 140 * dt);

          // Перенатяжение: шнур натянулся, монеты тихо брякнули!
          if (this.beltTension >= 98) {
            audio.playCoinJingle(0.08);
            this.spawnCoinSparkle(1);
            this.suspicion = Math.min(100, this.suspicion + (18 * this.suspicionMult));
            if (this.app?.stealthNoiseEnabled) {
              this.app.addNoise(12);
            }
            // Цель сразу настораживается от рывка
            this.targetState = 'SUSPICIOUS';
            this.telegraphTimer = this.telegraphDuration * 0.8;
            this.beltTension = 60;
            this.pullDuration = this.maxSafeTug * 0.5;
            audio.playTargetSuspicious();
          }
        } else {
          this.beltTension = (this.pullDuration / this.maxSafeTug) * 55;
        }
      } else {
        // Игрок отпустил кнопку: натяжение быстро спадает, рука прячется
        this.pullDuration = 0;
        this.beltTension = Math.max(0, this.beltTension - 320 * dt);
        // Медленное успокоение подозрения в тени
        if (this.suspicion > 0) {
          this.suspicion = Math.max(0, this.suspicion - 8.5 * dt);
        }
      }

    } else if (this.targetState === 'SUSPICIOUS') {
      // ФАЗА ПРЕДУПРЕЖДЕНИЯ (Telegraph) — жертва замерла и вот-вот обернётся
      this.telegraphTimer -= dt;

      if (this.isExtracting) {
        // ОШИБКА: Игрок тянет, пока цель насторожена!
        this.suspicion = Math.min(100, this.suspicion + (65 * this.suspicionMult * dt));
        this.progress = Math.min(100, this.progress + (this.extractionSpeed * 0.35) * dt);
        audio.playCoinJingle(0.06);

        if (this.app?.stealthNoiseEnabled) {
          this.app.addNoise(20 * dt);
        }

        if (this.telegraphTimer <= 0 || this.suspicion >= 50) {
          // Мгновенный разворот
          this.targetState = 'ALERT';
          this.alertLookTimer = this.alertDuration;
          audio.playTargetAlert();
        }
      } else {
        // Игрок вовремя замер! Натяжение сброшено
        this.beltTension = Math.max(0, this.beltTension - 340 * dt);

        if (this.telegraphTimer <= 0) {
          // Жертва либо обернётся проверить (65%), либо отмахнётся (35%)
          if (Math.random() < 0.65) {
            this.targetState = 'ALERT';
            this.alertLookTimer = this.alertDuration;
            audio.playTargetAlert();
          } else {
            // Отвлеклась обратно
            this.targetState = 'DISTRACTED';
            this.stateTimer = 0;
            this.stateDuration = this.getDistractedDuration();
          }
        }
      }

    } else if (this.targetState === 'ALERT') {
      // ФАЗА ПРОВЕРКИ (Alert) — цель смотрит прямо на пояс!
      this.alertLookTimer -= dt;

      if (this.isExtracting) {
        // КАТАСТРОФА: попытка кражи прямо под пристальным взглядом жертвы!
        this.suspicion = 100;
        this.triggerCaught();
        return;
      } else {
        // Игрок стоит неподвижно в тени
        this.beltTension = 0;

        if (this.alertLookTimer <= 0) {
          // Цель ничего не заметила, выдыхает и отворачивается!
          this.targetState = 'DISTRACTED';
          this.stateTimer = 0;
          this.stateDuration = this.getDistractedDuration();
          // Награда за выдержку: подозрение заметно падает
          this.suspicion = Math.max(0, this.suspicion - 18);
        }
      }
    }

    // 2. СТУК СЕРДЦА ПРИ ВЫСОКОМ НАПРЯЖЕНИИ
    if (this.suspicion >= 40) {
      this.heartbeatTimer += dt;
      const beatRate = this.suspicion >= 75 ? 0.55 : 0.85;
      if (this.heartbeatTimer >= beatRate) {
        this.heartbeatTimer = 0;
        audio.playHeartbeat();
      }
    }

    // 3. ПРОВЕРКА ПОБЕДЫ / ПОРАЖЕНИЯ
    if (this.suspicion >= 100) {
      this.triggerCaught();
      return;
    }

    if (this.progress >= 100) {
      this.triggerStolenSuccess();
      return;
    }

    this.updateHUD();

    // Частицы
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  updateHUD() {
    if (!this.awarenessIcon || !this.awarenessStatus) return;

    if (this.targetState === 'DISTRACTED') {
      this.awarenessIcon.textContent = '🍺';
      this.awarenessStatus.textContent = 'Отвлечён (Смотрит в зал / Пьет эль)';
      this.awarenessStatus.style.color = '#22c55e';
      this.npcAwarenessBox?.classList.remove('suspicious', 'alert');
    } else if (this.targetState === 'SUSPICIOUS') {
      this.awarenessIcon.textContent = '👂';
      this.awarenessStatus.textContent = 'НАСТОРОЖИЛСЯ! (Прислушивается... Замри!)';
      this.awarenessStatus.style.color = '#f59e0b';
      this.npcAwarenessBox?.classList.add('suspicious');
      this.npcAwarenessBox?.classList.remove('alert');
    } else {
      this.awarenessIcon.textContent = '👁️';
      this.awarenessStatus.textContent = 'ПРОВЕРЯЕТ КАРМАНЫ! (Не шевелись!)';
      this.awarenessStatus.style.color = '#ef4444';
      this.npcAwarenessBox?.classList.remove('suspicious');
      this.npcAwarenessBox?.classList.add('alert');
    }

    // Подозрение
    if (this.suspicionFill && this.suspicionVal) {
      const s = Math.round(this.suspicion);
      this.suspicionFill.style.width = `${s}%`;
      this.suspicionVal.textContent = `${s}%`;
      this.suspicionFill.style.background = s < 40 ? '#22c55e' : s < 75 ? '#f59e0b' : '#ef4444';
    }

    // Натяжение пояса (Ритм рывка)
    if (this.tensionFill && this.tensionVal) {
      const t = Math.round(this.beltTension);
      this.tensionFill.style.width = `${t}%`;
      this.tensionVal.textContent = `${t}%`;
      this.tensionVal.style.color = t < 55 ? '#60a5fa' : t < 80 ? '#f59e0b' : '#ef4444';
      this.tensionFill.style.background = t < 55 ? '#3b82f6' : t < 80 ? '#f59e0b' : '#ef4444';
    }

    // Извлечение
    if (this.extractionFill && this.extractionPercent) {
      const p = Math.round(this.progress);
      this.extractionFill.style.width = `${p}%`;
      this.extractionPercent.textContent = `${p}%`;
    }
  }

  triggerCaught() {
    this.isCaught = true;
    this.isExtracting = false;
    audio.playTargetAlert();
    audio.playFailure();
    this.app?.recordMistake?.();
    this.app?.addNoise?.(45);

    this.updateHUD();

    setTimeout(() => {
      this.app?.finishGame?.(false, { reason: 'pickpocket_detected' });
    }, 700);
  }

  triggerStolenSuccess() {
    this.isStolen = true;
    this.isExtracting = false;
    audio.playPurseSnatch();
    audio.playSuccess();

    // Россыпь золотых искр победы
    for (let i = 0; i < 35; i++) {
      this.spawnCoinSparkle(2.5);
    }

    this.updateHUD();

    setTimeout(() => {
      this.app?.finishGame?.(true);
    }, 850);
  }

  spawnCoinSparkle(speedMult = 1.0) {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const cy = this.logicalHeight * 0.45;
    const a = Math.random() * Math.PI * 2;
    const speed = (1.5 + Math.random() * 3.5) * speedMult;

    this.particles.push({
      x: cx + (Math.random() - 0.5) * 36,
      y: cy + (Math.random() - 0.5) * 36,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 1.2,
      color: Math.random() > 0.35 ? '#ffd700' : '#ffffff',
      size: 2.5 + Math.random() * 3,
      life: 1.0,
      decay: 0.035
    });
  }

  // --- ОТРИСОВКА НА ХОЛСТЕ ---
  draw() {
    if (!this.ctx || !this.logicalWidth) return;
    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;
    const cx = w / 2;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Трактирный полумрак и ткань мантии
    this.drawBackground(ctx, w, h);

    // 2. Световой конус/аура внимания цели
    this.drawAwarenessAura(ctx, cx, w, h);

    // 3. Кожаный ремень с латунными бляшками
    this.drawBelt(ctx, cx, w);

    // 4. Кожаный кошель со шнурками
    this.drawPouch(ctx, cx, h);

    // 5. Драгоценная добыча, вытягиваемая из кошеля
    this.drawLootItem(ctx, cx, h);

    // 6. Воровские перчатки и руки
    this.drawHands(ctx, cx, h);

    // 7. Искры
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawBackground(ctx, w, h) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0f1118');
    bgGrad.addColorStop(1, '#07080c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Тёмный шерстяной плащ жертвы на спине
    ctx.fillStyle = '#181b28';
    ctx.beginPath();
    ctx.moveTo(w * 0.12, 0);
    ctx.lineTo(w * 0.88, 0);
    ctx.lineTo(w * 0.96, h);
    ctx.lineTo(w * 0.04, h);
    ctx.fill();

    // Складки плаща
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 70, 0);
    ctx.bezierCurveTo(cx - 90, h * 0.4, cx - 110, h * 0.8, cx - 120, h);
    ctx.moveTo(cx + 70, 0);
    ctx.bezierCurveTo(cx + 90, h * 0.4, cx + 110, h * 0.8, cx + 120, h);
    ctx.stroke();
  }

  drawAwarenessAura(ctx, cx, w, h) {
    if (this.targetState === 'DISTRACTED') {
      // Спокойное рассеянное свечение
      const g = ctx.createRadialGradient(cx, 30, 20, cx, 30, 180);
      g.addColorStop(0, 'rgba(34, 197, 94, 0.07)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    } else if (this.targetState === 'SUSPICIOUS') {
      // Пульсирующая янтарная настороженность
      const pulse = 0.5 + Math.sin(performance.now() * 0.012) * 0.3;
      const g = ctx.createRadialGradient(cx, 30, 20, cx, 30, 220);
      g.addColorStop(0, `rgba(245, 158, 11, ${0.12 * pulse})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    } else if (this.targetState === 'ALERT') {
      // Ярко-красный конус наблюдения
      const pulse = 0.7 + Math.sin(performance.now() * 0.018) * 0.3;
      const g = ctx.createRadialGradient(cx, 40, 10, cx, 140, 240);
      g.addColorStop(0, `rgba(239, 68, 68, ${0.22 * pulse})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Глаз тревоги
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 22px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👁️', cx, 28);
      ctx.restore();
    }
  }

  drawBelt(ctx, cx, w) {
    // Кожаный ремень
    ctx.fillStyle = '#26170a';
    ctx.fillRect(cx - 200, 22, 400, 36);
    ctx.strokeStyle = '#422812';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 200, 22, 400, 36);

    // Латунные заклёпки
    ctx.fillStyle = '#d4af37';
    for (let x = cx - 180; x <= cx + 180; x += 36) {
      ctx.beginPath();
      ctx.arc(x, 40, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Латунная пряжка по центру
    ctx.strokeStyle = '#e5b839';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 24, 20, 48, 40);
  }

  drawPouch(ctx, cx, h) {
    const pouchTopY = 56;
    const pouchHeight = 155;

    // Смещение кошеля вверх по мере извлечения (до 45px)
    const liftY = (this.progress / 100) * 45;
    const actualPouchY = pouchTopY - liftY;

    // Дрожь кошеля при высоком натяжении
    const shake = this.beltTension > 60 ? (Math.random() - 0.5) * (this.beltTension / 25) : 0;
    const finalCx = cx + shake;

    // Шнурки подвеса (натягиваются и вибрируют)
    ctx.save();
    ctx.strokeStyle = this.beltTension > 75 ? '#ef4444' : this.beltTension > 45 ? '#f59e0b' : '#8d5b2d';
    ctx.lineWidth = this.beltTension > 75 ? 3.5 : 2.5;

    ctx.beginPath();
    ctx.moveTo(finalCx - 22, 48);
    ctx.lineTo(finalCx - 16, actualPouchY + 6);
    ctx.moveTo(finalCx + 22, 48);
    ctx.lineTo(finalCx + 16, actualPouchY + 6);
    ctx.stroke();
    ctx.restore();

    // Тело кошеля
    const pouchGrad = ctx.createRadialGradient(finalCx, actualPouchY + 70, 8, finalCx, actualPouchY + 70, 85);
    pouchGrad.addColorStop(0, '#53321d');
    pouchGrad.addColorStop(0.75, '#2e190d');
    pouchGrad.addColorStop(1, '#180d06');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(finalCx - 42, actualPouchY);
    ctx.bezierCurveTo(finalCx - 80, actualPouchY + 40, finalCx - 75, actualPouchY + pouchHeight, finalCx, actualPouchY + pouchHeight + 8);
    ctx.bezierCurveTo(finalCx + 75, actualPouchY + pouchHeight, finalCx + 80, actualPouchY + 40, finalCx + 42, actualPouchY);
    ctx.closePath();

    ctx.fillStyle = pouchGrad;
    ctx.fill();

    ctx.strokeStyle = this.beltTension > 80 ? 'rgba(239, 68, 68, 0.7)' : '#744728';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Горловина кошеля со шнуровкой
    ctx.fillStyle = '#1e1107';
    ctx.fillRect(finalCx - 40, actualPouchY - 2, 80, 14);

    ctx.restore();
  }

  drawLootItem(ctx, cx, h) {
    // Добыча (золотой амулет с рубином) появляется и поднимается вверх
    const startY = 175;
    const endY = 65;
    const currentY = startY - (this.progress / 100) * (startY - endY);

    ctx.save();
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = this.progress > 75 ? 18 : 6;

    // Золотая витая цепочка
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, currentY - 24);
    ctx.lineTo(cx, currentY);
    ctx.stroke();

    // Оправа амулета
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(cx, currentY, 17, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Вставка: сияющий рубин
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(cx, currentY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawHands(ctx, cx, h) {
    const handY = 170 - (this.progress / 100) * 85;

    ctx.save();
    ctx.fillStyle = '#1c1f2b';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

    if (this.isExtracting) {
      // Пальцы вора крепко и осторожно держат шнур кошеля
      ctx.beginPath();
      ctx.roundRect(cx - 15, handY - 12, 9, 28, 4);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(cx + 6, handY - 12, 9, 28, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      // Рука убрана в тень (чуть ниже кошеля, готовая к следующему рывку)
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.roundRect(cx - 15, 235, 9, 22, 4);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(cx + 6, 235, 9, 22, 4);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // Если пойман: латная перчатка стражника перехватывает запястье!
    if (this.isCaught) {
      ctx.fillStyle = '#4b5563';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(cx - 32, handY - 4, 64, 22, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 12px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ХВАТКА!', cx, handY + 12);
    }

    ctx.restore();
  }

  drawParticles(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
