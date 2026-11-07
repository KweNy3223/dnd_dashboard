/**
 * Модуль мини-игры: Взлом замка (Lockpicking)
 * Механика цилиндра замка в стиле Skyrim/Fallout с динамическими визуальными темами,
 * звуковым микро-откликом, физикой отдачи и поддержкой мыши, клавиатуры и сенсора.
 */

import { audio } from '../audio.js';
import { dnd } from '../dnd-engine.js';
import { getCurrentLanguage } from '../../i18n/translate.js';

export class LockpickGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;

    // Холст и контекст
    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;

    // Параметры состояния замка
    this.cylinderAngle = 0; // 0..90 градусов (при 90 — замок открыт)
    this.targetAngle = 0; // Угол "зелёной зоны" (-80..+80)
    this.pickAngle = 0; // Текущий угол отмычки (-85..+85)
    this.tolerance = 12; // Половина ширины зоны успеха в градусах
    this.maxRotationPossible = 0; // Максимально возможный угол поворота при текущем угле отмычки

    // Физика натяжения и поломки
    this.isTurning = false;
    this.turnSpeed = 140; // градусов в секунду
    this.pickHealth = 100; // 0..100%
    this.pickShake = 0;
    this.strainBend = 0; // Изгиб отмычки при упоре в штифт
    this.pickBroke = false;
    this.wasInSweetSpot = false;

    // Частицы и осколки при поломке отмычки
    this.particles = [];

    // Вспомогательные таймеры
    this.lastTime = 0;
    this.creakSoundCooldown = 0;

    // Тема замка ('iron' | 'dwarven' | 'arcane')
    this.lockTheme = 'iron';

    // Обработчики событий (сохраняем ссылки для очистки)
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
  }

  setTheme(theme) {
    this.lockTheme = theme;
  }

  init() {
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    this.reset();
    this.startAnimationLoop();
  }

  isEn() {
    return this.app?.language === 'en' || getCurrentLanguage() === 'en';
  }

  renderDOM() {
    const isEn = this.isEn();
    this.container.innerHTML = `
      <div class="stage-container lockpick-stage">
        <div class="stage-header">
          <h2 class="stage-title">🗝️ ${isEn ? 'Lockpicking' : 'Взлом замка'}</h2>
          <p class="stage-subtitle">${isEn ? 'Find the sweet spot angle and turn the cylinder completely (90°).' : 'Найдите правильный угол отмычки и поверните цилиндр до упора (90°).'}</p>
        </div>

        <div class="canvas-wrapper">
          <canvas id="lockpickCanvas" class="game-canvas"></canvas>
        </div>

        <!-- Подсказка по управлению и кнопка для планшета -->
        <div class="lock-controls-guide">
          <div class="guide-pill">
            <span class="guide-key">${isEn ? 'Mouse / Swipe' : 'Мышь / Свайп'}</span>
            <span>${isEn ? 'Aim pick' : 'Наклон отмычки'}</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">${isEn ? 'SPACE / LMB' : 'ПРОБЕЛ / ЛКМ'}</span>
            <span>${isEn ? 'Turn cylinder' : 'Поворот замка'}</span>
          </div>
        </div>

        <!-- Сенсорная педаль поворота для телефонов и планшетов -->
        <div style="display: flex; justify-content: center; margin-top: 14px;">
          <button type="button" class="btn fantasy-btn primary" id="btnTouchTurn" style="min-width: 220px; padding: 12px 24px; font-size: 1rem;">
            <span>⚙️</span> ${isEn ? 'Hold to turn' : 'Удерживайте для поворота'}
          </button>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#lockpickCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.touchTurnBtn = this.container.querySelector('#btnTouchTurn');
  }

  setupCanvas() {
    const size = Math.min(480, Math.min(window.innerWidth - 48, 480));
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    this.ctx.scale(dpr, dpr);
    this.canvasLogicalSize = size;
  }

  bindEvents() {
    // Движение мыши/пальца над холстом для наклона отмычки
    this.canvas.addEventListener('pointermove', this.boundPointerMove);
    this.canvas.addEventListener('pointerdown', (e) => {
      // Клик по холсту также может начинать поворот
      if (e.button === 0) {
        this.setTurning(true);
      }
    });
    window.addEventListener('pointerup', () => {
      this.setTurning(false);
    });

    // Клавиатура (Пробел, W, Стрелка Вверх)
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Сенсорная кнопка для пальца
    if (this.touchTurnBtn) {
      this.touchTurnBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.setTurning(true);
      });
      this.touchTurnBtn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        this.setTurning(false);
      });
      this.touchTurnBtn.addEventListener('pointerleave', (e) => {
        e.preventDefault();
        this.setTurning(false);
      });
    }
  }

  onPointerMove(e) {
    if (this.isTurning || this.pickBroke) return;

    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    // Вычисляем угол наклона отмычки (верхняя полусфера)
    let rad = Math.atan2(dx, -dy);
    let deg = (rad * 180) / Math.PI;

    // Ограничиваем угол в пределах -85..+85 градусов
    deg = Math.max(-85, Math.min(85, deg));
    this.pickAngle = deg;

    // Проверка звукового микро-отклика при пересечении зелёной зоны
    this.checkSweetSpotAudioHint();
  }

  onKeyDown(e) {
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
      if (!this.isTurning) {
        this.setTurning(true);
      }
      e.preventDefault();
    } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
      this.pickAngle = Math.max(-85, this.pickAngle - 4);
      this.checkSweetSpotAudioHint();
      e.preventDefault();
    } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
      this.pickAngle = Math.min(85, this.pickAngle + 4);
      this.checkSweetSpotAudioHint();
      e.preventDefault();
    }
  }

  onKeyUp(e) {
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
      this.setTurning(false);
      e.preventDefault();
    }
  }

  setTurning(val) {
    if (this.pickBroke) return;
    this.isTurning = val;
    if (this.touchTurnBtn) {
      if (val) {
        this.touchTurnBtn.classList.add('active');
      } else {
        this.touchTurnBtn.classList.remove('active');
      }
    }
    if (val) {
      audio.ensureContext();
      this.calculateMaxRotation();
    }
  }

  // Расчет зоны успеха и максимального угла поворота
  calculateMaxRotation() {
    const angleDiff = Math.abs(this.pickAngle - this.targetAngle);

    if (angleDiff <= this.tolerance) {
      // Идеально в зоне — замок может повернуться на все 90 градусов!
      this.maxRotationPossible = 90;
    } else {
      // Вне зоны (Skyrim style): чем ближе к цели, тем дальше проворачивается
      const maxMiss = 55; // сектор чувствительности
      if (angleDiff >= maxMiss) {
        // Далеко от зоны: едва дергается (3-4 градуса)
        this.maxRotationPossible = 3.5;
      } else {
        // Прогрессия поворота: подсказывает игроку, приближается ли он к верному углу
        const closeness = Math.pow(1 - (angleDiff - this.tolerance) / (maxMiss - this.tolerance), 1.8);
        this.maxRotationPossible = 3.5 + closeness * 74;
      }
    }
  }

  checkSweetSpotAudioHint() {
    const angleDiff = Math.abs(this.pickAngle - this.targetAngle);
    const inSweet = angleDiff <= this.tolerance * 0.9;

    if (inSweet && !this.wasInSweetSpot) {
      // Игрок только что нащупал зону! Тихий металлический щелчок
      const pitch = 1.0 + (dnd.bonus * 0.04);
      audio.playTumblerClick(pitch);
      this.pickShake = 3; // лёгкое тактильное вздрагивание отмычки
    }
    this.wasInSweetSpot = inSweet;
  }

  // Сброс и запуск нового замка
  reset() {
    this.cylinderAngle = 0;
    this.pickAngle = 0;
    this.pickHealth = 100;
    this.pickShake = 0;
    this.strainBend = 0;
    this.pickBroke = false;
    this.isTurning = false;
    this.wasInSweetSpot = false;
    this.particles = [];

    // Случайный целевой угол отмычки
    this.targetAngle = (Math.random() * 140) - 70; // от -70 до +70

    // Расчет параметров от D&D
    this.onParametersChanged(dnd.getEffectiveAdvantage());

    // Определение темы замка (из селекта мастера или авто по сюжету)
    this.lockTheme = this.app.getLockTheme();
    this.app.setPickDurability(100);
  }

  onParametersChanged(advantage) {
    // Зона успеха честно масштабируется со сложностью (DC) и бонусом персонажа!
    // При DC 15 и бонусе +0: полуширина = 5.2°
    // При DC 10 (легкий замок): полуширина ~7.0° (+бонус)
    // При DC 20 (сложный замок): полуширина ~3.4° (+бонус)
    // При DC 25+ (мастерский замок): полуширина ~1.8° (+бонус)
    // Каждый +1 к бонусу расширяет полуширину на 0.45°!
    const baseTol = 5.2 - ((dnd.dc - 15) * 0.36) + (dnd.bonus * 0.45);
    const advFactor = advantage?.toleranceFactor || 1.0;
    this.tolerance = Math.max(1.8, Math.min(14.0, baseTol)) * advFactor;
    this.durabilityMult = 1.0 + (advantage?.extraDurability || 0) * 0.25;
  }

  start() {
    this.reset();
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }

  // --- ИГРОВОЙ ЦИКЛ (UPDATE & RENDER) ---
  startAnimationLoop() {
    this.lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
      this.lastTime = currentTime;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  update(dt) {
    // 1. Анимация физики осколков сломанной отмычки
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 450 * dt; // гравитация
      p.rot += p.vRot * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.pickBroke) return;

    if (this.isTurning) {
      // Проворачиваем цилиндр к максимально возможному углу
      if (this.cylinderAngle < this.maxRotationPossible) {
        this.cylinderAngle += this.turnSpeed * dt;
        if (this.cylinderAngle >= this.maxRotationPossible) {
          this.cylinderAngle = this.maxRotationPossible;
        }

        // Проверка победы: поворот на 90 градусов!
        if (this.cylinderAngle >= 89.5) {
          this.cylinderAngle = 90;
          this.isTurning = false;
          audio.playLockOpen();
          setTimeout(() => {
            this.app.finishGame(true);
          }, 350);
          return;
        }
      } else {
        // Замок упёрся в штифт! Упор и напряжение
        // При непрерывном нажиме отмычка ломается примерно за 0.8-1.0 секунды,
        // давая возможность аккуратно «прощупывать» угол быстрыми короткими нажатиями (как в Скайриме)
        const strain = 115 * dt * (1 / this.durabilityMult);
        this.pickHealth -= strain;
        const stress = 1 - Math.max(0, this.pickHealth / 100);

        // Интенсивная дрожь отмычки при упоре
        this.pickShake = (Math.random() - 0.5) * (5 + stress * 12);
        this.strainBend = (Math.random() - 0.5) * (stress * 8);

        // Обновляем шкалу прочности в HUD
        this.app.setPickDurability(this.pickHealth);

        // Звук металлического скрипа / напряжения
        this.creakSoundCooldown -= dt;
        if (this.creakSoundCooldown <= 0) {
          audio.playTensionCreak(0.5 + stress * 0.4);
          if (this.app.stealthNoiseEnabled) {
            this.app.addNoise(3.0);
          }
          this.creakSoundCooldown = 0.1;
        }

        // Поломка отмычки!
        if (this.pickHealth <= 0) {
          this.handlePickBreak();
        }
      }
    } else {
      // Игрок отпустил натяжитель — цилиндр быстро возвращается в исходное положение
      if (this.cylinderAngle > 0) {
        this.cylinderAngle -= this.turnSpeed * 2.2 * dt;
        if (this.cylinderAngle < 0) this.cylinderAngle = 0;
      }
      // В Скайриме отмычка НЕ регенерирует прочность! Накопленная усталость остаётся
      this.pickShake = 0;
      this.strainBend = 0;
    }
  }

  handlePickBreak() {
    this.pickBroke = true;
    this.isTurning = false;
    this.cylinderAngle = 0;
    this.pickShake = 0;
    this.strainBend = 0;

    audio.playPickSnap();

    // Создаём взрыв металлических осколков и искр
    for (let i = 0; i < 14; i++) {
      const angle = (Math.random() * Math.PI) + Math.PI; // Вверх и в стороны
      const speed = 70 + Math.random() * 200;
      this.particles.push({
        x: 0,
        y: -6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 15,
        color: Math.random() > 0.4 ? '#d9e0ed' : '#ffd166',
        life: 0.6 + Math.random() * 0.4
      });
    }

    // Сообщаем главному контроллеру: отнимаем 1 отмычку
    const hasMorePicks = this.app.onPickBroke();

    if (hasMorePicks) {
      // Игрок достаёт новую отмычку через 750мс
      setTimeout(() => {
        this.pickHealth = 100;
        this.app.setPickDurability(100);
        this.pickBroke = false;
        this.pickAngle = 0;
        audio.playTumblerClick(0.9);
      }, 750);
    }
  }

  // --- ОТРИСОВКА ЗАМКА НА ХОЛСТЕ ---
  render() {
    const ctx = this.ctx;
    const size = this.canvasLogicalSize;
    const center = size / 2;

    ctx.clearRect(0, 0, size, size);

    // 1. Отрисовка внешнего декоративного корпуса замка с выбранной темой
    this.drawLockHousing(ctx, center, size);

    // 2. Отрисовка поворотного внутреннего цилиндра
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((this.cylinderAngle * Math.PI) / 180);
    this.drawCylinder(ctx, 0, 0, size * 0.38);
    ctx.restore();

    // 3. Отрисовка натяжителя (поворачивается вместе с цилиндром)
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((this.cylinderAngle * Math.PI) / 180);
    this.drawTensionWrench(ctx, size);
    ctx.restore();

    // 4. Отрисовка отмычки (наклоняется игроком + вибрирует и гнется при нагрузке)
    if (!this.pickBroke) {
      ctx.save();
      ctx.translate(center, center);
      const shakeAngle = (this.pickShake * Math.PI) / 180;
      ctx.rotate(((this.pickAngle) * Math.PI) / 180 + shakeAngle);
      this.drawPick(ctx, size);
      ctx.restore();
    } else {
      // Сообщение о поломке отмычки
      const isEn = this.isEn();
      ctx.save();
      ctx.font = '700 16px Inter, sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 10;
      ctx.fillText(isEn ? '💥 LOCKPICK BROKE!' : '💥 ОТМЫЧКА СЛОМАЛАСЬ!', center, center - 70);

      if (this.app.currentPicks > 0) {
        ctx.font = '500 13px Inter, sans-serif';
        ctx.fillStyle = '#e8c36a';
        ctx.fillText(isEn ? `Taking a new one... (Remaining: ${this.app.currentPicks})` : `Берём новую... (Осталось: ${this.app.currentPicks})`, center, center - 48);
      } else {
        ctx.font = '700 13px Inter, sans-serif';
        ctx.fillStyle = '#f87171';
        ctx.fillText(isEn ? 'All lockpicks depleted!' : 'Все отмычки исчерпаны!', center, center - 48);
      }
      ctx.restore();
    }

    // 5. Отрисовка летящих металлических осколков и искр
    if (this.particles.length > 0) {
      ctx.save();
      ctx.translate(center, center);
      for (const p of this.particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2));
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      }
      ctx.restore();
    }
  }

  // Внешний корпус замка
  drawLockHousing(ctx, c, size) {
    const rOuter = size * 0.46;
    const rBevel = size * 0.42;

    // ГНОМЬЯ ТЕМА: зубья шестеренок по внешнему ободу
    if (this.lockTheme === 'dwarven') {
      const teethCount = 16;
      ctx.fillStyle = '#8f7026';
      for (let i = 0; i < teethCount; i++) {
        const a = (i * Math.PI * 2) / teethCount;
        ctx.save();
        ctx.translate(c, c);
        ctx.rotate(a);
        ctx.fillRect(rOuter - 4, -7, 14, 14);
        ctx.restore();
      }
    }

    // Внешнее металлическое кольцо
    const grad = ctx.createRadialGradient(c, c, rBevel * 0.7, c, c, rOuter);
    if (this.lockTheme === 'dwarven') {
      grad.addColorStop(0, '#54411a');
      grad.addColorStop(0.7, '#8f7026');
      grad.addColorStop(1, '#2c220c');
    } else if (this.lockTheme === 'arcane') {
      grad.addColorStop(0, '#1c182c');
      grad.addColorStop(0.7, '#392a54');
      grad.addColorStop(1, '#0e0b17');
    } else {
      // Iron
      grad.addColorStop(0, '#222631');
      grad.addColorStop(0.7, '#383f52');
      grad.addColorStop(1, '#13151c');
    }

    ctx.beginPath();
    ctx.arc(c, c, rOuter, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Заклёпки или руны по кругу корпуса
    const markerCount = 8;
    for (let i = 0; i < markerCount; i++) {
      const angle = (i * Math.PI * 2) / markerCount;
      const rx = c + Math.cos(angle) * (rOuter - 14);
      const ry = c + Math.sin(angle) * (rOuter - 14);

      if (this.lockTheme === 'arcane') {
        // Мистические светящиеся точки-глифы
        ctx.beginPath();
        ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Металлические заклепки
        ctx.beginPath();
        ctx.arc(rx, ry, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.lockTheme === 'dwarven' ? '#d4af37' : '#6b758e';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Если арканная тема — рунический светящийся контур с символами
    if (this.lockTheme === 'arcane') {
      ctx.beginPath();
      ctx.arc(c, c, rBevel, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Внутренний поворотный сердечник
  drawCylinder(ctx, x, y, radius) {
    const grad = ctx.createRadialGradient(x - radius * 0.2, y - radius * 0.2, 5, x, y, radius);
    if (this.lockTheme === 'dwarven') {
      grad.addColorStop(0, '#caa243');
      grad.addColorStop(0.6, '#937323');
      grad.addColorStop(1, '#4c390f');
    } else if (this.lockTheme === 'arcane') {
      grad.addColorStop(0, '#4a3d69');
      grad.addColorStop(0.6, '#2a223d');
      grad.addColorStop(1, '#13101c');
    } else {
      grad.addColorStop(0, '#535d75');
      grad.addColorStop(0.6, '#363d4e');
      grad.addColorStop(1, '#1b1e27');
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#090b0e';
    ctx.stroke();

    // Замочная скважина в центре
    ctx.fillStyle = '#050608';
    ctx.beginPath();
    // Верхний круг скважины
    ctx.arc(x, y - 6, 7, 0, Math.PI * 2);
    ctx.fill();
    // Нижняя треугольная прорезь
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 6);
    ctx.lineTo(x - 2.5, y + 26);
    ctx.lineTo(x + 2.5, y + 26);
    ctx.lineTo(x + 5, y - 6);
    ctx.closePath();
    ctx.fill();
  }

  // Натяжитель (Tension Wrench)
  drawTensionWrench(ctx, size) {
    ctx.save();
    ctx.translate(0, 16);

    // Рычаг натяжителя из полированной стали
    ctx.strokeStyle = '#c0c7d6';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 45);
    ctx.lineTo(size * 0.38, 55);
    ctx.stroke();

    ctx.restore();
  }

  // Отмычка (Lockpick) с физическим изгибом под нагрузкой
  drawPick(ctx, size) {
    ctx.save();
    ctx.translate(0, -6);

    const bend = this.strainBend * 1.8;
    const pickLength = size * 0.42;

    ctx.strokeStyle = '#d9e0ed';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    // Изогнутый кончик внутри скважины
    ctx.moveTo(2, 4);
    ctx.lineTo(0, 0);
    // Искривление лезвия отмычки под нагрузкой
    ctx.quadraticCurveTo(bend * 2, -pickLength * 0.5, 0, -pickLength);
    ctx.stroke();

    // Рукоятка отмычки
    ctx.strokeStyle = '#8a4f27';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.28);
    ctx.lineTo(0, -size * 0.44);
    ctx.stroke();

    // Латунные обоймы на рукоятке
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -size * 0.29);
    ctx.lineTo(4, -size * 0.29);
    ctx.moveTo(-4, -size * 0.43);
    ctx.lineTo(4, -size * 0.43);
    ctx.stroke();

    ctx.restore();
  }
}
