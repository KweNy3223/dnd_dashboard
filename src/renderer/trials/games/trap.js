/**
 * Модуль мини-игры: Обезвреживание ловушки (Trap Disarming)
 * Аутентичный средневековый D&D механизм: стальные витые тросы, медные струны-растяжки,
 * свинцовые трубки ядовитого газа, взведённый боёк натяжителя и переключаемый стопорный клин.
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

    // Параметры механизма ловушки
    this.wires = []; // массив спусковых жил / тросов
    this.rules = []; // текстовые правила обезвреживания
    this.solutionOrder = [];
    this.disarmedWiresCount = 0;
    this.targetCutsRequired = 3;
    this.pressure = 70; // Натяжение / давление 0..100%
    this.pressureTarget = 70;
    this.isBypassActive = false; // Установлен ли стопорный клин (Toggle)
    this.isDisarmed = false;
    this.isDetonated = false;

    // Взаимодействие и визуальные эффекты
    this.hoveredWire = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.particles = [];
    this.shakeAmount = 0;
    this.corePulse = 0;
    this.gearAngle = 0;

    // Привязанные события
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundMouseLeave = this.onMouseLeave.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
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
          <h2 class="stage-title">💣 Обезвреживание механизма ловушки</h2>
          <p class="stage-subtitle">Изучите натяжные тросы и срежьте спусковые жилы в верной последовательности.</p>
        </div>

        <div class="trap-layout">
          <!-- Левая панель: Свиток с описанием механизма и правилами -->
          <div class="trap-scroll-panel" id="trapRulesPanel">
            <div class="scroll-header">
              <span class="scroll-icon">📜</span>
              <h3 class="scroll-title">Памятка вора: Схема ловушки</h3>
            </div>
            <div class="scroll-clues" id="trapCluesList">
              <!-- Генерируется динамически -->
            </div>
            <div class="thief-intuition" id="thiefIntuitionBox">
              <span class="intuition-icon">💡</span>
              <span class="intuition-text" id="intuitionText">Воровское чутьё: прислушиваемся к храповику...</span>
            </div>
          </div>

          <!-- Центральный холст механизма ловушки -->
          <div class="trap-canvas-wrapper">
            <div class="trap-manometer-hud">
              <div class="manometer-label-row">
                <span>Индикатор натяжения пружин:</span>
                <span class="manometer-val" id="pressureVal">70% (Взведено)</span>
              </div>
              <div class="pressure-track">
                <div class="pressure-fill" id="pressureBar" style="width: 70%;"></div>
                <div class="pressure-safe-zone" title="Безопасная зона со стопорным клином"></div>
              </div>
            </div>

            <canvas id="trapCanvas" class="game-canvas"></canvas>

            <!-- Переключаемый стопорный клин (Toggle) -->
            <div class="trap-controls-row">
              <button type="button" class="btn fantasy-btn secondary" id="btnPressureBypass" style="min-width: 340px; padding: 10px 20px;">
                <span id="bypassIcon">🔓</span>
                <span id="bypassText">Вставить стопорный клин (ПРОБЕЛ)</span>
              </button>
            </div>
          </div>
        </div>

        <div class="lock-controls-guide" style="margin-top: 14px;">
          <div class="guide-pill">
            <span class="guide-key">ЛКМ по жиле</span>
            <span>Перекусить кусачками</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Клик по кнопке / ПРОБЕЛ</span>
            <span>Зафиксировать стопорный клин</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Зелёная зона</span>
            <span>Безопасный срез трубок яда и натяжителей</span>
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
    this.bypassIcon = this.container.querySelector('#bypassIcon');
    this.bypassText = this.container.querySelector('#bypassText');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const width = Math.min(540, Math.min(window.innerWidth - 48, 540));
    const height = 370;
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
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('resize', this.boundResize);

    // Клик по кнопке стопорного клина (Toggle)
    if (this.btnPressureBypass) {
      this.btnPressureBypass.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleBypass();
      });
    }
  }

  toggleBypass() {
    if (this.isDisarmed || this.isDetonated) return;
    this.isBypassActive = !this.isBypassActive;

    if (this.isBypassActive) {
      audio.playSteamHiss(0.35);
      audio.playTumblerClick(0.8);
    } else {
      audio.playTumblerClick(1.2);
    }

    this.updateBypassButtonUI();
  }

  updateBypassButtonUI() {
    if (!this.btnPressureBypass || !this.bypassIcon || !this.bypassText) return;

    if (this.isBypassActive) {
      this.btnPressureBypass.classList.add('active');
      this.bypassIcon.textContent = '🔒';
      this.bypassText.textContent = 'Стопорный клин ЗАФИКСИРОВАН (Клик для снятия)';
    } else {
      this.btnPressureBypass.classList.remove('active');
      this.bypassIcon.textContent = '🔓';
      this.bypassText.textContent = 'Вставить стопорный клин (ПРОБЕЛ)';
    }
  }

  onKeyDown(e) {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    if (e.code === 'Space') {
      this.toggleBypass();
      e.preventDefault();
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
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('resize', this.boundResize);
  }

  // --- ГЕНЕРАЦИЯ ГОЛОВОЛОМКИ ЛОВУШКИ ---
  generateTrapPuzzle() {
    this.isDisarmed = false;
    this.isDetonated = false;
    this.disarmedWiresCount = 0;
    this.particles = [];
    this.hoveredWire = null;
    this.pressure = 70;
    this.pressureTarget = 70;
    this.isBypassActive = false;
    this.updateBypassButtonUI();

    // Аутентичные компоненты ловушек D&D
    const availableLines = [
      { id: 'steel_tension', name: 'Стальной натяжной трос (Пружина бойка)', hex: '#e2e8f0', rune: '⚙️', typeName: 'Натяжитель' },
      { id: 'copper_trip', name: 'Медная струна-растяжка (Сенсор плиты)', hex: '#f59e0b', rune: '💧', typeName: 'Растяжка' },
      { id: 'gas_siphon', name: 'Трубка ядовитого газа (Клапан давления)', hex: '#10b981', rune: '🌿', typeName: 'Газовый сифон' },
      { id: 'counterweight', name: 'Балансировочная жила (Противовес лезвия)', hex: '#64748b', rune: '⚡', typeName: 'Противовес' },
      { id: 'arcane_thread', name: 'Руническая нить эфира (Магический контур)', hex: '#c084fc', rune: '🔮', typeName: 'Арканный контур' },
      { id: 'death_core', name: 'Капсюль Смерти (Взрывная спусковая нить)', hex: '#ef4444', rune: '💀', typeName: 'Капсюль' }
    ];

    // Число компонентов зависит от DC (от 4 до 6)
    const count = dnd.dc <= 13 ? 4 : dnd.dc <= 18 ? 5 : 6;
    const shuffled = [...availableLines].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    this.wires = selected.map((line, index) => ({
      index,
      ...line,
      isCut: false,
      isCorrectNext: false,
      requiresLowPressure: false
    }));

    this.createRulesAndSolution();
    this.recalculateWireGeometry();
    this.renderRulesDOM();
    this.updateIntuition();
  }

  createRulesAndSolution() {
    this.rules = [];
    const ids = this.wires.map(w => w.id);
    const cutOrder = [];

    // Правило 1: Первичная деактивация
    if (ids.includes('copper_trip')) {
      this.rules.push({
        text: 'Сперва обезопасьте напольный триггер: срежьте <strong>Медную струну-растяжку (💧)</strong>.',
        targetId: 'copper_trip'
      });
      cutOrder.push('copper_trip');
    } else if (ids.includes('counterweight')) {
      this.rules.push({
        text: 'Ослабьте подвес качающегося лезвия: снимите <strong>Балансировочную жилу (⚡)</strong>.',
        targetId: 'counterweight'
      });
      cutOrder.push('counterweight');
    } else {
      const first = this.wires[0].id;
      this.rules.push({
        text: `Начните со снятия левого затвора: <strong>${this.wires[0].name} (${this.wires[0].rune})</strong>.`,
        targetId: first
      });
      cutOrder.push(first);
    }

    // Правило 2: Работа под давлением (требует стопорного клина)
    if (ids.includes('gas_siphon')) {
      this.rules.push({
        text: '<strong>ВНИМАНИЕ:</strong> Зафиксируйте стопорный клин (зелёная зона), чтобы перекусить <strong>Трубку ядовитого газа (🌿)</strong> без утечки!',
        targetId: 'gas_siphon',
        requiresLowPressure: true
      });
      cutOrder.push('gas_siphon');
    } else if (ids.includes('steel_tension')) {
      this.rules.push({
        text: '<strong>ОПАСНОСТЬ:</strong> Пружина взведена! Вставьте стопорный клин перед срезом <strong>Стального натяжного троса (⚙️)</strong>!',
        targetId: 'steel_tension',
        requiresLowPressure: true
      });
      cutOrder.push('steel_tension');
    }

    // Правило 3: Финальный замок
    const remaining = ids.filter(id => !cutOrder.includes(id));
    if (remaining.includes('arcane_thread')) {
      this.rules.push({
        text: 'Завершите нейтрализацией арканного контура: перекусите <strong>Руническую нить эфира (🔮)</strong>.',
        targetId: 'arcane_thread'
      });
      cutOrder.push('arcane_thread');
    } else if (remaining.includes('death_core')) {
      this.rules.push({
        text: 'Финальный шаг: перекусите <strong>Капсюль Смерти (💀)</strong>, пока стопор удерживает механизм.',
        targetId: 'death_core',
        requiresLowPressure: true
      });
      cutOrder.push('death_core');
    } else if (remaining.length > 0) {
      const last = remaining[remaining.length - 1];
      const wireObj = this.wires.find(w => w.id === last);
      this.rules.push({
        text: `Для окончательного спуска нейтрализуйте: <strong>${wireObj.name} (${wireObj.rune})</strong>.`,
        targetId: last
      });
      cutOrder.push(last);
    }

    this.solutionOrder = cutOrder;
    this.targetCutsRequired = cutOrder.length;

    // Проставляем метки
    this.rules.forEach(rule => {
      const wire = this.wires.find(w => w.id === rule.targetId);
      if (wire && rule.requiresLowPressure) {
        wire.requiresLowPressure = true;
      }
    });

    this.updateNextExpectedWire();
  }

  updateNextExpectedWire() {
    const nextExpectedId = this.solutionOrder[this.disarmedWiresCount];
    this.wires.forEach(w => {
      w.isCorrectNext = (w.id === nextExpectedId);
    });
  }

  renderRulesDOM() {
    if (!this.cluesList) return;
    this.cluesList.innerHTML = this.rules.map((rule, idx) => `
      <div class="clue-item" id="clue-item-${idx}">
        <span class="clue-num">${idx + 1}</span>
        <p class="clue-text" style="margin:0;">${rule.text}</p>
      </div>
    `).join('');
  }

  updateIntuition() {
    if (!this.intuitionBox || !this.intuitionText) return;

    if (dnd.bonus >= 4) {
      const nextTargetId = this.solutionOrder[this.disarmedWiresCount];
      const nextWire = this.wires.find(w => w.id === nextTargetId);
      if (nextWire) {
        let hint = `Острый слух улавливает щелчок храповика: безопасен для среза <strong>${nextWire.name}</strong>.`;
        if (nextWire.requiresLowPressure && !this.isBypassActive) {
          hint += ` <em>(Не забудьте вставить стопорный клин!)</em>`;
        }
        this.intuitionText.innerHTML = hint;
        this.intuitionBox.style.display = 'flex';
      }
    } else if (dnd.bonus >= 2) {
      this.intuitionText.textContent = 'Опыт подсказывает проверять натяжение пружин перед каждым перекусыванием.';
      this.intuitionBox.style.display = 'flex';
    } else {
      this.intuitionBox.style.display = 'none';
    }
  }

  recalculateWireGeometry() {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const topY = 60;
    const bottomY = this.logicalHeight - 65;
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
      wire.cp1x = x1 + (i % 2 === 0 ? 25 : -25);
      wire.cp1y = topY + 70;
      wire.cp2x = x2 + (i % 2 === 0 ? -25 : 25);
      wire.cp2y = bottomY - 70;
    });
  }

  // --- ВЗАИМОДЕЙСТВИЕ ---
  onMouseMove(e) {
    if (this.isDisarmed || this.isDetonated) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;

    let found = null;
    for (const wire of this.wires) {
      if (wire.isCut) continue;
      if (this.isPointNearWire(this.mouseX, this.mouseY, wire, 16)) {
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
      if (this.isPointNearWire(mouseX, mouseY, wire, 18)) {
        this.cutWire(wire, mouseX, mouseY);
        break;
      }
    }
  }

  isPointNearWire(px, py, wire, threshold = 16) {
    for (let t = 0.12; t <= 0.88; t += 0.05) {
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
    const pressureViolated = wire.requiresLowPressure && this.pressure > 35;

    if (isCorrect && !pressureViolated) {
      // Верный перерез троса!
      audio.playWireCut(false);
      this.spawnSparks(atX, atY, '#22c55e', 25);
      this.disarmedWiresCount++;

      const completedIndex = this.disarmedWiresCount - 1;
      const clueEl = this.container.querySelector(`#clue-item-${completedIndex}`);
      if (clueEl) clueEl.classList.add('completed');

      if (this.disarmedWiresCount >= this.targetCutsRequired) {
        this.triggerDisarmSuccess();
      } else {
        this.updateNextExpectedWire();
        this.updateIntuition();
      }
    } else {
      // Ошибка! Срыв бойка / спуск ловушки
      this.triggerDetonation(atX, atY);
    }
  }

  triggerDisarmSuccess() {
    this.isDisarmed = true;
    audio.playLockOpen();
    this.pressureTarget = 0;

    for (let i = 0; i < 40; i++) {
      this.spawnSparks(this.logicalWidth / 2, this.logicalHeight / 2, '#22c55e', 1);
    }

    setTimeout(() => {
      this.app.finishGame(true);
    }, 850);
  }

  triggerDetonation(atX, atY) {
    this.isDetonated = true;
    audio.playWireCut(true);
    audio.playExplosion();
    this.shakeAmount = 24;
    this.spawnSparks(atX, atY, '#ef4444', 50);
    this.spawnSmoke(atX, atY, 30);

    this.app.recordMistake();
    if (this.app.stealthNoiseEnabled) {
      this.app.addNoise(50);
    }

    setTimeout(() => {
      this.app.finishGame(false, { reason: 'trap_triggered' });
    }, 1000);
  }

  // --- АНИМАЦИОННЫЙ ЦИКЛ ---
  startAnimationLoop() {
    const loop = () => {
      this.update();
      this.draw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  update() {
    // Вращение шестерни храповика
    this.gearAngle += this.isBypassActive ? 0.002 : 0.015;

    // Плавное стравливание давления при установке клина
    if (this.isBypassActive) {
      this.pressureTarget = 18;
    } else if (!this.isDisarmed) {
      this.pressureTarget = 70;
    }
    this.pressure += (this.pressureTarget - this.pressure) * 0.12;

    if (this.pressureBar && this.pressureVal) {
      const p = Math.round(this.pressure);
      this.pressureBar.style.width = `${p}%`;
      this.pressureVal.textContent = `${p}% ${p < 30 ? '(Безопасно / Клин в пазу)' : '(Взведено)'}`;
      this.pressureVal.style.color = p < 30 ? '#22c55e' : '#f59e0b';
    }

    // Тряска экрана при детонации
    if (this.shakeAmount > 0) {
      this.shakeAmount *= 0.9;
      if (this.shakeAmount < 0.2) this.shakeAmount = 0;
    }

    this.corePulse += 0.05;

    // Физика искр и дыма
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

    if (this.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * this.shakeAmount;
      const sy = (Math.random() - 0.5) * this.shakeAmount;
      ctx.translate(sx, sy);
    }

    // 1. Кованая каменная/железная основа ловушки
    this.drawChassis(ctx, w, h);

    // 2. Механические шестерни храповика в углах
    this.drawCornerGears(ctx, w, h);

    // 3. Верхняя балка натяжителей и нижний спусковой затвор
    this.drawMountingRails(ctx, w, h);

    // 4. Тросы, растяжки и трубки
    this.wires.forEach(wire => this.drawWire(ctx, wire));

    // 5. Центральный храповой стопорный механизм с клином
    this.drawRatchetMechanism(ctx, w / 2, h / 2);

    // 6. Курсор-кусачки при наведении
    if (this.hoveredWire && !this.isDisarmed && !this.isDetonated) {
      this.drawPliersCursor(ctx, this.mouseX, this.mouseY);
    }

    // 7. Искры и дым
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawChassis(ctx, w, h) {
    // Тёмный гранит подземелья с трещинами и патиной
    const grad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, '#1c1e26');
    grad.addColorStop(0.7, '#13151b');
    grad.addColorStop(1, '#0b0c10');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Железная рама с заклёпками
    ctx.strokeStyle = '#2b2e3b';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    ctx.strokeStyle = '#181a22';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Бронзовые заклёпки по периметру
    ctx.fillStyle = '#85642a';
    const rivets = [
      [14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14],
      [w / 2, 12], [w / 2, h - 12], [12, h / 2], [w - 12, h / 2]
    ];
    rivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#382b14';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  drawCornerGears(ctx, w, h) {
    ctx.save();
    // Две декоративные вращающиеся шестерни в верхних углах
    this.drawSingleGear(ctx, 35, 35, 22, this.gearAngle, '#3b4052');
    this.drawSingleGear(ctx, w - 35, 35, 22, -this.gearAngle, '#3b4052');
    ctx.restore();
  }

  drawSingleGear(ctx, x, y, r, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1b1d26';
    ctx.lineWidth = 1.5;

    const teeth = 8;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const na = ((i + 0.5) / teeth) * Math.PI * 2;
      ctx.lineTo(Math.cos(a) * (r + 4), Math.sin(a) * (r + 4));
      ctx.lineTo(Math.cos(na) * r, Math.sin(na) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#111318';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawMountingRails(ctx, w, h) {
    // Верхняя стальная траверса
    ctx.fillStyle = '#21242f';
    ctx.fillRect(20, 18, w - 40, 42);
    ctx.strokeStyle = '#3f4458';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 18, w - 40, 42);

    // Нижняя балка спускового механизма
    ctx.fillRect(20, h - 58, w - 40, 42);
    ctx.strokeRect(20, h - 58, w - 40, 42);

    // Клеммы фиксации тросов
    this.wires.forEach(wire => {
      this.drawTerminal(ctx, wire.x1, 38, wire, true);
      this.drawTerminal(ctx, wire.x2, h - 38, wire, false);
    });
  }

  drawTerminal(ctx, x, y, wire, isTop) {
    ctx.save();
    // Стальной фланец
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#181a24';
    ctx.fill();
    ctx.strokeStyle = wire.hex;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Иконка компонента
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(wire.rune, x, y);

    // Пружина натяжения под верхним анкером
    if (isTop && !wire.isCut) {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 14);
      ctx.lineTo(x - 3, y + 18);
      ctx.lineTo(x + 3, y + 22);
      ctx.lineTo(x, y + 26);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawWire(ctx, wire) {
    ctx.save();
    const isHovered = (this.hoveredWire === wire && !wire.isCut);

    if (wire.isCut) {
      // Перекусанная обвисшая жила
      this.drawCutSegment(ctx, wire, wire.x1, wire.y1 + 24, wire.cp1x, wire.cp1y);
      this.drawCutSegment(ctx, wire, wire.x2, wire.y2 - 14, wire.cp2x, wire.cp2y);
    } else {
      ctx.beginPath();
      ctx.moveTo(wire.x1, wire.y1 + 24);
      ctx.bezierCurveTo(wire.cp1x, wire.cp1y, wire.cp2x, wire.cp2y, wire.x2, wire.y2 - 14);

      if (isHovered) {
        ctx.shadowColor = wire.hex;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      // Тень троса
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#0a0c10';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Тело троса/жилы
      ctx.shadowBlur = 0;
      ctx.strokeStyle = wire.hex;
      ctx.lineWidth = wire.id === 'gas_siphon' ? 6 : wire.id === 'copper_trip' ? 2.5 : 4.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Текстура витого стального троса или медной струны
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawCutSegment(ctx, wire, xEnd, yEnd, cpx, cpy) {
    ctx.beginPath();
    ctx.moveTo(xEnd, yEnd);
    ctx.quadraticCurveTo(cpx, cpy, (xEnd + cpx) / 2, (yEnd + cpy) / 2);
    ctx.strokeStyle = wire.hex;
    ctx.lineWidth = wire.id === 'gas_siphon' ? 5.5 : 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  drawRatchetMechanism(ctx, cx, cy) {
    ctx.save();

    // 1. Задняя круглая бронзовая плита храповика
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fillStyle = '#171922';
    ctx.fill();
    ctx.strokeStyle = this.isBypassActive ? '#22c55e' : 'rgba(212, 175, 55, 0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 2. Зубчатый храповик
    this.drawSingleGear(ctx, cx, cy, 32, this.gearAngle, '#2a2e3d');

    // 3. Стопорный клин (БРОНЗОВЫЙ КЛИН/ШПЛИНТ В ПАЗУ)
    if (this.isBypassActive) {
      // Клин вбит между зубьями: ярко-зелёная фиксация
      ctx.save();
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 12;

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      // Клин
      ctx.moveTo(cx - 8, cy - 38);
      ctx.lineTo(cx + 8, cy - 38);
      ctx.lineTo(cx + 3, cy - 12);
      ctx.lineTo(cx - 3, cy - 12);
      ctx.closePath();
      ctx.fill();

      // Кольцо клина для выдёргивания
      ctx.beginPath();
      ctx.arc(cx, cy - 44, 9, 0, Math.PI * 2);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    } else {
      // Клин вынут: боёк взведён, индикатор готовности к спуску
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy - 28, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Центральная ступица храповика
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = this.isDisarmed ? '#10b981' : this.isDetonated ? '#ef4444' : '#101217';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Иконка статуса механизма
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.isDisarmed ? '🔒' : this.isDetonated ? '💥' : this.isBypassActive ? '🛡️' : '⚙️', cx, cy);

    ctx.restore();
  }

  drawPliersCursor(ctx, x, y) {
    ctx.save();
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✂️', x + 10, y - 10);
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

  spawnSparks(x, y, color = '#ffd666', count = 18) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color,
        size: 1.5 + Math.random() * 3,
        life: 1,
        decay: 0.03 + Math.random() * 0.04,
        gravity: 0.15
      });
    }
  }

  spawnSmoke(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 0.5 + Math.random() * 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 1,
        color: 'rgba(148, 163, 184, 0.45)',
        size: 8 + Math.random() * 16,
        life: 1,
        decay: 0.02
      });
    }
  }

  onParametersChanged() {
    this.generateTrapPuzzle();
  }
}
