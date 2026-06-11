/* =========================================================
   HAPPY BIRTHDAY KAK TASYA — script.js (v2 — fixed)
   ========================================================= */

// ─── DOM refs ────────────────────────────────────────────
const starsContainer    = document.getElementById('starsContainer');
const particlesEl       = document.getElementById('particles');
const confettiContainer = document.getElementById('confettiContainer');
const fireworksCanvas   = document.getElementById('fireworksCanvas');
const ctx               = fireworksCanvas.getContext('2d');
const introScreen       = document.getElementById('introScreen');
const startBtn          = document.getElementById('startBtn');
const mainWrapper       = document.getElementById('mainWrapper');
const mainSubtitle      = document.getElementById('mainSubtitle');
const micStatus         = document.getElementById('micStatus');
const micIcon           = document.getElementById('micIcon');
const micText           = document.getElementById('micText');
const blowMeterWrap     = document.getElementById('blowMeterWrap');
const blowMeterFill     = document.getElementById('blowMeterFill');
const blowMeterLabel    = document.getElementById('blowMeterLabel');
const flame             = document.getElementById('flame');
const flameGlow         = document.getElementById('flameGlow');
const flameOuter        = document.getElementById('flameOuter');
const smokeContainer    = document.getElementById('smokeContainer');
const birthdayMessage   = document.getElementById('birthdayMessage');
const bgMusic           = document.getElementById('bgMusic');
const musicBtn          = document.getElementById('musicBtn');
const musicIcon         = document.getElementById('musicIcon');

// ─── State ───────────────────────────────────────────────
let candleBlown         = false;
let micActive           = false;
let audioContext        = null;
let analyser            = null;
let micStream           = null;
let animFrameId         = null;
let fireworksActive     = false;
let fireworkParticles   = [];
let musicPlaying        = false;
let appStarted          = false;   // true after start button pressed

// ─── STARS ───────────────────────────────────────────────
function createStars() {
  const count = window.innerWidth < 480 ? 80 : 160;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 3 + 1;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random()*100}%;
      left:${Math.random()*100}%;
      --dur:${(Math.random()*3+2).toFixed(2)}s;
      --delay:${(Math.random()*4).toFixed(2)}s;
    `;
    starsContainer.appendChild(s);
  }
}

// ─── FLOATING PARTICLES ──────────────────────────────────
function createParticles() {
  const colors = ['#c9a0dc','#f9c6d8','#ffe680','#ff9fe5','#ffffff'];
  const count  = window.innerWidth < 480 ? 12 : 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 3;
    const sway = (Math.random() - 0.5) * 120;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      --dur:${(Math.random()*8+6).toFixed(1)}s;
      --delay:${(Math.random()*10).toFixed(1)}s;
      --sway:${sway}px;
    `;
    particlesEl.appendChild(p);
  }
}

// ─── RESIZE CANVAS ───────────────────────────────────────
function resizeCanvas() {
  fireworksCanvas.width  = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─── FIREWORKS ───────────────────────────────────────────
class FireworkParticle {
  constructor(x, y) {
    this.x    = x;
    this.y    = y;
    const ang = Math.random() * Math.PI * 2;
    const spd = Math.random() * 5 + 2;
    this.vx   = Math.cos(ang) * spd;
    this.vy   = Math.sin(ang) * spd;
    this.life = 1;
    this.decay= Math.random() * 0.02 + 0.012;
    this.size = Math.random() * 4 + 2;
    const palette = ['#ffd700','#ff9fe5','#c9a0dc','#ffe680','#ff80c0','#ffffff','#a367c4'];
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.trail = [];
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 6) this.trail.shift();
    this.vy   += 0.07;
    this.vx   *= 0.98;
    this.x    += this.vx;
    this.y    += this.vy;
    this.life -= this.decay;
  }
  draw() {
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = (i / this.trail.length) * this.life * 0.5;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function launchFirework() {
  const x = Math.random() * fireworksCanvas.width;
  const y = Math.random() * fireworksCanvas.height * 0.6;
  const count = window.innerWidth < 480 ? 50 : 80;
  for (let i = 0; i < count; i++) {
    fireworkParticles.push(new FireworkParticle(x, y));
  }
}

let fireworkTimer = 0;
function updateFireworks() {
  if (!fireworksActive) return;
  ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  fireworkTimer++;
  if (fireworkTimer % 28 === 0) launchFirework();
  fireworkParticles = fireworkParticles.filter(p => p.life > 0);
  fireworkParticles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(updateFireworks);
}

function startFireworks() {
  fireworksActive = true;
  launchFirework();
  launchFirework();
  updateFireworks();
  setTimeout(() => {
    fireworksActive = false;
    setTimeout(() => ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height), 1500);
  }, 12000);
}

// ─── CONFETTI ────────────────────────────────────────────
function launchConfetti() {
  const colors = ['#ffd700','#f9c6d8','#c9a0dc','#ff9fe5','#ffe680','#a367c4','#ffffff','#ff80c0'];
  const count  = window.innerWidth < 480 ? 80 : 160;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const sway = (Math.random() - 0.5) * 300;
    piece.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${Math.random()*10+6}px;
      height:${Math.random()*14+8}px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      --dur:${(Math.random()*2.5+2).toFixed(2)}s;
      --delay:${(Math.random()*2).toFixed(2)}s;
      --sway:${sway}px;
      transform:rotate(${Math.random()*360}deg);
    `;
    confettiContainer.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
  setTimeout(launchConfettiWave, 1200);
  setTimeout(launchConfettiWave, 2600);
}

function launchConfettiWave() {
  const colors = ['#ffd700','#f9c6d8','#c9a0dc','#ff9fe5','#ffe680'];
  const count  = window.innerWidth < 480 ? 50 : 90;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const sway = (Math.random() - 0.5) * 200;
    piece.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${Math.random()*8+5}px;
      height:${Math.random()*12+7}px;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      --dur:${(Math.random()*2+2).toFixed(2)}s;
      --delay:${(Math.random()*0.5).toFixed(2)}s;
      --sway:${sway}px;
    `;
    confettiContainer.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

// ─── BLOW OUT CANDLE ─────────────────────────────────────
function blowOutCandle() {
  if (candleBlown) return;
  candleBlown = true;

  stopMic();

  flameOuter.style.transition = 'opacity 0.3s';
  flameOuter.style.opacity    = '0';

  smokeContainer.style.display = 'block';

  setTimeout(() => {
    launchConfetti();
    startFireworks();
  }, 400);

  setTimeout(() => {
    birthdayMessage.style.display = 'block';
    micStatus.style.display = 'none';
  }, 1200);

  setTimeout(() => {
    smokeContainer.style.display = 'none';
  }, 4000);

  // Make music full volume after blowing
  if (musicPlaying) {
    bgMusic.volume = 1;
  } else {
    tryPlayMusic(1);
  }
}

// ─── MUSIC ───────────────────────────────────────────────
function tryPlayMusic(vol) {
  if (musicPlaying) return;
  bgMusic.volume = vol !== undefined ? vol : 0.6;
  const p = bgMusic.play();
  if (p !== undefined) {
    p.then(() => {
      musicPlaying = true;
      musicIcon.textContent = '⏸';
    }).catch(() => {
      // Autoplay still blocked — user can use the play button
    });
  }
}

musicBtn.addEventListener('click', () => {
  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
    musicIcon.textContent = '▶';
  } else {
    bgMusic.volume = 0.6;
    bgMusic.play().then(() => {
      musicPlaying = true;
      musicIcon.textContent = '⏸';
    }).catch(() => {});
  }
});

bgMusic.addEventListener('error', () => {
  document.querySelector('.music-label').textContent = '🎵 (Tambahkan music.mp3)';
});

// ─── MICROPHONE & BLOW DETECTION ─────────────────────────
async function startMic() {
  if (micActive || candleBlown) return;

  micText.textContent = '⏳ Meminta akses mikrofon...';

  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl : false,
        channelCount    : 1
      }
    });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Resume AudioContext on iOS (may be suspended)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const source = audioContext.createMediaStreamSource(micStream);
    analyser     = audioContext.createAnalyser();
    analyser.fftSize       = 512;   // higher resolution
    analyser.smoothingTimeConstant = 0.4;
    source.connect(analyser);

    micActive = true;
    micIcon.textContent         = '🎙️';
    micStatus.classList.add('mic-active');
    micText.textContent         = 'Mikrofon aktif! Sekarang tiup lilinnya! 💨';
    blowMeterWrap.style.display = 'block';
    blowMeterLabel.textContent  = 'Tiup ke arah mikrofon HP kamu!';

    detectBlow();

  } catch (err) {
    console.warn('Mic error:', err);
    micText.textContent = '⚠️ Mikrofon tidak bisa diakses. Ketuk kue untuk mematikan lilin!';
    micIcon.textContent = '⚠️';
    document.getElementById('candleWrap').addEventListener('click', blowOutCandle, { once: true });
    document.querySelector('.cake-art').addEventListener('click', blowOutCandle, { once: true });
  }
}

/*
 * BLOW DETECTION — improved for mobile
 *
 * Strategy:
 *  1. Compute RMS (volume level) from time-domain data.
 *  2. Compute spectral centroid from frequency data.
 *     - Blowing = broadband noise → centroid is HIGH (>1200 Hz)
 *     - Speaking = harmonic content → centroid is LOWER, peaks at voice freqs
 *  3. Require BOTH: high RMS AND high centroid to count as a blow.
 *  4. Lower the sustain requirement so it's not frustrating on mobile.
 */

// Tuning parameters — adjust if needed
const BLOW_RMS_THRESHOLD  = 18;   // lowered for better mobile sensitivity
const BLOW_CENTROID_MIN   = 1000; // Hz — blows have higher centroid than speech
const BLOW_SUSTAIN_MS     = 180;  // must sustain for ~180ms
let   blowSustainStart    = null;

function detectBlow() {
  if (!analyser || candleBlown) return;

  const bufLen      = analyser.fftSize;
  const freqLen     = analyser.frequencyBinCount;
  const timeData    = new Uint8Array(bufLen);
  const freqData    = new Uint8Array(freqLen);

  function loop() {
    if (candleBlown || !micActive) return;
    animFrameId = requestAnimationFrame(loop);

    // ── RMS (volume) ──────────────────────────────────
    analyser.getByteTimeDomainData(timeData);
    let sum = 0;
    for (let i = 0; i < bufLen; i++) {
      const norm = (timeData[i] - 128) / 128;
      sum += norm * norm;
    }
    const rms   = Math.sqrt(sum / bufLen) * 100;
    const level = Math.min(rms, 100);

    // ── Spectral centroid ────────────────────────────
    analyser.getByteFrequencyData(freqData);
    const sampleRate   = audioContext.sampleRate;
    const nyquist      = sampleRate / 2;
    let weightedSum    = 0;
    let totalMagnitude = 0;
    for (let i = 0; i < freqLen; i++) {
      const freq = (i / freqLen) * nyquist;
      weightedSum    += freq * freqData[i];
      totalMagnitude += freqData[i];
    }
    const centroid = totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;

    // ── UI meter ─────────────────────────────────────
    blowMeterFill.style.width = level + '%';

    // ── Blow detection ────────────────────────────────
    const isBlow = level > BLOW_RMS_THRESHOLD && centroid > BLOW_CENTROID_MIN;

    if (isBlow) {
      if (!blowSustainStart) blowSustainStart = Date.now();
      const progress = Math.min((Date.now() - blowSustainStart) / BLOW_SUSTAIN_MS * 100, 100);
      blowMeterLabel.textContent = `Tiup terus! 💨 ${Math.round(progress)}%`;

      if (Date.now() - blowSustainStart >= BLOW_SUSTAIN_MS) {
        blowOutCandle();
        return;
      }
    } else {
      blowSustainStart = null;
      if (level > BLOW_RMS_THRESHOLD && centroid <= BLOW_CENTROID_MIN) {
        // High volume but sounds like speech
        blowMeterLabel.textContent = 'Terdeteksi suara — coba tiup, bukan bicara 🤫';
      } else if (level > 8) {
        blowMeterLabel.textContent = `Lebih kuat lagi! 💨 (${Math.round(level)}%)`;
      } else {
        blowMeterLabel.textContent = 'Tiup ke mikrofon HP kamu...';
      }
    }
  }
  loop();
}

function stopMic() {
  micActive = false;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (micStream) micStream.getTracks().forEach(t => t.stop());
  if (audioContext) audioContext.close().catch(() => {});
  micStream = audioContext = analyser = null;
}

// ─── MIC STATUS CLICK ────────────────────────────────────
micStatus.addEventListener('click', () => {
  if (!candleBlown && !micActive) {
    startMic();
  }
});

// ─── START BUTTON ─────────────────────────────────────────
startBtn.addEventListener('click', () => {
  if (appStarted) return;
  appStarted = true;

  // 1. Play music — we're inside a user gesture, so it will work
  tryPlayMusic(0.6);

  // 2. Fade out intro screen
  introScreen.classList.add('fade-out');

  // 3. Show main content
  mainWrapper.classList.remove('hidden');

  // 4. Auto-start mic after short delay (give UI time to render)
  setTimeout(() => {
    startMic();
  }, 600);
});

// ─── INIT ────────────────────────────────────────────────
createStars();
createParticles();