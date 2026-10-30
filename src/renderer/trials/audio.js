/**
 * D&D Audio Engine - Realistic Procedural Physical Synthesizer v2
 * Полностью автономный синтез аутентичных физических звуков (металл, дерево, пружины, монеты, колокола)
 * Без синтетических 8-битных писков — только атмосфера средневекового D&D подземелья.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API не поддерживается в этом браузере', e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Вспомогательный генератор буфера белого/розового шума
  createNoiseBuffer(duration = 0.5) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Розовый шум (сглаживание высоких частот для натуральности)
      data[i] = (lastOut * 0.7) + (white * 0.3);
      lastOut = data[i];
    }
    return buffer;
  }

  // --- МЕХАНИКА ЗАМКОВ И МЕТАЛЛА ---

  // 1. Натуральный щелчок штифта замка (латунь/железо в замочной скважине)
  playTumblerClick(pitch = 1.0) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Щелчок: короткий резкий импульс через узкий полосовой фильтр (металлический резонанс)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.04);
    if (!noise.buffer) return;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2200 * pitch, t);
    bandpass.Q.setValueAtTime(8, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    // Низкий призвук корпуса замка (дерево/чугун)
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(180 * pitch, t);
    bodyGain.gain.setValueAtTime(0.2, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.masterGain);

    noise.start(t);
    bodyOsc.start(t);
    bodyOsc.stop(t + 0.04);
  }

  // 2. Скрип и сопротивление заклинившего штифта (напряжение металла в стиле Skyrim)
  playTensionCreak(intensity = 0.5) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.06;

    // Трение металла: модулированный низкочастотный скрежет
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(dur);
    if (!noise.buffer) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450 + intensity * 350, t);
    filter.Q.setValueAtTime(4, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    // Низкочастотная вибрация пружины штифта
    const springOsc = this.ctx.createOscillator();
    const springGain = this.ctx.createGain();
    springOsc.type = 'sawtooth';
    springOsc.frequency.setValueAtTime(85 + (Math.random() - 0.5) * 20, t);
    springGain.gain.setValueAtTime(0.08 * intensity, t);
    springGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    springOsc.connect(springGain);
    springGain.connect(this.masterGain);

    noise.start(t);
    springOsc.start(t);
    springOsc.stop(t + dur);
  }

  // 3. РЕЗКИЙ ПЕРЕЛОМ ОТМЫЧКИ (Skyrim Snap) — сухой хруст калёной стали и звон обломка
  playPickSnap() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Высокоэнергетический импульс слома стали (громкий резкий треск)
    const crackSource = this.ctx.createBufferSource();
    crackSource.buffer = this.createNoiseBuffer(0.09);
    if (!crackSource.buffer) return;

    const crackFilter = this.ctx.createBiquadFilter();
    crackFilter.type = 'highpass';
    crackFilter.frequency.setValueAtTime(1900, t);

    const crackGain = this.ctx.createGain();
    crackGain.gain.setValueAtTime(0.9, t);
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    crackSource.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(this.masterGain);
    crackSource.start(t);

    // 2. Глухой металлический удар корпуса замка
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(140, t);
    thudOsc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
    thudGain.gain.setValueAtTime(0.6, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);
    thudOsc.start(t);
    thudOsc.stop(t + 0.12);

    // 3. Звон отскочившего и звякнувшего кончика отмычки
    const ringOsc = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();
    ringOsc.type = 'sine';
    ringOsc.frequency.setValueAtTime(4100, t + 0.015);
    ringOsc.frequency.exponentialRampToValueAtTime(3200, t + 0.35);
    ringGain.gain.setValueAtTime(0.35, t + 0.015);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    ringOsc.connect(ringGain);
    ringGain.connect(this.masterGain);
    ringOsc.start(t + 0.015);
    ringOsc.stop(t + 0.35);
  }

  // 4. Тяжёлый щелчок открывшегося ригеля замка
  playLockOpen() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Двойной металлический лязг ригеля: «КЛАК-ЩЁЛК»
    [0, 0.07].forEach((delay, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(idx === 0 ? 320 : 220, t + delay);
      osc.frequency.exponentialRampToValueAtTime(80, t + delay + 0.12);

      gain.gain.setValueAtTime(0.5, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.14);
    });
  }

  // --- МЕХАНИКА ЛОВУШЕК И СНАСТЕЙ ---

  // 5. Перекусывание троса / срез струны кусачками
  playWireCut(isDangerous = false) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Срез: звук смыкания лезвий кусачек
    const snip = this.ctx.createBufferSource();
    snip.buffer = this.createNoiseBuffer(0.06);
    if (!snip.buffer) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isDangerous ? 1200 : 2600, t);
    filter.Q.setValueAtTime(6, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    snip.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    snip.start(t);

    // Хлопок снятого натяжения стального троса
    const thump = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();
    thump.type = 'triangle';
    thump.frequency.setValueAtTime(isDangerous ? 90 : 160, t);
    thump.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    thumpGain.gain.setValueAtTime(0.4, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    thump.connect(thumpGain);
    thumpGain.connect(this.masterGain);
    thump.start(t);
    thump.stop(t + 0.1);
  }

  // 6. Срабатывание взведённой пружины ловушки (тяжёлый железный ЛЯЗГ)
  playExplosion() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Удар молота / боёк сорвался
    const boom = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boom.type = 'sawtooth';
    boom.frequency.setValueAtTime(130, t);
    boom.frequency.exponentialRampToValueAtTime(35, t + 0.4);
    boomGain.gain.setValueAtTime(0.8, t);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    boom.connect(boomGain);
    boomGain.connect(this.masterGain);
    boom.start(t);
    boom.stop(t + 0.45);

    // Металлический звон сорвавшейся мощной пружины
    [320, 580, 840].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 0.95, t + 0.5);
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  // 7. Стравливание клапана / шипение газа
  playSteamHiss(duration = 0.35) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(duration);
    if (!noise.buffer) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2600, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  // --- КАРМАННАЯ КРАЖА И СТЕЛС ---

  // 8. Настоящий мягкий звон монет в кожаном кошеле (тёплые металлические частоты, без писка)
  playCoinJingle(volume = 0.08) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (this._lastCoinTime && t - this._lastCoinTime < 0.14) return; // дебаунс против спама звука
    this._lastCoinTime = t;

    // Мягкий щелчок соударения монет (шумовой транзиент)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.025);
    if (noise.buffer) {
      const nFilter = this.ctx.createBiquadFilter();
      nFilter.type = 'bandpass';
      nFilter.frequency.setValueAtTime(2200, t);
      nFilter.Q.setValueAtTime(2.5, t);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.04 * (volume / 0.08), t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(this.masterGain);
      noise.start(t);
    }

    // Тёплые гармоники золотых/бронзовых монет (1400 - 2400 Гц с быстрым затуханием в коже)
    const tones = [
      { freq: 1380 + (Math.random() - 0.5) * 80, decay: 0.12, gain: 0.05 * (volume / 0.08) },
      { freq: 1980 + (Math.random() - 0.5) * 90, decay: 0.08, gain: 0.035 * (volume / 0.08) },
      { freq: 2450 + (Math.random() - 0.5) * 110, decay: 0.05, gain: 0.02 * (volume / 0.08) }
    ];

    tones.forEach((tone) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.freq, t);

      // Срезаем ультра-высокие частоты, делая звук бархатистым и глухим
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, t);

      gain.gain.setValueAtTime(tone.gain, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + tone.decay);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + tone.decay + 0.02);
    });
  }

  // 8.1. Мягкий шорох ткани и скольжение кожи (при вытягивании кошеля)
  playClothRustle(volume = 0.045) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (this._lastClothTime && t - this._lastClothTime < 0.16) return;
    this._lastClothTime = t;

    const dur = 0.14;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(dur);
    if (!noise.buffer) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(680 + Math.random() * 120, t);
    filter.Q.setValueAtTime(1.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  // 8.1a. Звяканье стальных ключей на кольце
  playKeysClink(volume = 0.075) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (this._lastKeysTime && t - this._lastKeysTime < 0.12) return;
    this._lastKeysTime = t;

    const freqs = [2550 + Math.random() * 100, 3350 + Math.random() * 120, 4150 + Math.random() * 140];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.012);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(5000, t);

      gain.gain.setValueAtTime(0.04 * (volume / 0.075), t + idx * 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.012 + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + idx * 0.012);
      osc.stop(t + idx * 0.012 + 0.08);
    });
  }

  // 8.1b. Сухой шелест свитка / пергамента
  playParchmentRustle(volume = 0.06) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (this._lastParchmentTime && t - this._lastParchmentTime < 0.14) return;
    this._lastParchmentTime = t;

    const dur = 0.12;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(dur);
    if (!noise.buffer) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1450 + Math.random() * 200, t);
    filter.Q.setValueAtTime(1.8, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  // 8.2. Настороженность жертвы (микро-предупреждение: шорох поворота тела)
  playTargetSuspicious() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.playClothRustle(0.06);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(210, t + 0.22);

    gain.gain.setValueAtTime(0.025, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  // 8.3. Тревожный разворот жертвы (глухой кинематографический акцент опасности)
  playTargetAlert() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.22);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, t);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // 8.4. Успешный ловкий срыв кошеля в руку
  playPurseSnatch() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.playCoinJingle(0.12);
    this.playClothRustle(0.07);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.16);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // 9. Тревожный глухой удар сердца (при высоком риске)
  playHeartbeat() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Глухой саб-басовый стук сердца в ушах
    [0, 0.12].forEach((delay, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(i === 0 ? 52 : 42, t + delay);
      osc.frequency.exponentialRampToValueAtTime(32, t + delay + 0.1);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, t + delay);

      gain.gain.setValueAtTime(0.35, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.11);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.12);
    });
  }

  // --- ЗЕЛЬЕВАРЕНИЕ И МАГИЯ ---

  // 10. Раздувание кожаных мехов (мягкий вздох воздуха и гул пламени)
  playBellowsPuff() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.28;

    // Вздох воздуха
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(dur);
    if (!noise.buffer) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.linearRampToValueAtTime(950, t + dur * 0.5);
    filter.frequency.linearRampToValueAtTime(300, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  // 11. Глухой бульк зелья в кипящем котле
  playCauldronBubble() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = 220 + Math.random() * 180;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(startFreq + 180, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // 12. Гул древней арканной руны (глубокий резонанс)
  playRuneHum(freq = 280, duration = 0.35) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.linearRampToValueAtTime(freq * 1.02, t + duration);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  // 13. Бросок кости d20 (стук кости по сукну стола)
  playDiceRoll() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bounces = [0, 0.05, 0.11, 0.18];

    bounces.forEach((delay, idx) => {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.03);
      if (!noise.buffer) return;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500 + idx * 80, t + delay);
      filter.Q.setValueAtTime(5, t + delay);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35 / (idx + 1), t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.03);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(t + delay);
    });
  }

  // --- ИТОГИ ИСПЫТАНИЯ ---

  // 14. Благородный триумфальный перезвон победы (органно-колокольный D&D аккорд)
  playSuccess() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Благородный аккорд D-мажор с колокольными обертонами (D4, F#4, A4, D5)
    const chord = [293.66, 369.99, 440.00, 587.33];

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.001, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.22, t + idx * 0.06 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.85);
    });
  }

  // 15. Мрачный глухой гонг неудачи (провал испытания)
  playFailure() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Глухой удар тюремных врат / низкий гонг (D2, 73.4Hz)
    const gong = this.ctx.createOscillator();
    const gongGain = this.ctx.createGain();
    gong.type = 'triangle';
    gong.frequency.setValueAtTime(73.4, t);
    gong.frequency.exponentialRampToValueAtTime(45, t + 0.7);

    gongGain.gain.setValueAtTime(0.7, t);
    gongGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    gong.connect(gongGain);
    gongGain.connect(this.masterGain);
    gong.start(t);
    gong.stop(t + 0.8);
  }

  // Совместимость со старыми вызовами
  playMagicChime() { this.playTumblerClick(1.3); }
  playTick() {}
}

export const audio = new AudioEngine();
