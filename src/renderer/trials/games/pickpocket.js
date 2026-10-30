/**
 * Модуль мини-игры: Карманная кража (Pickpocketing)
 * Стелс-механика контроля внимания жертвы (Distracted -> Suspicious -> Alert),
 * деликатное извлечение предмета из кошеля, физика звяканья монет и ловкость рук.
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

    // Состояния внимания жертвы: 'DISTRACTED' | 'SUSPICIOUS' | 'ALERT'
    this.targetState = 'DISTRACTED';
    this.stateTimer = 0;
    this.stateDuration = 3.5;
    this.suspicion = 0; // 0..100%

    // Состояние извлечения предмета
    this.progress = 0; // 0..100%
    this.isExtracting = false;
    this.isCaught = false;
    this.isStolen = false;

    // Позиция руки / захвата
    this.handY = 0;
    this.pullSpeed = 0;
    this.lastPointerY = 0;
    this.pointerDown = false;

    // Частицы монет и золотого блеска
    this.particles = [];

    // Привязанные события
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundResize = this.setupCanvas.bind(this);
  }

  init() {
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    this.reset();
    this.startAnimationLoop();
  }

  renderDOM() {
    this.container.innerHTML = `
      <div class="stage-container pickpocket-stage">
        <div class="stage-header">
          <h2 class="stage-title">🪙 Карманная кража</h2>
          <p class="stage-subtitle">Тяните предмет, пока жертва отвлечена. Замрите при малейшем подозрении!</p>
        </div>

        <div class="pickpocket-layout">
          <!-- Индикатор внимания жертвы -->
          <div class="npc-awareness-card" id="npcAwarenessBox">
            <div class="awareness-header">
              <span class="awareness-icon" id="awarenessIcon">🍺</span>
              <div class="awareness-info">
                <span class="awareness-label">Внимание жертвы:</span>
                <span class="awareness-status" id="awarenessStatus">Отвлечён (Громко смеется)</span>
              </div>
            </div>
            
            <div class="suspicion-bar-wrap">
              <div class="suspicion-label-row">
                <span>Уровень подозрения:</span>
                <span id="suspicionVal">0%</span>
              </div>
              <div class="suspicion-track">
                <div class="suspicion-fill" id="suspicionFill" style="width: 0%;"></div>
              </div>
            </div>
          </div>

          <!-- Холст сцены кошеля и извлечения -->
          <div class="pickpocket-canvas-wrapper">
            <canvas id="pickpocketCanvas" class="game-canvas"></canvas>
            
            <div class="extraction-progress-overlay">
              <div class="progress-label-row">
                <span>Извлечение добычи:</span>
                <span id="extractionPercent">0%</span>
              </div>
              <div class="extraction-track">
                <div class="extraction-fill" id="extractionFill" style="width: 0%;"></div>
              </div>
            </div>
          </div>

          <!-- Сенсорная педаль / кнопка для мобильных устройств -->
          <div class="pickpocket-controls-row">
            <button type="button" class="btn fantasy-btn primary" id="btnTouchSteal" style="min-width: 240px; padding: 12px 24px; font-size: 1rem;">
              <span>🤏</span> Тянуть добычу (Удерживать)
            </button>
          </div>
        </div>

        <div class="lock-controls-guide" style="margin-top: 14px;">
          <div class="guide-pill">
            <span class="guide-key">Удерживать ЛКМ / Кнопку</span>
            <span>Осторожно тянуть предмет</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Отпустить</span>
            <span>Замереть и спрятать руку</span>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#pickpocketCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.awarenessIcon = this.container.querySelector('#awarenessIcon');
    this.awarenessStatus = this.container.querySelector('#awarenessStatus');
    this.suspicionVal = this.container.querySelector('#suspicionVal');
    this.suspicionFill = this.container.querySelector('#suspicionFill');
    this.extractionPercent = this.container.querySelector('#extractionPercent');
    this.extractionFill = this.container.querySelector('#extractionFill');
    this.btnTouchSteal = this.container.querySelector('#btnTouchSteal');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const width = Math.min(460, Math.min(window.innerWidth - 48, 460));
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
    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('resize', this.boundResize);

    const startStealing = (e) => {
      e.preventDefault();
      this.pointerDown = true;
      this.isExtracting = true;
      audio.ensureContext();
    };
    const stopStealing = (e) => {
      e.preventDefault();
      this.pointerDown = false;
      this.isExtracting = false;
    };

    if (this.btnTouchSteal) {
      this.btnTouchSteal.addEventListener('pointerdown', startStealing);
      this.btnTouchSteal.addEventListener('pointerup', stopStealing);
      this.btnTouchSteal.addEventListener('pointerleave', stopStealing);
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
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('resize', this.boundResize);
  }

  reset() {
    this.targetState = 'DISTRACTED';
    this.stateTimer = 0;
    this.stateDuration = 3.0 + Math.random() * 1.5;
    this.suspicion = 0;
    this.progress = 0;
    this.isExtracting = false;
    this.isCaught = false;
    this.isStolen = false;
    this.pointerDown = false;
    this.particles = [];
    this.updateHUD();
  }

  // --- ВЗАИМОДЕЙСТВИЕ ---
  onPointerDown(e) {
    if (this.isCaught || this.isStolen) return;
    this.pointerDown = true;
    this.isExtracting = true;
    this.lastPointerY = e.clientY;
    audio.ensureContext();
  }

  onPointerMove(e) {
    if (!this.pointerDown || this.isCaught || this.isStolen) return;
    const dy = this.lastPointerY - e.clientY;
    this.lastPointerY = e.clientY;

    if (dy > 0) {
      // Тянем предмет вверх
      this.pullSpeed = dy * 0.15;
    }
  }

  onPointerUp() {
    this.pointerDown = false;
    this.isExtracting = false;
  }

  // --- АНИМАЦИОННЫЙ ЦИКЛ ---
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

    // 1. Смена фаз внимания жертвы
    this.stateTimer += dt;
    if (this.stateTimer >= this.stateDuration) {
      this.stateTimer = 0;
      this.advanceTargetState();
    }

    // 2. Обработка вытягивания предмета
    const baseSpeed = (12 + dnd.bonus * 1.5) * dt; // скорость извлечения в %
    if (this.isExtracting) {
      if (this.targetState === 'DISTRACTED') {
        // Безопасное вытягивание
        this.progress = Math.min(100, this.progress + baseSpeed);
        // Звон монет с вероятностью
        if (Math.random() < 0.08) {
          audio.playTumblerClick(1.5 + Math.random() * 0.5);
          this.spawnCoinSparkle();
        }
      } else if (this.targetState === 'SUSPICIOUS') {
        // Опасно: тянем, когда жертва насторожилась!
        this.progress = Math.min(100, this.progress + baseSpeed * 0.7);
        this.suspicion = Math.min(100, this.suspicion + 40 * dt);
        audio.playCoinJingle();
      } else if (this.targetState === 'ALERT') {
        // КАТАСТРОФА: тянем прямо под взглядом жертвы!
        this.suspicion = Math.min(100, this.suspicion + 120 * dt);
        audio.playCoinJingle();
        this.app.addNoise(20 * dt);
      }
    } else {
      // Если игрок замер, подозрение медленно спадает
      if (this.suspicion > 0 && this.targetState !== 'ALERT') {
        this.suspicion = Math.max(0, this.suspicion - 25 * dt);
      }
    }

    // 3. Проверка провала (подозрение 100%)
    if (this.suspicion >= 100) {
      this.triggerCaught();
      return;
    }

    // 4. Проверка победы (извлечение 100%)
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

  advanceTargetState() {
    const states = ['DISTRACTED', 'SUSPICIOUS', 'ALERT'];
    if (this.targetState === 'DISTRACTED') {
      // Из отвлеченного переходит в подозрительное
      this.targetState = 'SUSPICIOUS';
      this.stateDuration = 1.0 + Math.random() * 0.8;
      audio.playTick(false);
    } else if (this.targetState === 'SUSPICIOUS') {
      // Из подозрительного может обернуться (ALERT) или успокоиться обратно
      if (Math.random() > 0.4) {
        this.targetState = 'ALERT';
        this.stateDuration = 1.5 + Math.random() * 1.0;
        audio.playTick(true);
      } else {
        this.targetState = 'DISTRACTED';
        this.stateDuration = 3.0 + Math.random() * 1.5;
      }
    } else {
      // Из тревоги успокаивается обратно в отвлеченное
      this.targetState = 'DISTRACTED';
      this.stateDuration = 3.0 + Math.random() * 2.0;
    }
  }

  updateHUD() {
    if (this.awarenessIcon && this.awarenessStatus) {
      if (this.targetState === 'DISTRACTED') {
        this.awarenessIcon.textContent = '🍺';
        this.awarenessStatus.textContent = 'Отвлечён (Пьет эль / Зевает)';
        this.awarenessStatus.style.color = '#22c55e';
      } else if (this.targetState === 'SUSPICIOUS') {
        this.awarenessIcon.textContent = '👂';
        this.awarenessStatus.textContent = 'Насторожился (Прислушивается)';
        this.awarenessStatus.style.color = '#f59e0b';
      } else {
        this.awarenessIcon.textContent = '👁️';
        this.awarenessStatus.textContent = 'ОБЕРНУЛСЯ! (Проверяет пояс)';
        this.awarenessStatus.style.color = '#ef4444';
      }
    }

    if (this.suspicionFill && this.suspicionVal) {
      const s = Math.round(this.suspicion);
      this.suspicionFill.style.width = `${s}%`;
      this.suspicionVal.textContent = `${s}%`;
      this.suspicionFill.style.background = s < 40 ? '#22c55e' : s < 75 ? '#f59e0b' : '#ef4444';
    }

    if (this.extractionFill && this.extractionPercent) {
      const p = Math.round(this.progress);
      this.extractionFill.style.width = `${p}%`;
      this.extractionPercent.textContent = `${p}%`;
    }
  }

  triggerCaught() {
    this.isCaught = true;
    audio.playFailure();
    this.app.recordMistake();
    this.app.addNoise(40);
    setTimeout(() => {
      this.app.finishGame(false, { reason: 'pickpocket_detected' });
    }, 800);
  }

  triggerStolenSuccess() {
    this.isStolen = true;
    audio.playCoinJingle();
    audio.playSuccess();
    // Вспышка золотых искр
    for (let i = 0; i < 30; i++) {
      this.spawnCoinSparkle();
    }
    setTimeout(() => {
      this.app.finishGame(true);
    }, 900);
  }

  spawnCoinSparkle() {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const cy = this.logicalHeight * 0.45;
    const a = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4;
    this.particles.push({
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 40,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 1,
      color: Math.random() > 0.4 ? '#ffd666' : '#ffffff',
      size: 2.5 + Math.random() * 3,
      life: 1,
      decay: 0.03
    });
  }

  draw() {
    if (!this.ctx || !this.logicalWidth) return;
    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;
    const cx = w / 2;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Фон (Трактирный сумрак / плащ жертвы)
    this.drawBackground(ctx, w, h);

    // 2. Кожаный ремень жертвы с подвесами
    this.drawBelt(ctx, cx, w);

    // 3. Кожаный кошель с завязками
    this.drawPouch(ctx, cx, h);

    // 4. Предмет, вытягиваемый из кошеля (золотой амулет / кошель)
    this.drawLootItem(ctx, cx, h);

    // 5. Рука вора
    this.drawRogueHand(ctx, cx, h);

    // 6. Искры
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawBackground(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#10121a');
    grad.addColorStop(1, '#07080d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Ткань мантии жертвы на заднем плане
    ctx.fillStyle = '#1c1f2e';
    ctx.beginPath();
    ctx.moveTo(w * 0.15, 0);
    ctx.lineTo(w * 0.85, 0);
    ctx.lineTo(w * 0.95, h);
    ctx.lineTo(w * 0.05, h);
    ctx.fill();
  }

  drawBelt(ctx, cx, w) {
    // Широкий кожаный пояс
    ctx.fillStyle = '#2b1d0c';
    ctx.fillRect(cx - 180, 25, 360, 35);
    ctx.strokeStyle = '#4a3319';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 180, 25, 360, 35);

    // Латунные заклепки на поясе
    ctx.fillStyle = '#d4af37';
    for (let x = cx - 160; x <= cx + 160; x += 40) {
      ctx.beginPath();
      ctx.arc(x, 42, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawPouch(ctx, cx, h) {
    const pouchTopY = 55;
    const pouchHeight = 160;

    // Шнурок подвеса к поясу
    ctx.strokeStyle = '#85582a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 20, 45);
    ctx.lineTo(cx - 15, pouchTopY);
    ctx.moveTo(cx + 20, 45);
    ctx.lineTo(cx + 15, pouchTopY);
    ctx.stroke();

    // Тело кошеля
    const pouchGrad = ctx.createRadialGradient(cx, pouchTopY + 70, 10, cx, pouchTopY + 70, 80);
    pouchGrad.addColorStop(0, '#4a2e1b');
    pouchGrad.addColorStop(0.8, '#2b180d');
    pouchGrad.addColorStop(1, '#170c06');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 40, pouchTopY);
    ctx.bezierCurveTo(cx - 75, pouchTopY + 40, cx - 70, pouchTopY + pouchHeight, cx, pouchTopY + pouchHeight + 10);
    ctx.bezierCurveTo(cx + 70, pouchTopY + pouchHeight, cx + 75, pouchTopY + 40, cx + 40, pouchTopY);
    ctx.closePath();
    ctx.fillStyle = pouchGrad;
    ctx.fill();
    ctx.strokeStyle = '#6d4529';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Завязки и складки горловины
    ctx.fillStyle = '#1c1008';
    ctx.fillRect(cx - 38, pouchTopY, 76, 14);

    ctx.restore();
  }

  drawLootItem(ctx, cx, h) {
    // Предмет поднимается вверх в зависимости от progress (0..100)
    const startY = 170;
    const endY = 70;
    const currentY = startY - (this.progress / 100) * (startY - endY);

    ctx.save();
    // Золотой медальон / артефакт
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = this.progress > 80 ? 15 : 6;

    // Золотая цепочка
    ctx.strokeStyle = '#ffd666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, currentY - 20);
    ctx.lineTo(cx, currentY);
    ctx.stroke();

    // Медальон
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(cx, currentY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Камень в медальоне
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, currentY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawRogueHand(ctx, cx, h) {
    if (!this.isExtracting) return;

    // Тонкие воровские пальцы в черной кожаной перчатке
    const handY = 170 - (this.progress / 100) * 100;
    ctx.save();
    ctx.fillStyle = '#1e2029';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

    // Палец 1
    ctx.beginPath();
    ctx.roundRect(cx - 16, handY - 10, 8, 26, 4);
    ctx.fill();
    ctx.stroke();

    // Палец 2
    ctx.beginPath();
    ctx.roundRect(cx + 8, handY - 10, 8, 26, 4);
    ctx.fill();
    ctx.stroke();

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

  onParametersChanged() {
    this.reset();
  }
}
