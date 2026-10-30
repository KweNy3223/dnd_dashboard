/**
 * Модуль мини-игры: Зельеварение (Alchemy Brewing)
 * Управление температурой тигля кузнечными мехами, варка зелья по свитку рецепта,
 * добавление алхимических реагентов и физика пузырьков/дыма.
 */

import { audio } from '../audio.js';
import { dnd } from '../dnd-engine.js';

export class AlchemyGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;

    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;

    // Параметры котла
    this.temperature = 40; // 20..300 °C
    this.tempVelocity = 0;
    this.isBellowsPumping = false;
    this.isBrewed = false;
    this.isRuined = false;

    // Рецепт и шаги
    this.steps = [];
    this.currentStepIndex = 0;
    this.liquidColor = '#8b5cf6'; // Базовый цвет жидкости
    this.targetLiquidColor = '#8b5cf6';

    // Частицы
    this.bubbles = [];
    this.steam = [];
    this.sparks = [];

    // Привязанные события
    this.boundResize = this.setupCanvas.bind(this);
  }

  init() {
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    this.generateRecipe();
    this.startAnimationLoop();
  }

  renderDOM() {
    this.container.innerHTML = `
      <div class="stage-container alchemy-stage">
        <div class="stage-header">
          <h2 class="stage-title">🧪 Зельеварение</h2>
          <p class="stage-subtitle">Управляйте нагревом тигля мехами и добавляйте реагенты в точный момент кипения.</p>
        </div>

        <div class="alchemy-layout">
          <!-- Левая панель: Свиток рецепта -->
          <div class="alchemy-recipe-panel">
            <div class="recipe-header">
              <span class="recipe-icon">📜</span>
              <h3 class="recipe-title">Алхимический трактат</h3>
            </div>
            <div class="recipe-steps-list" id="recipeStepsList">
              <!-- Шаги рецепта -->
            </div>
            
            <div class="current-target-card" id="targetTempBox">
              <span class="target-label">Текущая цель:</span>
              <span class="target-val" id="targetTempText">Зона нагрева: 160°–200°C</span>
            </div>
          </div>

          <!-- Центральная арена: Котел и шкала температуры -->
          <div class="alchemy-cauldron-wrapper">
            <div class="thermometer-hud">
              <div class="thermometer-label-row">
                <span>Температура тигля:</span>
                <span class="thermometer-val" id="tempValueDisplay">40°C (Холодный)</span>
              </div>
              <div class="thermometer-track">
                <div class="thermometer-zone" id="tempTargetZone" style="left: 45%; width: 25%;"></div>
                <div class="thermometer-fill" id="tempFillBar" style="width: 15%;"></div>
              </div>
            </div>

            <canvas id="alchemyCanvas" class="game-canvas"></canvas>

            <div class="bellows-control-row">
              <button type="button" class="btn fantasy-btn primary" id="btnBellows" style="min-width: 260px; padding: 12px 24px;">
                <span>💨</span> Раздувать меха (Удерживать)
              </button>
            </div>
          </div>

          <!-- Правая панель: Полка реагентов -->
          <div class="alchemy-shelf-panel">
            <h4 class="shelf-title">Полка с реагентами:</h4>
            <div class="reagents-grid" id="reagentsGrid">
              <!-- Ингредиенты -->
            </div>
          </div>
        </div>

        <div class="lock-controls-guide" style="margin-top: 14px;">
          <div class="guide-pill">
            <span class="guide-key">Удерживать Меха / ПРОБЕЛ</span>
            <span>Поднимать температуру пламени</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Клик по реагенту</span>
            <span>Бросить в кипящий тигель</span>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#alchemyCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.recipeStepsList = this.container.querySelector('#recipeStepsList');
    this.targetTempText = this.container.querySelector('#targetTempText');
    this.tempValueDisplay = this.container.querySelector('#tempValueDisplay');
    this.tempFillBar = this.container.querySelector('#tempFillBar');
    this.tempTargetZone = this.container.querySelector('#tempTargetZone');
    this.reagentsGrid = this.container.querySelector('#reagentsGrid');
    this.btnBellows = this.container.querySelector('#btnBellows');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const width = Math.min(420, Math.min(window.innerWidth - 48, 420));
    const height = 300;
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
    window.addEventListener('resize', this.boundResize);

    const startBellows = (e) => {
      e.preventDefault();
      this.isBellowsPumping = true;
      audio.playBellowsPuff();
    };
    const stopBellows = (e) => {
      e.preventDefault();
      this.isBellowsPumping = false;
    };

    if (this.btnBellows) {
      this.btnBellows.addEventListener('mousedown', startBellows);
      this.btnBellows.addEventListener('mouseup', stopBellows);
      this.btnBellows.addEventListener('mouseleave', stopBellows);
      this.btnBellows.addEventListener('touchstart', startBellows, { passive: false });
      this.btnBellows.addEventListener('touchend', stopBellows);
    }

    // Клавиша Пробел для поддува
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isBellowsPumping && !this.isBrewed && !this.isRuined) {
        this.isBellowsPumping = true;
        audio.playBellowsPuff();
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isBellowsPumping = false;
        e.preventDefault();
      }
    });
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.boundResize);
  }

  // --- ГЕНЕРАЦИЯ РЕЦЕПТА И РЕАГЕНТОВ ---
  generateRecipe() {
    this.isBrewed = false;
    this.isRuined = false;
    this.temperature = 45;
    this.currentStepIndex = 0;
    this.liquidColor = '#6366f1';
    this.targetLiquidColor = '#6366f1';
    this.bubbles = [];
    this.steam = [];

    const allReagents = [
      { id: 'mandrake', name: 'Корень мандрагоры', icon: '🌿', color: '#10b981' },
      { id: 'phoenix', name: 'Пепел саламандры', icon: '🔥', color: '#ef4444' },
      { id: 'stardust', name: 'Лунная пыльца', icon: '✨', color: '#ffd666' },
      { id: 'fairy_tear', name: 'Слеза феи', icon: '💧', color: '#06b6d4' },
      { id: 'shadow_moss', name: 'Призрачный мох', icon: '🔮', color: '#a855f7' }
    ];

    // Количество шагов зависит от DC: 3 шага (DC <= 16), 4 шага (DC > 16)
    const numSteps = dnd.dc <= 16 ? 3 : 4;
    const shuffledReagents = [...allReagents].sort(() => Math.random() - 0.5);

    // Допустимая погрешность температуры зависит от бонуса персонажа
    const tolerance = 20 + Math.max(0, dnd.bonus * 4); // градусов вокруг оптимума

    this.steps = [];
    for (let i = 0; i < numSteps; i++) {
      const reagent = shuffledReagents[i];
      // Разные целевые температуры для разных шагов
      const targets = [120, 175, 230, 80];
      const targetCenter = targets[i % targets.length];
      const minT = Math.max(30, targetCenter - tolerance);
      const maxT = Math.min(290, targetCenter + tolerance);

      this.steps.push({
        stepNum: i + 1,
        reagent,
        targetCenter,
        minT,
        maxT,
        completed: false
      });
    }

    this.renderShelf(allReagents);
    this.renderRecipeSteps();
    this.updateTargetHUD();
  }

  renderShelf(reagents) {
    if (!this.reagentsGrid) return;
    this.reagentsGrid.innerHTML = reagents.map(r => `
      <button type="button" class="reagent-btn" data-reagent="${r.id}">
        <span class="reagent-icon">${r.icon}</span>
        <span class="reagent-name">${r.name}</span>
      </button>
    `).join('');

    this.reagentsGrid.querySelectorAll('.reagent-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.reagent;
        this.addReagentToCauldron(id);
      });
    });
  }

  renderRecipeSteps() {
    if (!this.recipeStepsList) return;
    this.recipeStepsList.innerHTML = this.steps.map((step, idx) => `
      <div class="recipe-step-item ${idx === this.currentStepIndex ? 'active' : ''} ${step.completed ? 'completed' : ''}" id="recipe-step-${idx}">
        <span class="step-num">${step.stepNum}</span>
        <div class="step-desc">
          <p class="step-action">Всыпать <strong>${step.reagent.name} (${step.reagent.icon})</strong></p>
          <span class="step-range">при температуре ${Math.round(step.minT)}°–${Math.round(step.maxT)}°C</span>
        </div>
      </div>
    `).join('');
  }

  updateTargetHUD() {
    const current = this.steps[this.currentStepIndex];
    if (!current) return;

    if (this.targetTempText) {
      this.targetTempText.textContent = `Требуется: ${Math.round(current.minT)}°–${Math.round(current.maxT)}°C для ${current.reagent.name}`;
    }

    // Позиционируем зеленую зону на термометре
    if (this.tempTargetZone) {
      const leftPercent = (current.minT / 300) * 100;
      const widthPercent = ((current.maxT - current.minT) / 300) * 100;
      this.tempTargetZone.style.left = `${leftPercent}%`;
      this.tempTargetZone.style.width = `${widthPercent}%`;
    }
  }

  addReagentToCauldron(reagentId) {
    if (this.isBrewed || this.isRuined) return;
    const currentStep = this.steps[this.currentStepIndex];
    if (!currentStep) return;

    const isCorrectReagent = (currentStep.reagent.id === reagentId);
    const isTempInRange = (this.temperature >= currentStep.minT && this.temperature <= currentStep.maxT);

    if (isCorrectReagent && isTempInRange) {
      // УСПЕШНОЕ ДОБАВЛЕНИЕ РЕАГЕНТА!
      currentStep.completed = true;
      audio.playCauldronBubble();
      audio.playMagicChime(1.2);

      // Меняем цвет зелья на цвет реагента
      this.targetLiquidColor = currentStep.reagent.color;
      this.spawnIngredientSplash(currentStep.reagent.color);

      this.currentStepIndex++;
      this.renderRecipeSteps();

      if (this.currentStepIndex >= this.steps.length) {
        // Все шаги рецепта завершены!
        this.triggerBrewSuccess();
      } else {
        this.updateTargetHUD();
      }
    } else {
      // ОШИБКА: либо не тот реагент, либо температура не в норме!
      audio.playSteamHiss(0.5);
      audio.playExplosion();
      this.spawnFoulSmoke();

      this.app.recordMistake();
      this.app.addNoise(25);

      if (this.app.mistakesCount >= dnd.maxAttempts) {
        this.triggerBrewRuined();
      }
    }
  }

  triggerBrewSuccess() {
    this.isBrewed = true;
    audio.playSuccess();
    this.targetLiquidColor = '#ffd666'; // Золотой эликсир триумфа

    setTimeout(() => {
      this.app.finishGame(true);
    }, 1100);
  }

  triggerBrewRuined() {
    this.isRuined = true;
    audio.playFailure();
    this.targetLiquidColor = '#1f2937'; // Мутная жижа

    setTimeout(() => {
      this.app.finishGame(false, { reason: 'potion_spoiled' });
    }, 1000);
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
    // 1. Физика температуры
    if (this.isBellowsPumping) {
      // Поддув нагревает
      this.temperature = Math.min(300, this.temperature + 90 * dt);
      if (Math.random() < 0.1) audio.playCauldronBubble();
    } else {
      // Остывание к комнатной температуре (30°C)
      this.temperature = Math.max(30, this.temperature - 32 * dt);
    }

    // 2. Обновление шкалы термометра
    if (this.tempFillBar && this.tempValueDisplay) {
      const rounded = Math.round(this.temperature);
      this.tempFillBar.style.width = `${(rounded / 300) * 100}%`;
      let status = rounded < 70 ? 'Холодный' : rounded < 160 ? 'Теплый' : rounded < 230 ? 'Кипение (Оптимум)' : 'ПЕРЕГРЕВ!';
      this.tempValueDisplay.textContent = `${rounded}°C (${status})`;
      this.tempFillBar.style.background = rounded > 240 ? '#ef4444' : rounded > 130 ? '#22c55e' : '#3b82f6';
    }

    // 3. Генерация пузырьков кипения
    if (this.temperature > 80 && Math.random() < (this.temperature / 300) * 0.4) {
      this.spawnBubble();
    }

    // 4. Обновление пузырей и пара
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y -= b.vy;
      b.life -= b.decay;
      if (b.life <= 0) this.bubbles.splice(i, 1);
    }

    for (let i = this.steam.length - 1; i >= 0; i--) {
      const s = this.steam[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;
      if (s.life <= 0) this.steam.splice(i, 1);
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.life -= sp.decay;
      if (sp.life <= 0) this.sparks.splice(i, 1);
    }
  }

  spawnBubble() {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const surfaceY = this.logicalHeight * 0.58;
    this.bubbles.push({
      x: cx + (Math.random() - 0.5) * 140,
      y: surfaceY + 20 + Math.random() * 20,
      vy: 1.5 + (this.temperature / 100),
      size: 3 + Math.random() * 6,
      life: 1,
      decay: 0.03
    });
  }

  spawnIngredientSplash(color) {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const cy = this.logicalHeight * 0.58;
    for (let i = 0; i < 25; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.sparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 2,
        color,
        size: 3 + Math.random() * 4,
        life: 1,
        decay: 0.035
      });
    }
  }

  spawnFoulSmoke() {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const cy = this.logicalHeight * 0.58;
    for (let i = 0; i < 20; i++) {
      this.steam.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy,
        vx: (Math.random() - 0.5) * 2,
        vy: -2 - Math.random() * 2,
        size: 15 + Math.random() * 20,
        color: 'rgba(50, 50, 50, 0.7)',
        life: 1,
        decay: 0.02
      });
    }
  }

  draw() {
    if (!this.ctx || !this.logicalWidth) return;
    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;
    const cx = w / 2;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Фон (Каменная кладка алхимической лаборатории)
    this.drawBackground(ctx, w, h);

    // 2. Пламя под котлом
    this.drawBrazierFlame(ctx, cx, h);

    // 3. Бронзовый / чугунный котел
    this.drawCauldron(ctx, cx, h);

    // 4. Кипящая жидкость и пузыри
    this.drawPotionLiquid(ctx, cx, h);

    // 5. Пар и брызги
    this.drawParticles(ctx);

    ctx.restore();
  }

  drawBackground(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#10121a');
    grad.addColorStop(1, '#08090d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  drawBrazierFlame(ctx, cx, h) {
    const flameY = h * 0.88;
    const flameIntensity = (this.temperature / 300);

    ctx.save();
    // Свечение углей
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10 + flameIntensity * 30;

    // Пламя
    const flameHeight = 15 + flameIntensity * 40;
    const flameGrad = ctx.createRadialGradient(cx, flameY, 5, cx, flameY, flameHeight);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, '#f59e0b');
    flameGrad.addColorStop(0.8, '#ef4444');
    flameGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.ellipse(cx, flameY - flameHeight * 0.3, 70, flameHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCauldron(ctx, cx, h) {
    const cauldronY = h * 0.62;

    ctx.save();
    // Тело котла (чугун)
    const bodyGrad = ctx.createRadialGradient(cx - 30, cauldronY, 20, cx, cauldronY, 110);
    bodyGrad.addColorStop(0, '#374151');
    bodyGrad.addColorStop(0.6, '#1f2937');
    bodyGrad.addColorStop(1, '#111827');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cauldronY, 95, 75, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Обод горловины котла
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(cx, cauldronY - 20, 92, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }

  drawPotionLiquid(ctx, cx, h) {
    const cauldronY = h * 0.62;
    const surfaceY = cauldronY - 18;

    ctx.save();
    // Поверхность кипящего зелья
    ctx.shadowColor = this.targetLiquidColor;
    ctx.shadowBlur = 15;

    ctx.fillStyle = this.targetLiquidColor;
    ctx.beginPath();
    ctx.ellipse(cx, surfaceY, 82, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Блик на зелье
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx - 20, surfaceY - 3, 40, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Пузырьки
    this.bubbles.forEach(b => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  drawParticles(ctx) {
    // Пар
    this.steam.forEach(s => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life * 0.4);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Искры
    this.sparks.forEach(sp => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sp.life);
      ctx.fillStyle = sp.color;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  reset() {
    this.generateRecipe();
  }

  onParametersChanged() {
    this.generateRecipe();
  }
}
