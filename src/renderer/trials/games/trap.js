/**
 * Модуль мини-игры: Обезвреживание ловушки (Trap Disarming)
 * Интерактивный механизм ловушки с цветными проводами, руническими контактами,
 * манометром давления/натяжения, правилами сапёра и физикой искр/дыма.
 */

import { audio } from '../audio.js';
import { dnd } from '../dnd-engine.js';

export class TrapGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;

    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;

    // Параметры состояния ловушки
    this.wires = []; // массив проводов
    this.rules = []; // текстовые правила обезвреживания
    this.disarmedWiresCount = 0;
    this.targetCutsRequired = 3;
    this.pressure = 65; // Давление детонатора 0..100%
    this.pressureTarget = 65;
    this.isBypassActive = false; // Удержание предохранительного клапана
    this.isDisarmed = false;
    this.isDetonated = false;

    // Взаимодействие
    this.hoveredWire = null;
    this.particles = [];
    this.shakeAmount = 0;
    this.corePulse = 0;

    // Привязанные события
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseLeave = this.onMouseLeave.bind(this);
    this.boundResize = this.setupCanvas.bind(this);
  }

  init() {
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    this.generateTrapPuzzle();
    this.startAnimationLoop();
  }

  renderDOM() {
    this.container.innerHTML = `
      <div class="stage-container trap-stage">
        <div class="stage-header">
          <h2 class="stage-title">💣 Обезвреживание ловушки</h2>
          <p class="stage-subtitle">Изучите руническую гравировку механизма и перекусите нужные провода в верном порядке.</p>
        </div>

        <div class="trap-layout">
          <!-- Левая панель: Свиток с правилами разрядки детонатора -->
          <div class="trap-scroll-panel" id="trapRulesPanel">
            <div class="scroll-header">
              <span class="scroll-icon">📜</span>
              <h3 class="scroll-title">Рунический манускрипт детонатора</h3>
            </div>
            <div class="scroll-clues" id="trapCluesList">
              <!-- Генерируется динамически -->
            </div>
            <div class="thief-intuition" id="thiefIntuitionBox">
              <span class="intuition-icon">💡</span>
              <span class="intuition-text" id="intuitionText">Внимание вора: оцениваем контур...</span>
            </div>
          </div>

          <!-- Центральный холст механизма ловушки -->
          <div class="trap-canvas-wrapper">
            <div class="trap-manometer-hud">
              <div class="manometer-label-row">
                <span>Манометр детонатора:</span>
                <span class="manometer-val" id="pressureVal">65% (Высокое)</span>
              </div>
              <div class="pressure-track">
                <div class="pressure-fill" id="pressureBar" style="width: 65%;"></div>
                <div class="pressure-safe-zone" title="Безопасная зона размыкания"></div>
              </div>
            </div>

            <canvas id="trapCanvas" class="game-canvas"></canvas>

            <div class="trap-controls-row">
              <button type="button" class="btn fantasy-btn secondary" id="btnPressureBypass">
                <span>🛡️</span> Удерживать клапан стравливания
              </button>
            </div>
          </div>
        </div>

        <div class="lock-controls-guide" style="margin-top: 14px;">
          <div class="guide-pill">
            <span class="guide-key">ЛКМ / Тап по проводу</span>
            <span>Перекусить кусачками</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Клапан стравливания</span>
            <span>Понижает давление в контуре</span>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#trapCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.cluesList = this.container.querySelector('#trapCluesList');
    this.intuitionBox = this.container.querySelector('#thiefIntuitionBox');
    this.intuitionText = this.container.querySelector('#intuitionText');
    this.pressureVal = this.container.querySelector('#pressureVal');
    this.pressureBar = this.container.querySelector('#pressureBar');
    this.btnPressureBypass = this.container.querySelector('#btnPressureBypass');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const width = Math.min(520, Math.min(window.innerWidth - 48, 520));
    const height = 380;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.logicalWidth = width;
    this.logicalHeight = height;

    this.recalculateWireGeometry();
  }

  bindEvents() {
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('click', this.boundMouseDown);
    this.canvas.addEventListener('mouseleave', this.boundMouseLeave);
    window.addEventListener('resize', this.boundResize);

    // Кнопка стравливания давления (удержание мыши или пальца)
    const activateBypass = (e) => {
      e.preventDefault();
      this.isBypassActive = true;
      audio.playSteamHiss(0.3);
    };
    const deactivateBypass = (e) => {
      e.preventDefault();
      this.isBypassActive = false;
    };

    if (this.btnPressureBypass) {
      this.btnPressureBypass.addEventListener('mousedown', activateBypass);
      this.btnPressureBypass.addEventListener('mouseup', deactivateBypass);
      this.btnPressureBypass.addEventListener('mouseleave', deactivateBypass);
      this.btnPressureBypass.addEventListener('touchstart', activateBypass, { passive: false });
      this.btnPressureBypass.addEventListener('touchend', deactivateBypass);
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.boundMouseMove);
      this.canvas.removeEventListener('click', this.boundMouseDown);
      this.canvas.removeEventListener('mouseleave', this.boundMouseLeave);
    }
    window.removeEventListener('resize', this.boundResize);
  }

  // --- ГЕНЕРАЦИЯ ГОЛОВОЛОМКИ ЛОВУШКИ ---
  generateTrapPuzzle() {
    this.isDisarmed = false;
    this.isDetonated = false;
    this.disarmedWiresCount = 0;
    this.particles = [];
    this.hoveredWire = null;
    this.pressure = 65;
    this.pressureTarget = 65;

    const availableColors = [
      { id: 'red', name: 'Рубиновый (Красный)', hex: '#ef4444', rune: '🔥', runeName: 'Огонь' },
      { id: 'blue', name: 'Сапфировый (Синий)', hex: '#3b82f6', rune: '💧', runeName: 'Вода' },
      { id: 'green', name: 'Изумрудный (Зеленый)', hex: '#10b981', rune: '🌿', runeName: 'Земля' },
      { id: 'yellow', name: 'Янтарный (Желтый)', hex: '#f59e0b', rune: '⚡', runeName: 'Молния' },
      { id: 'purple', name: 'Аметистовый (Фиолетовый)', hex: '#a855f7', rune: '🔮', runeName: 'Эфир' },
      { id: 'black', name: 'Обсидиановый (Черный)', hex: '#334155', rune: '💀', runeName: 'Смерть' }
    ];

    // Количество проводов зависит от DC: от 4 (DC <= 12) до 6 (DC >= 18)
    const wireCount = dnd.dc <= 13 ? 4 : dnd.dc <= 18 ? 5 : 6;

    // Выбираем случайные уникальные провода
    const shuffled = [...availableColors].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, wireCount);

    this.wires = selected.map((col, index) => ({
      index,
      ...col,
      isCut: false,
      cutRatio: 0.5,
      isCorrectNext: false,
      requiresLowPressure: false
    }));

    // Создаем логическую цепочку обезвреживания
    this.createRulesAndSolution();
    this.recalculateWireGeometry();
    this.renderRulesDOM();
    this.updateIntuition();
  }

  createRulesAndSolution() {
    this.rules = [];
    const colorIds = this.wires.map(w => w.id);
    const cutOrder = [];

    // Правило 1: Стартовый провод
    if (colorIds.includes('red') && colorIds.includes('blue')) {
      this.rules.push({
        text: 'Если контур содержит Огонь (🔥) и Воду (💧), первым перекусите <strong>Сапфировый (Синий)</strong> провод для снятия конденсата.',
        targetId: 'blue'
      });
      cutOrder.push('blue');
    } else if (colorIds.includes('yellow')) {
      this.rules.push({
        text: 'Цепь заряжена Молнией (⚡): первым обязательно обесточьте <strong>Янтарный (Желтый)</strong> провод.',
        targetId: 'yellow'
      });
      cutOrder.push('yellow');
    } else {
      const first = this.wires[0].id;
      this.rules.push({
        text: `Начните размыкание с крайнего левого контакта: <strong>${this.wires[0].name}</strong>.`,
        targetId: first
      });
      cutOrder.push(first);
    }

    // Правило 2: Условие по давлению
    if (colorIds.includes('black')) {
      const blackWire = this.wires.find(w => w.id === 'black');
      blackWire.requiresLowPressure = true;
      this.rules.push({
        text: 'ВНИМАНИЕ: Контакт Смерти (💀) сдетонирует при высоком давлении! Режьте Обсидиановый провод <strong>СТРОГО удерживая клапан стравливания</strong> (давление ниже 35%).',
        targetId: 'black'
      });
      cutOrder.push('black');
    } else if (colorIds.includes('green')) {
      this.rules.push({
        text: 'Земляная жила (🌿) стабилизирует контур: перекусите <strong>Изумрудный (Зеленый)</strong> провод вторым шагом.',
        targetId: 'green'
      });
      cutOrder.push('green');
    }

    // Правило 3: Финальный замыкающий провод
    const remaining = this.wires.filter(w => !cutOrder.includes(w.id));
    if (remaining.length > 0) {
      const finalWire = remaining[remaining.length - 1];
      this.rules.push({
        text: `Финальный предохранитель: завершите разрядку, перерезав <strong>${finalWire.name} (${finalWire.rune})</strong>.`,
        targetId: finalWire.id
      });
      cutOrder.push(finalWire.id);
    }

    this.solutionOrder = cutOrder;
    this.targetCutsRequired = cutOrder.length;
    this.updateNextExpectedWire();
  }

  updateNextExpectedWire() {
    const nextTargetId = this.solutionOrder[this.disarmedWiresCount];
    this.wires.forEach(w => {
      w.isCorrectNext = (w.id === nextTargetId && !w.isCut);
    });
  }

  renderRulesDOM() {
    if (!this.cluesList) return;
    this.cluesList.innerHTML = this.rules.map((rule, idx) => `
      <div class="clue-item" id="clue-item-${idx}">
        <span class="clue-num">${idx + 1}</span>
        <p class="clue-text">${rule.text}</p>
      </div>
    `).join('');
  }

  updateIntuition() {
    if (!this.intuitionBox || !this.intuitionText) return;
    const advantage = dnd.getEffectiveAdvantage();

    if (dnd.bonus >= 5 || advantage.toleranceFactor >= 1.4) {
      const nextTargetId = this.solutionOrder[this.disarmedWiresCount];
      const nextWire = this.wires.find(w => w.id === nextTargetId);
      if (nextWire) {
        let hint = `Ваш острый воровской слух улавливает вибрацию: безопасен для резки <strong>${nextWire.name}</strong>.`;
        if (nextWire.requiresLowPressure) {
          hint += ` <em>(Не забудьте стравить давление!)</em>`;
        }
        this.intuitionText.innerHTML = hint;
        this.intuitionBox.style.display = 'flex';
      }
    } else if (dnd.bonus >= 2) {
      this.intuitionText.textContent = 'Интуиция подсказывает сверяться с манометром перед каждым надрезом.';
      this.intuitionBox.style.display = 'flex';
    } else {
      this.intuitionBox.style.display = 'none';
    }
  }

  recalculateWireGeometry() {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const topY = 70;
    const bottomY = this.logicalHeight - 70;
    const count = this.wires.length;
    const margin = 50;
    const step = (this.logicalWidth - margin * 2) / Math.max(1, count - 1);

    this.wires.forEach((wire, i) => {
      const x1 = margin + i * step;
      const x2 = margin + i * step + (Math.sin(i * 1.5) * 20);
      wire.x1 = x1;
      wire.y1 = topY;
      wire.x2 = x2;
      wire.y2 = bottomY;
      // Контрольные точки для кубической кривой Безье
      wire.cp1x = x1 + (i % 2 === 0 ? 30 : -30);
      wire.cp1y = topY + 80;
      wire.cp2x = x2 + (i % 2 === 0 ? -30 : 30);
      wire.cp2y = bottomY - 80;
    });
  }

  // --- ВЗАИМОДЕЙСТВИЕ ---
  onMouseMove(e) {
    if (this.isDisarmed || this.isDetonated) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found = null;
    for (const wire of this.wires) {
      if (wire.isCut) continue;
      if (this.isPointNearWire(mouseX, mouseY, wire, 14)) {
        found = wire;
        break;
      }
    }

    if (found !== this.hoveredWire) {
      this.hoveredWire = found;
      if (found) {
        audio.playTumblerClick(1.4);
      }
    }
  }

  onMouseLeave() {
    this.hoveredWire = null;
  }

  onMouseDown(e) {
    if (this.isDisarmed || this.isDetonated) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (const wire of this.wires) {
      if (wire.isCut) continue;
      if (this.isPointNearWire(mouseX, mouseY, wire, 16)) {
        this.cutWire(wire, mouseX, mouseY);
        break;
      }
    }
  }

  // Проверка попадания курсора на кривую Безье провода
  isPointNearWire(px, py, wire, threshold = 14) {
    // Сэмплируем точки вдоль кривой Безье
    for (let t = 0.15; t <= 0.85; t += 0.05) {
      const it = 1 - t;
      const bx = it * it * it * wire.x1 + 3 * it * it * t * wire.cp1x + 3 * it * t * t * wire.cp2x + t * t * t * wire.x2;
      const by = it * it * it * wire.y1 + 3 * it * it * t * wire.cp1y + 3 * it * t * t * wire.cp2y + t * t * t * wire.y2;
      const dist = Math.hypot(px - bx, py - by);
      if (dist <= threshold) {
        return true;
      }
    }
    return false;
  }

  cutWire(wire, atX, atY) {
    wire.isCut = true;
    const isCorrect = wire.isCorrectNext;
    const pressureViolated = wire.requiresLowPressure && this.pressure > 38;

    if (isCorrect && !pressureViolated) {
      // Верный перерез!
      audio.playWireCut(false);
      audio.playMagicChime(1.1);
      this.spawnSparks(atX, atY, '#22c55e', 25);
      this.disarmedWiresCount++;

      // Подсвечиваем выполненное правило
      const completedIndex = this.disarmedWiresCount - 1;
      const clueEl = this.container.querySelector(`#clue-item-${completedIndex}`);
      if (clueEl) clueEl.classList.add('completed');

      if (this.disarmedWiresCount >= this.targetCutsRequired) {
        // Успех! Ловушка обезврежена!
        this.triggerDisarmSuccess();
      } else {
        this.updateNextExpectedWire();
        this.updateIntuition();
      }
    } else {
      // ОШИБКА! Взрыв капсюля или скачок давления!
      audio.playWireCut(true);
      audio.playExplosion();
      this.shakeAmount = 14;
      this.spawnSparks(atX, atY, '#ef4444', 45);
      this.spawnSmoke(atX, atY, 20);

      this.app.recordMistake();
      this.app.addNoise(30);

      // Скачок давления
      this.pressure = Math.min(100, this.pressure + 25);

      if (this.app.mistakesCount >= dnd.maxAttempts) {
        this.triggerDetonation();
      } else {
        this.updateNextExpectedWire();
        this.updateIntuition();
      }
    }
  }

  triggerDisarmSuccess() {
    this.isDisarmed = true;
    this.hoveredWire = null;
    audio.playSuccess();
    setTimeout(() => {
      this.app.finishGame(true);
    }, 900);
  }

  triggerDetonation() {
    this.isDetonated = true;
    this.hoveredWire = null;
    audio.playFailure();
    this.shakeAmount = 25;
    setTimeout(() => {
      this.app.finishGame(false, { reason: 'trap_triggered' });
    }, 1000);
  }

  // --- АНИМАЦИОННЫЙ ЦИКЛ ---
  startAnimationLoop() {
    const loop = (timestamp) => {
      this.update(timestamp);
      this.draw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  update(timestamp) {
    // Обновление давления
    if (this.isBypassActive) {
      this.pressureTarget = 18; // стравливание
    } else {
      this.pressureTarget = 60 + Math.sin(timestamp * 0.002) * 10;
    }
    this.pressure += (this.pressureTarget - this.pressure) * 0.08;

    if (this.pressureBar && this.pressureVal) {
      const rounded = Math.round(this.pressure);
      this.pressureBar.style.width = `${rounded}%`;
      let desc = rounded <= 35 ? 'Безопасно (Сброшено)' : rounded <= 70 ? 'Умеренное' : 'ОПАСНОСТЬ ВСПЫШКИ!';
      this.pressureVal.textContent = `${rounded}% (${desc})`;
      this.pressureVal.style.color = rounded <= 35 ? '#22c55e' : rounded <= 70 ? '#f59e0b' : '#ef4444';
    }

    // Тряска экрана
    if (this.shakeAmount > 0) {
      this.shakeAmount *= 0.9;
      if (this.shakeAmount < 0.2) this.shakeAmount = 0;
    }

    // Пульсация ядра
    this.corePulse += 0.05;

    // Частицы
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0.1;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    if (!this.ctx || !this.logicalWidth) return;
    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Эффект тряски экрана
    if (this.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * this.shakeAmount;
      const sy = (Math.random() - 0.5) * this.shakeAmount;
      ctx.translate(sx, sy);
    }

    // 1. Фон механической плиты (патинированная бронза / сталь)
    this.drawChassis(ctx, w, h);

    // 2. Верхняя и нижняя клеммные рейки
    this.drawTerminalRails(ctx, w, h);

    // 3. Провода
    this.wires.forEach(wire => this.drawWire(ctx, wire));

    // 4. Центральный рунический капсюль детонатора
    this.drawDetonatorCore(ctx, w / 2, h / 2);

    // 5. Искры и дым
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawChassis(ctx, w, h) {
    // Внутренняя металлическая панель
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#151821');
    grad.addColorStop(0.5, '#1e2230');
    grad.addColorStop(1, '#0f1118');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Заклёпки по углам
    ctx.fillStyle = '#64748b';
    const rivets = [
      [14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14],
      [w / 2, 14], [w / 2, h - 14]
    ];
    rivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  drawTerminalRails(ctx, w, h) {
    // Верхняя рейка
    ctx.fillStyle = '#2a2f42';
    ctx.fillRect(20, 20, w - 40, 50);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.strokeRect(20, 20, w - 40, 50);

    // Нижняя рейка
    ctx.fillRect(20, h - 70, w - 40, 50);
    ctx.strokeRect(20, h - 70, w - 40, 50);

    // Клеммы проводов с рунами
    this.wires.forEach(wire => {
      // Верхний контакт
      this.drawTerminal(ctx, wire.x1, 45, wire);
      // Нижний контакт
      this.drawTerminal(ctx, wire.x2, h - 45, wire);
    });
  }

  drawTerminal(ctx, x, y, wire) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#1e2230';
    ctx.fill();
    ctx.strokeStyle = wire.hex;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Рунический символ
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(wire.rune, x, y + 1);
    ctx.restore();
  }

  drawWire(ctx, wire) {
    ctx.save();
    const isHovered = (this.hoveredWire === wire && !wire.isCut);

    if (wire.isCut) {
      // Перерезанный провод: две оборванные дуги
      this.drawCutSegment(ctx, wire, 0, 0.45, wire.x1, wire.y1, wire.cp1x, wire.cp1y);
      this.drawCutSegment(ctx, wire, 0.55, 1, wire.x2, wire.y2, wire.cp2x, wire.cp2y);

      // Оголенные искрящиеся концы
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(wire.cp1x * 0.7 + wire.x1 * 0.3, wire.cp1y * 0.7 + wire.y1 * 0.3, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Цельный провод
      ctx.beginPath();
      ctx.moveTo(wire.x1, wire.y1);
      ctx.bezierCurveTo(wire.cp1x, wire.cp1y, wire.cp2x, wire.cp2y, wire.x2, wire.y2);

      // Свечение при наведении кусачек
      if (isHovered) {
        ctx.shadowColor = wire.hex;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 9;
        ctx.stroke();
      }

      // Тень провода
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#0b0d14';
      ctx.lineWidth = 7;
      ctx.stroke();

      // Сам цветной провод
      ctx.shadowBlur = 0;
      ctx.strokeStyle = wire.hex;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Блик по центру провода
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawCutSegment(ctx, wire, tStart, tEnd, xEnd, yEnd, cpx, cpy) {
    ctx.beginPath();
    ctx.moveTo(xEnd, yEnd);
    ctx.quadraticCurveTo(cpx, cpy, (xEnd + cpx) / 2, (yEnd + cpy) / 2);
    ctx.strokeStyle = wire.hex;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  drawDetonatorCore(ctx, cx, cy) {
    ctx.save();
    const pulse = Math.sin(this.corePulse) * 4;
    const radius = 38 + pulse;

    // Внешнее металлическое кольцо
    ctx.beginPath();
    ctx.arc(cx, cy, 52, 0, Math.PI * 2);
    ctx.fillStyle = '#14161f';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Внутреннее светящееся ядро
    const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
    if (this.isDisarmed) {
      coreGrad.addColorStop(0, '#334155');
      coreGrad.addColorStop(1, '#0f172a');
    } else if (this.isDetonated) {
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.5, '#ef4444');
      coreGrad.addColorStop(1, '#7f1d1d');
    } else {
      const isDangerous = this.pressure > 70;
      coreGrad.addColorStop(0, isDangerous ? '#fee2e2' : '#e0e7ff');
      coreGrad.addColorStop(0.4, isDangerous ? '#ef4444' : '#6366f1');
      coreGrad.addColorStop(1, isDangerous ? '#7f1d1d' : '#312e81');
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Иконка в центре ядра
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.isDisarmed ? '🔒' : this.isDetonated ? '💥' : '⚡', cx, cy);

    ctx.restore();
  }

  spawnSparks(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 3,
        life: 1,
        decay: 0.03 + Math.random() * 0.04,
        gravity: 0.12
      });
    }
  }

  spawnSmoke(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1 - Math.random() * 2,
        color: 'rgba(148, 163, 184, 0.4)',
        size: 10 + Math.random() * 15,
        life: 1,
        decay: 0.02,
        isSmoke: true
      });
    }
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

  reset() {
    this.generateTrapPuzzle();
  }

  onParametersChanged() {
    this.generateTrapPuzzle();
  }
}
