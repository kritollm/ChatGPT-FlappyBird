import seedrandom from 'seedrandom';
import { Howl } from 'howler';

export default async function loadFlappyBird() {
  const app = document.getElementById('app')!;

  // Create game container
  app.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    ">
      <h1 style="
        color: #fff;
        text-shadow: 0 0 20px #ff00ff, 0 0 40px #00ffff;
        margin: 10px 0;
        font-size: clamp(18px, 4vw, 32px);
        text-align: center;
        letter-spacing: 3px;
      ">🐦 FLAPPY BIRD - AMIGA EDITION 🎵</h1>

      <div id="gameContainer" style="
        position: relative;
        box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
        border: 3px solid #00ffff;
        border-radius: 10px;
        overflow: hidden;
        margin: 5px;
        max-width: min(600px, 90vw);
        max-height: calc(100vh - 200px);
      ">
        <canvas id="canvas" width="600" height="600" style="
          display: block;
          background: linear-gradient(180deg, #000428 0%, #004e92 100%);
          width: 100%;
          height: auto;
        "></canvas>
        <canvas id="eqCanvas" width="600" height="80" style="
          display: block;
          background: rgba(0, 0, 0, 0.8);
          border-top: 2px solid #00ffff;
          width: 100%;
          height: 60px;
        "></canvas>
        <button id="restartButton" style="
          display: none;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 12px 24px;
          font-size: clamp(16px, 3vw, 20px);
          font-family: 'Courier New', monospace;
          color: #fff;
          border: 2px solid #00ffff;
          border-radius: 5px;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
          z-index: 1000;
        ">Restart Game</button>
      </div>

      <button id="musicButton" style="
        margin: 10px;
        padding: 10px 20px;
        font-size: clamp(14px, 3vw, 18px);
        font-family: 'Courier New', monospace;
        color: #fff;
        border: 2px solid #00ffff;
        border-radius: 5px;
        cursor: pointer;
        text-transform: uppercase;
        font-weight: bold;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
      ">🎵 Start Chiptune Music</button>

      <div style="
        color: #00ffff;
        text-align: center;
        margin: 5px;
        font-size: clamp(11px, 2vw, 14px);
        text-shadow: 0 0 5px rgba(0, 255, 255, 0.8);
      ">
        Klikk, trykk eller touch for å fly | Samle power-ups og mynter!
      </div>
    </div>
  `;

  const seed = 'flappy-seed-' + Date.now();
  const prng = seedrandom(seed);

  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d')!;
  const eqCanvas = document.getElementById('eqCanvas') as HTMLCanvasElement;
  const eqContext = eqCanvas.getContext('2d')!;

  const birdSprite = new Image();

  interface Bird {
    x: number;
    y: number;
    width: number;
    height: number;
    vy: number;
    gravity: number;
    jumpPower: number;
    spriteIndex: number;
    lives: number;
    invincible: boolean;
    rotation: number;
    hasShield: boolean;
    scoreMultiplier: number;
    slowMoActive: boolean;
    magnetActive: boolean;
    trail: Array<{ x: number; y: number; alpha: number }>;
    wingAngle: number;
    wingDirection: number;
  }

  const bird: Bird = {
    x: 50,
    y: 250,
    width: 50,
    height: 50,
    vy: 0,
    gravity: 0.1,
    jumpPower: -3,
    spriteIndex: 0,
    lives: 3,
    invincible: false,
    rotation: 0,
    hasShield: false,
    scoreMultiplier: 1,
    slowMoActive: false,
    magnetActive: false,
    trail: [],
    wingAngle: 0,
    wingDirection: 1,
  };

  const pipeWidth = 50;
  let pipeGap = 100;
  let pipeSpeed = 2;
  let basePipeSpeed = 2;

  let pipes: any[] = [];
  let score = 0;
  let coins = 0;
  let totalCoins = 0;
  let highScore = Number(localStorage.getItem('highScore')) || 0;
  let startTime = Date.now();
  let gameOver = false;
  let gameStarted = false;
  let combo = 0;
  let maxCombo = 0;
  let comboTimer = 0;

  let screenShake = 0;
  let screenShakeX = 0;
  let screenShakeY = 0;

  let currentTrack = 0;

  interface Star {
    x: number;
    y: number;
    size: number;
    speed: number;
    layer: number;
  }

  const stars: Star[] = [];
  const STAR_COUNT = 80;

  let difficultyTimer = 0;
  let difficultyInterval = 15000;

  interface PowerUp {
    x: number;
    y: number;
    type: 'shield' | 'multiplier' | 'slowmo' | 'magnet' | 'star';
    size: number;
    collected: boolean;
  }

  const powerUps: PowerUp[] = [];
  let powerUpSpawnTimer = 0;
  const powerUpSpawnInterval = 10000;

  interface Coin {
    x: number;
    y: number;
    size: number;
    collected: boolean;
    rotation: number;
  }

  const coinsList: Coin[] = [];
  let coinSpawnTimer = 0;
  const coinSpawnInterval = 3000;

  interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    icon: string;
  }

  const achievements: Achievement[] = [
    { id: 'first_score', name: 'First Point', description: 'Score your first point', unlocked: false, icon: '🎯' },
    { id: 'score_10', name: 'Getting Good', description: 'Score 10 points', unlocked: false, icon: '🔥' },
    { id: 'score_25', name: 'Pro Player', description: 'Score 25 points', unlocked: false, icon: '⭐' },
    { id: 'score_50', name: 'Legend', description: 'Score 50 points', unlocked: false, icon: '👑' },
    { id: 'combo_5', name: 'Combo Master', description: 'Get a 5x combo', unlocked: false, icon: '💥' },
    { id: 'combo_10', name: 'Unstoppable', description: 'Get a 10x combo', unlocked: false, icon: '🚀' },
    { id: 'shield_save', name: 'Saved by Shield', description: 'Shield saves you from death', unlocked: false, icon: '🛡️' },
    { id: 'coins_50', name: 'Coin Collector', description: 'Collect 50 coins total', unlocked: false, icon: '💰' },
    { id: 'survive_60', name: 'Survivor', description: 'Survive for 60 seconds', unlocked: false, icon: '⏱️' },
  ];

  let achievementQueue: Achievement[] = [];
  let achievementDisplayTimer = 0;

  function loadAchievements() {
    const stored = localStorage.getItem('achievements');
    if (stored) {
      const savedAchievements = JSON.parse(stored);
      achievements.forEach(achievement => {
        const saved = savedAchievements.find((a: any) => a.id === achievement.id);
        if (saved) achievement.unlocked = saved.unlocked;
      });
    }
  }

  function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }

  function unlockAchievement(id: string) {
    const achievement = achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievementQueue.push(achievement);
      saveAchievements();
      createParticles(canvas.width / 2, 100, 30, '#FFD700');
    }
  }

  function checkAchievements() {
    if (score >= 1) unlockAchievement('first_score');
    if (score >= 10) unlockAchievement('score_10');
    if (score >= 25) unlockAchievement('score_25');
    if (score >= 50) unlockAchievement('score_50');
    if (combo >= 5) unlockAchievement('combo_5');
    if (combo >= 10) unlockAchievement('combo_10');
    if (totalCoins >= 50) unlockAchievement('coins_50');
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    if (elapsedTime >= 60) unlockAchievement('survive_60');
  }

  function drawAchievementNotification() {
    if (achievementQueue.length > 0 && achievementDisplayTimer === 0) {
      achievementDisplayTimer = 180;
    }

    if (achievementDisplayTimer > 0) {
      const achievement = achievementQueue[0];
      const alpha = achievementDisplayTimer < 30 ? achievementDisplayTimer / 30 : 1;

      const boxWidth = 250;
      const boxHeight = 70;
      const boxX = canvas.width - boxWidth - 10;
      const boxY = 10;

      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = 'rgba(0, 0, 0, 0.9)';
      context.fillRect(boxX, boxY, boxWidth, boxHeight);

      context.strokeStyle = '#FFD700';
      context.lineWidth = 2;
      context.strokeRect(boxX, boxY, boxWidth, boxHeight);

      context.font = 'bold 14px Arial';
      context.fillStyle = '#FFD700';
      context.textAlign = 'center';
      context.fillText('🏆 ACHIEVEMENT!', boxX + boxWidth / 2, boxY + 20);

      context.font = '13px Arial';
      context.fillStyle = 'white';
      context.fillText(`${achievement.icon} ${achievement.name}`, boxX + boxWidth / 2, boxY + 40);
      context.font = '10px Arial';
      context.fillStyle = '#aaa';
      context.fillText(achievement.description, boxX + boxWidth / 2, boxY + 57);

      context.restore();

      achievementDisplayTimer--;
      if (achievementDisplayTimer === 0) {
        achievementQueue.shift();
      }
    }
  }

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
  }

  const particles: Particle[] = [];

  function createParticles(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (prng() - 0.5) * 8,
        vy: (prng() - 0.5) * 8,
        life: 60,
        maxLife: 60,
        color,
        size: prng() * 3 + 1,
      });
    }
  }

  function triggerScreenShake(intensity: number) {
    screenShake = intensity;
  }

  function updateScreenShake() {
    if (screenShake > 0) {
      screenShakeX = (prng() - 0.5) * screenShake;
      screenShakeY = (prng() - 0.5) * screenShake;
      screenShake *= 0.9;
      if (screenShake < 0.1) {
        screenShake = 0;
        screenShakeX = 0;
        screenShakeY = 0;
      }
    }
  }

  function updateBirdTrail() {
    bird.trail.push({
      x: bird.x + bird.width / 2,
      y: bird.y + bird.height / 2,
      alpha: 1,
    });

    for (let i = bird.trail.length - 1; i >= 0; i--) {
      bird.trail[i].alpha -= 0.05;
      if (bird.trail[i].alpha <= 0) {
        bird.trail.splice(i, 1);
      }
    }

    if (bird.trail.length > 15) {
      bird.trail.shift();
    }
  }

  function drawBirdTrail() {
    bird.trail.forEach((point, index) => {
      context.save();
      context.globalAlpha = point.alpha * 0.6;
      context.fillStyle = '#00FFFF';
      const size = (index / bird.trail.length) * 8;
      context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      context.restore();
    });
  }

  function spawnCoin() {
    const spawnX = canvas.width;
    let safeToSpawn = true;

    for (const pipe of pipes) {
      const pipeDistance = Math.abs(pipe.x - spawnX);
      if (pipeDistance < 150) {
        safeToSpawn = false;
        break;
      }
    }

    if (safeToSpawn) {
      const safeZoneHeight = canvas.height - 300;
      const y = prng() * safeZoneHeight + 150;

      coinsList.push({
        x: canvas.width,
        y,
        size: 20,
        collected: false,
        rotation: 0,
      });
    }
  }

  function updateCoins() {
    const effectiveSpeed = bird.slowMoActive ? pipeSpeed * 0.5 : pipeSpeed;

    for (let i = coinsList.length - 1; i >= 0; i--) {
      const coin = coinsList[i];
      coin.x -= effectiveSpeed;
      coin.rotation += 0.1;

      if (bird.magnetActive && !coin.collected) {
        const dx = bird.x + bird.width / 2 - coin.x;
        const dy = bird.y + bird.height / 2 - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          coin.x += dx * 0.1;
          coin.y += dy * 0.1;
        }
      }

      if (
        !coin.collected &&
        Math.abs(bird.x + bird.width / 2 - coin.x) < 30 &&
        Math.abs(bird.y + bird.height / 2 - coin.y) < 30
      ) {
        coin.collected = true;
        coins += 1;
        totalCoins += 1;
        createParticles(coin.x, coin.y, 10, '#FFD700');
        coinsList.splice(i, 1);
      } else if (coin.x < -coin.size) {
        coinsList.splice(i, 1);
      }
    }
  }

  function drawCoins() {
    coinsList.forEach((coin) => {
      if (coin.collected) return;

      context.save();
      context.translate(coin.x, coin.y);
      context.rotate(coin.rotation);

      context.fillStyle = '#FFD700';
      context.beginPath();
      context.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = '#FF8C00';
      context.lineWidth = 2;
      context.stroke();

      context.fillStyle = '#FF8C00';
      context.font = 'bold 14px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('$', 0, 0);

      context.restore();
    });
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticles() {
    particles.forEach((p) => {
      const alpha = p.life / p.maxLife;
      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = p.color;
      context.fillRect(p.x, p.y, p.size, p.size);
      context.restore();
    });
  }

  let modAudioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let dataArray: Uint8Array | null = null;
  let bufferLength: number = 0;

  function initAudio() {
    if (!modAudioContext) {
      modAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = modAudioContext.createAnalyser();
      analyser.fftSize = 128;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      analyser.connect(modAudioContext.destination);
    }
  }

  (window as any).stopMusic = () => {
    if (modAudioContext && modAudioContext.state === 'running') {
      modAudioContext.suspend();
    }
    musicPlaying = false;
  };

  function drawEqualizer() {
    if (!analyser || !dataArray || !eqContext) return;

    analyser.getByteFrequencyData(dataArray);

    eqContext.fillStyle = 'rgba(0, 0, 0, 0.3)';
    eqContext.fillRect(0, 0, eqCanvas.width, eqCanvas.height);

    const barWidth = (eqCanvas.width / bufferLength) * 2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * eqCanvas.height;
      const hue = (i * 3 + Date.now() / 20) % 360;
      eqContext.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
      eqContext.fillRect(x, eqCanvas.height - barHeight, barWidth - 1, barHeight);
      x += barWidth;
    }
  }

  function drawCopperBars() {
    context.save();
    const barHeight = 4;
    const numBars = 8;
    const offset = (Date.now() / 20) % (canvas.height + 100);

    for (let i = 0; i < numBars; i++) {
      const y = ((offset + i * 40) % (canvas.height + 100)) - 50;
      const hue = (Date.now() / 30 + i * 45) % 360;

      context.globalAlpha = 0.3;
      const gradient = context.createLinearGradient(0, y, 0, y + barHeight * 4);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0)`);
      gradient.addColorStop(0.5, `hsla(${hue}, 100%, 50%, 0.3)`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

      context.fillStyle = gradient;
      context.fillRect(0, y, canvas.width, barHeight * 4);
    }
    context.restore();
  }

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      const layer = Math.floor(prng() * 3);
      stars.push({
        x: prng() * canvas.width,
        y: prng() * canvas.height,
        size: layer === 0 ? prng() * 1 + 0.5 : layer === 1 ? prng() * 2 + 1 : prng() * 3 + 2,
        speed: layer === 0 ? prng() * 0.3 + 0.1 : layer === 1 ? prng() * 0.6 + 0.3 : prng() * 1 + 0.6,
        layer,
      });
    }
  }

  function updateStars() {
    stars.forEach((star) => {
      star.x -= star.speed;
      if (star.x < 0) {
        star.x = canvas.width;
        star.y = prng() * canvas.height;
      }
    });
  }

  function drawStars() {
    stars.forEach((star) => {
      const alpha = star.layer === 0 ? 0.4 : star.layer === 1 ? 0.7 : 1.0;
      context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      context.fillRect(star.x, star.y, star.size, star.size);
    });
  }

  function updateHighScore() {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore.toString());
    }
  }

  interface HighScoreEntry {
    score: number;
    combo: number;
    date: string;
  }

  function getHighScores(): HighScoreEntry[] {
    const stored = localStorage.getItem('highScores');
    return stored ? JSON.parse(stored) : [];
  }

  function saveHighScore(score: number, combo: number) {
    const scores = getHighScores();
    scores.push({
      score,
      combo,
      date: new Date().toLocaleDateString(),
    });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('highScores', JSON.stringify(scores.slice(0, 5)));
  }

  function spawnPowerUp() {
    const types: Array<'shield' | 'multiplier' | 'slowmo' | 'magnet' | 'star'> = ['shield', 'multiplier', 'slowmo', 'magnet', 'star'];
    const type = types[Math.floor(prng() * types.length)];
    const y = prng() * (canvas.height - 200) + 100;
    powerUps.push({
      x: canvas.width,
      y,
      type,
      size: 30,
      collected: false,
    });
  }

  function updatePowerUps() {
    const effectiveSpeed = bird.slowMoActive ? pipeSpeed * 0.5 : pipeSpeed;

    for (let i = powerUps.length - 1; i >= 0; i--) {
      const powerUp = powerUps[i];
      powerUp.x -= effectiveSpeed;

      if (
        !powerUp.collected &&
        Math.abs(bird.x + bird.width / 2 - powerUp.x) < powerUp.size &&
        Math.abs(bird.y + bird.height / 2 - powerUp.y) < powerUp.size
      ) {
        powerUp.collected = true;

        if (powerUp.type === 'shield') {
          bird.hasShield = true;
          createParticles(powerUp.x, powerUp.y, 20, '#00FFFF');
          setTimeout(() => (bird.hasShield = false), 5000);
        } else if (powerUp.type === 'multiplier') {
          bird.scoreMultiplier = 2;
          createParticles(powerUp.x, powerUp.y, 20, '#FFD700');
          setTimeout(() => (bird.scoreMultiplier = 1), 8000);
        } else if (powerUp.type === 'slowmo') {
          bird.slowMoActive = true;
          createParticles(powerUp.x, powerUp.y, 20, '#9370DB');
          setTimeout(() => (bird.slowMoActive = false), 6000);
        } else if (powerUp.type === 'magnet') {
          bird.magnetActive = true;
          createParticles(powerUp.x, powerUp.y, 20, '#FF1493');
          setTimeout(() => (bird.magnetActive = false), 7000);
        } else if (powerUp.type === 'star') {
          bird.invincible = true;
          createParticles(powerUp.x, powerUp.y, 30, '#FFFF00');
          setTimeout(() => (bird.invincible = false), 5000);
        }

        powerUps.splice(i, 1);
      } else if (powerUp.x < -powerUp.size) {
        powerUps.splice(i, 1);
      }
    }
  }

  function drawPowerUps() {
    powerUps.forEach((powerUp) => {
      if (powerUp.collected) return;

      context.save();
      context.translate(powerUp.x, powerUp.y);
      context.rotate(Date.now() / 500);

      if (powerUp.type === 'shield') {
        context.strokeStyle = '#00FFFF';
        context.lineWidth = 3;
        context.beginPath();
        context.arc(0, 0, powerUp.size / 2, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = 'rgba(0, 255, 255, 0.3)';
        context.fill();
      } else if (powerUp.type === 'multiplier') {
        context.fillStyle = '#FFD700';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('x2', 0, 0);
      } else if (powerUp.type === 'slowmo') {
        context.fillStyle = '#9370DB';
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('⏱️', 0, 0);
      } else if (powerUp.type === 'magnet') {
        context.fillStyle = '#FF1493';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('🧲', 0, 0);
      } else if (powerUp.type === 'star') {
        context.fillStyle = '#FFFF00';
        context.font = 'bold 28px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('⭐', 0, 0);
      }

      context.restore();
    });
  }

  function updateCombo() {
    if (comboTimer > 0) {
      comboTimer--;
      if (comboTimer === 0) {
        combo = 0;
      }
    }
  }

  function drawCombo() {
    if (combo > 1) {
      const scale = 1 + Math.sin(Date.now() / 100) * 0.1;
      context.save();
      context.translate(canvas.width / 2, canvas.height - 100); // Flyttet til bunnen
      context.scale(scale, scale);
      context.font = 'bold 36px Arial'; // Mindre font
      context.fillStyle = '#FFD700';
      context.strokeStyle = '#FF4500';
      context.lineWidth = 2;
      context.textAlign = 'center';
      context.strokeText(`COMBO x${combo}!`, 0, 0);
      context.fillText(`COMBO x${combo}!`, 0, 0);
      context.restore();
    }
  }

  const flapSound = new Howl({
    src: ['https://raw.githubusercontent.com/kritollm/ChatGPT-FlappyBird/main/src/sound/244978_3008343-lq.mp3'],
  });

  let audioCtx: AudioContext | null = null;
  function playScoreBeep() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  function flap() {
    flapSound.play && flapSound.play();
  }

  function increaseDifficulty() {
    basePipeSpeed += 0.5;
    pipeSpeed = basePipeSpeed;
    if (pipeGap > 75) {
      pipeGap -= 5;
    }
  }

  const restartButton = document.getElementById('restartButton')!;
  restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none';
    resetGame();
  });

  function showRestartButton() {
    restartButton.style.display = 'block';
  }

  function resetGame() {
    updateHighScore();
    if (gameOver) {
      saveHighScore(score, maxCombo);
    }
    bird.lives = 3;
    bird.y = canvas.height / 2;
    bird.vy = 0;
    bird.gravity = 0.1;
    bird.invincible = false;
    bird.hasShield = false;
    bird.scoreMultiplier = 1;
    bird.slowMoActive = false;
    bird.magnetActive = false;
    bird.rotation = 0;
    bird.wingAngle = 0;
    bird.wingDirection = 1;
    bird.trail = [];
    pipes = [];
    powerUps.length = 0;
    coinsList.length = 0;
    startTime = Date.now();
    difficultyTimer = 0;
    powerUpSpawnTimer = 0;
    coinSpawnTimer = 0;
    pipeSpeed = 2;
    basePipeSpeed = 2;
    pipeGap = 100;
    score = 0;
    coins = 0;
    combo = 0;
    maxCombo = 0;
    comboTimer = 0;
    screenShake = 0;
    screenShakeX = 0;
    screenShakeY = 0;
    initStars();
    gameOver = false;
    gameStarted = false;
    gameLoop();
  }

  const updateDifficulty = (elapsedTime: number) => {
    if (elapsedTime - difficultyTimer >= difficultyInterval) {
      increaseDifficulty();
      difficultyTimer = elapsedTime;
    }
  };

  function rectsCollide(rect1: any, rect2: any) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  const blinkInterval = 200;

  function updateWingFlapping() {
    const flapSpeed = bird.vy < 0 ? 0.3 : 0.15;
    bird.wingAngle += flapSpeed * bird.wingDirection;
    if (bird.wingAngle > 0.5) {
      bird.wingDirection = -1;
    } else if (bird.wingAngle < -0.5) {
      bird.wingDirection = 1;
    }
  }

  function drawBaseBird() {
    context.save();
    context.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    bird.rotation = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, bird.vy * 0.1));
    context.rotate(bird.rotation);

    if (bird.hasShield) {
      context.strokeStyle = '#00FFFF';
      context.lineWidth = 3;
      context.beginPath();
      context.arc(0, 0, bird.width * 0.8, 0, Math.PI * 2);
      context.stroke();
      context.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      context.lineWidth = 6;
      context.stroke();
    }

    if (bird.magnetActive) {
      context.strokeStyle = '#FF1493';
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.beginPath();
      context.arc(0, 0, 100, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([]);
    }

    if (bird.invincible) {
      context.shadowColor = '#FFFF00';
      context.shadowBlur = 20;
    }

    if (bird.scoreMultiplier > 1) {
      context.fillStyle = '#FFD700';
      context.font = 'bold 16px Arial';
      context.textAlign = 'center';
      context.fillText('x2', 0, -bird.height);
    }

    // Animated wings
    context.fillStyle = '#FFD700';
    context.save();
    context.translate(-bird.width / 4, 0);
    context.rotate(bird.wingAngle);
    context.beginPath();
    context.ellipse(0, 0, 12, 20, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#FF8C00';
    context.lineWidth = 2;
    context.stroke();
    context.restore();

    context.save();
    context.translate(bird.width / 4, 0);
    context.rotate(-bird.wingAngle);
    context.beginPath();
    context.ellipse(0, 0, 12, 20, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#FF8C00';
    context.lineWidth = 2;
    context.stroke();
    context.restore();

    // Bird body
    context.drawImage(
      birdSprite,
      bird.spriteIndex * bird.width,
      0,
      birdSprite.width,
      birdSprite.height,
      -bird.width / 2,
      -bird.height / 2,
      bird.width,
      bird.height
    );

    context.restore();
  }

  function drawBlinkingBird() {
    context.save();
    context.globalAlpha = Math.sin(Date.now() / blinkInterval) * 0.5 + 0.5;
    drawBaseBird();
    context.restore();
  }

  const drawBird = () => {
    if (bird.invincible) {
      drawBlinkingBird();
    } else {
      drawBaseBird();
    }
  };

  function getRandomGapSize() {
    return Math.min(Math.floor(prng() * 50 + 200), 180);
  }

  const maxGapDistance = 200;

  function getRandomPipePosition() {
    const lastPipe = pipes[pipes.length - 1];
    const minUpperPipeY = lastPipe ? lastPipe.upperPipeY + maxGapDistance : 50;
    const gapSize = getRandomGapSize();
    const maxUpperPipeY = canvas.height / 2 - gapSize - maxGapDistance;
    const upperPipeY = Math.floor(prng() * (maxUpperPipeY - minUpperPipeY + 1)) + minUpperPipeY;
    const lowerPipeY = upperPipeY + gapSize + pipeWidth;
    return [upperPipeY, lowerPipeY];
  }

  function updatePipes() {
    pipes = pipes.filter((pipe) => pipe.x > -pipeWidth);
    const lastPipe = pipes[pipes.length - 1];
    if (lastPipe && lastPipe.x < canvas.width) {
      const [upperPipeY, lowerPipeY] = getRandomPipePosition();
      pipes.push({
        x: lastPipe.x + pipeWidth + canvas.width / 2,
        upperPipeY,
        lowerPipeY,
        scored: false,
      });
    } else if (!lastPipe) {
      const [upperPipeY, lowerPipeY] = getRandomPipePosition();
      pipes.push({ x: canvas.width, upperPipeY, lowerPipeY, scored: false });
    }
  }

  function drawPipes() {
    pipes.forEach((pipe, index) => {
      pipe.x -= pipeSpeed;
      if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
        const points = 1 * bird.scoreMultiplier;
        score += points;
        pipe.scored = true;
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        comboTimer = 180;
        playScoreBeep();
        updateHighScore();
        createParticles(bird.x + bird.width / 2, bird.y + bird.height / 2, 15, '#FFD700');
        if (combo > 2) {
          createParticles(bird.x + bird.width / 2, bird.y + bird.height / 2, combo * 5, '#FF4500');
        }
      }

      const hue = (index * 30 + Date.now() / 50) % 360;
      context.fillStyle = `hsl(${hue}, 70%, 50%)`;
      context.fillRect(pipe.x, 0, pipeWidth, pipe.upperPipeY);
      context.fillRect(pipe.x, pipe.lowerPipeY, pipeWidth, canvas.height - pipe.lowerPipeY);

      const gradient = context.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
      gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.5)`);
      gradient.addColorStop(1, `hsla(${hue}, 70%, 40%, 0.5)`);
      context.fillStyle = gradient;
      context.fillRect(pipe.x, 0, pipeWidth, pipe.upperPipeY);
      context.fillRect(pipe.x, pipe.lowerPipeY, pipeWidth, canvas.height - pipe.lowerPipeY);
    });
  }

  function drawHUD() {
    context.font = '24px Arial';
    context.fillStyle = 'white';
    context.strokeStyle = 'black';
    context.lineWidth = 2;

    context.strokeText(`Score: ${score}`, 10, 30);
    context.fillText(`Score: ${score}`, 10, 30);
    context.strokeText(`Lives: ${bird.lives}`, 10, 60);
    context.fillText(`Lives: ${bird.lives}`, 10, 60);
    context.strokeText(`High: ${highScore}`, canvas.width - 120, 30);
    context.fillText(`High: ${highScore}`, canvas.width - 120, 30);

    if (maxCombo > 0) {
      context.strokeText(`Max Combo: ${maxCombo}`, canvas.width - 180, 60);
      context.fillText(`Max Combo: ${maxCombo}`, canvas.width - 180, 60);
    }

    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    context.strokeText(`Time: ${elapsedTime}s`, 10, 90);
    context.fillText(`Time: ${elapsedTime}s`, 10, 90);

    context.fillStyle = '#FFD700';
    context.strokeText(`Coins: ${coins}`, 10, 120);
    context.fillText(`Coins: ${coins}`, 10, 120);

    let yOffset = 150;
    if (bird.hasShield) {
      context.fillStyle = '#00FFFF';
      context.strokeText('🛡️ SHIELD', 10, yOffset);
      context.fillText('🛡️ SHIELD', 10, yOffset);
      yOffset += 30;
    }
    if (bird.scoreMultiplier > 1) {
      context.fillStyle = '#FFD700';
      context.strokeText('⭐ 2x MULTIPLIER', 10, yOffset);
      context.fillText('⭐ 2x MULTIPLIER', 10, yOffset);
      yOffset += 30;
    }
    if (bird.slowMoActive) {
      context.fillStyle = '#9370DB';
      context.strokeText('⏱️ SLOW-MO', 10, yOffset);
      context.fillText('⏱️ SLOW-MO', 10, yOffset);
      yOffset += 30;
    }
    if (bird.magnetActive) {
      context.fillStyle = '#FF1493';
      context.strokeText('🧲 MAGNET', 10, yOffset);
      context.fillText('🧲 MAGNET', 10, yOffset);
      yOffset += 30;
    }
  }

  function drawStartScreen() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const scale = 1 + Math.sin(Date.now() / 300) * 0.1;
    context.save();
    context.translate(canvas.width / 2, canvas.height / 3);
    context.scale(scale, scale);
    context.font = 'bold 48px Arial';
    context.fillStyle = '#FFD700';
    context.strokeStyle = '#FF4500';
    context.lineWidth = 4;
    context.textAlign = 'center';
    context.strokeText('FLAPPY BIRD', 0, 0);
    context.fillText('FLAPPY BIRD', 0, 0);
    context.restore();

    context.font = 'bold 24px Arial';
    context.fillStyle = '#00FFFF';
    context.textAlign = 'center';
    context.fillText('AMIGA EDITION', canvas.width / 2, canvas.height / 3 + 50);

    context.font = '20px Arial';
    context.fillStyle = 'white';
    context.fillText('Klikk eller trykk SPACE for å starte', canvas.width / 2, canvas.height / 2 + 50);
    context.fillText('Samle power-ups!', canvas.width / 2, canvas.height / 2 + 90);

    context.font = '16px Arial';
    context.fillStyle = '#00FFFF';
    context.fillText('⚫ Shield - Beskytter mot ett treff', canvas.width / 2, canvas.height / 2 + 130);
    context.fillStyle = '#FFD700';
    context.fillText('x2 Score Multiplier - Doble poeng', canvas.width / 2, canvas.height / 2 + 160);

    const alpha = Math.sin(Date.now() / 200) * 0.5 + 0.5;
    context.save();
    context.globalAlpha = alpha;
    context.font = 'bold 28px Arial';
    context.fillStyle = '#FF00FF';
    context.fillText('>>> TRYKK SPACE FOR Å STARTE <<<', canvas.width / 2, canvas.height - 100);
    context.restore();
  }

  function drawGameOver() {
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = '48px Arial';
    context.fillStyle = '#FF4444';
    context.strokeStyle = 'black';
    context.lineWidth = 4;
    context.textAlign = 'center';
    context.strokeText('GAME OVER', canvas.width / 2, canvas.height / 2 - 100);
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 100);

    context.font = '24px Arial';
    context.fillStyle = 'white';
    context.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
    context.fillText(`Max Combo: ${maxCombo}`, canvas.width / 2, canvas.height / 2 + 20);

    context.font = 'bold 20px Arial';
    context.fillStyle = '#FFD700';
    context.fillText('TOP 5 SCORES', canvas.width / 2, canvas.height / 2 + 70);

    const highScores = getHighScores();
    context.font = '16px Arial';
    context.fillStyle = 'white';
    highScores.slice(0, 5).forEach((entry, index) => {
      const y = canvas.height / 2 + 100 + index * 25;
      context.fillText(`${index + 1}. ${entry.score} pts (Combo: ${entry.combo}) - ${entry.date}`, canvas.width / 2, y);
    });

    context.textAlign = 'start';
  }

  function handleNewLife() {
    bird.lives -= 1;
    createParticles(bird.x + bird.width / 2, bird.y + bird.height / 2, 30, '#FF4444');
    bird.y = canvas.height / 2;
    bird.vy = 0;
    bird.invincible = true;
    startTime = Date.now();
    setTimeout(() => {
      bird.invincible = false;
    }, 2000);
  }

  const updateBird = () => {
    bird.vy += bird.gravity;
    bird.y += bird.vy;
    bird.spriteIndex = 0;
  };

  const handleInput = () => {
    if (!gameStarted) {
      gameStarted = true;
      startTime = Date.now();
      return;
    }
    bird.vy = bird.jumpPower;
    flap();
  };

  const gameLoop = () => {
    context.save();
    updateScreenShake();
    context.translate(screenShakeX, screenShakeY);

    context.clearRect(-10, -10, canvas.width + 20, canvas.height + 20);

    drawCopperBars();
    updateStars();
    drawStars();
    drawEqualizer();

    if (!gameStarted) {
      drawStartScreen();
      context.restore();
      requestAnimationFrame(gameLoop);
      return;
    }

    const elapsedTime = Date.now() - startTime;

    if (bird.slowMoActive) {
      pipeSpeed = basePipeSpeed * 0.5;
    } else {
      pipeSpeed = basePipeSpeed;
    }

    updateDifficulty(elapsedTime);

    if (elapsedTime - powerUpSpawnTimer >= powerUpSpawnInterval) {
      spawnPowerUp();
      powerUpSpawnTimer = elapsedTime;
    }

    if (elapsedTime - coinSpawnTimer >= coinSpawnInterval) {
      spawnCoin();
      coinSpawnTimer = elapsedTime;
    }

    updateBird();
    updateWingFlapping();
    updateBirdTrail();
    drawBirdTrail();
    drawBird();
    updatePipes();
    drawPipes();
    updatePowerUps();
    drawPowerUps();
    updateCoins();
    drawCoins();
    updateParticles();
    drawParticles();
    updateCombo();
    drawCombo();
    drawHUD();
    checkAchievements();
    drawAchievementNotification();

    const birdRect = {
      x: bird.x,
      y: bird.y,
      width: bird.width,
      height: bird.height,
    };

    gameOver = pipes.some((pipe) => {
      const upperPipeRect = {
        x: pipe.x,
        y: 0,
        width: pipeWidth,
        height: pipe.upperPipeY,
      };
      const lowerPipeRect = {
        x: pipe.x,
        y: pipe.lowerPipeY,
        width: pipeWidth,
        height: canvas.height - pipe.lowerPipeY,
      };

      if (
        !bird.invincible &&
        (rectsCollide(birdRect, upperPipeRect) ||
          rectsCollide(birdRect, lowerPipeRect) ||
          bird.y < 0 ||
          bird.y + bird.height > canvas.height)
      ) {
        if (bird.hasShield) {
          bird.hasShield = false;
          createParticles(bird.x + bird.width / 2, bird.y + bird.height / 2, 40, '#00FFFF');
          bird.invincible = true;
          unlockAchievement('shield_save');
          triggerScreenShake(10);
          setTimeout(() => (bird.invincible = false), 1000);
          return false;
        }

        if (bird.lives > 1) {
          triggerScreenShake(15);
          handleNewLife();
          return false;
        } else {
          triggerScreenShake(20);
          return true;
        }
      }
      return false;
    });

    context.restore();

    if (!gameOver) {
      requestAnimationFrame(gameLoop);
    } else {
      drawGameOver();
      updateHighScore();
      saveHighScore(score, maxCombo);
      showRestartButton();
    }
  };

  // Input handlers
  canvas.addEventListener('mousedown', handleInput);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleInput();
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      handleInput();
      if (gameStarted) {
        bird.gravity = 0.05;
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      if (gameStarted) {
        bird.gravity = 0.1;
      }
    }
  });

  // Music
  const musicTracks = [
    [
      { freq: 523.25, time: 0 },
      { freq: 587.33, time: 0.15 },
      { freq: 659.25, time: 0.3 },
      { freq: 783.99, time: 0.45 },
      { freq: 659.25, time: 0.6 },
      { freq: 587.33, time: 0.75 },
      { freq: 523.25, time: 0.9 },
      { freq: 440.0, time: 1.05 },
    ],
    [
      { freq: 659.25, time: 0 },
      { freq: 783.99, time: 0.1 },
      { freq: 880.0, time: 0.2 },
      { freq: 783.99, time: 0.3 },
      { freq: 659.25, time: 0.4 },
      { freq: 587.33, time: 0.5 },
      { freq: 523.25, time: 0.6 },
      { freq: 587.33, time: 0.7 },
    ],
    [
      { freq: 261.63, time: 0 },
      { freq: 329.63, time: 0.2 },
      { freq: 392.0, time: 0.4 },
      { freq: 523.25, time: 0.6 },
      { freq: 392.0, time: 0.8 },
      { freq: 329.63, time: 1.0 },
      { freq: 293.66, time: 1.2 },
      { freq: 261.63, time: 1.4 },
    ],
  ];

  let musicPlaying = false;

  function playRetroMusic() {
    if (musicPlaying) return;
    musicPlaying = true;

    initAudio();

    function playChiptuneLoop() {
      if (!modAudioContext || !analyser) return;

      const notes = musicTracks[currentTrack];
      notes.forEach((note) => {
        const osc = modAudioContext!.createOscillator();
        const gain = modAudioContext!.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(note.freq, modAudioContext!.currentTime + note.time);

        gain.gain.setValueAtTime(0.1, modAudioContext!.currentTime + note.time);
        gain.gain.exponentialRampToValueAtTime(0.01, modAudioContext!.currentTime + note.time + 0.15);

        osc.connect(gain);
        gain.connect(analyser!);

        osc.start(modAudioContext!.currentTime + note.time);
        osc.stop(modAudioContext!.currentTime + note.time + 0.15);
      });

      const trackDuration = currentTrack === 0 ? 1200 : currentTrack === 1 ? 800 : 1600;
      setTimeout(playChiptuneLoop, trackDuration);
    }

    playChiptuneLoop();
  }

  const musicButton = document.getElementById('musicButton')!;
  musicButton.addEventListener('click', () => {
    if (!musicPlaying) {
      playRetroMusic();
      musicButton.textContent = '🎵 Next Track';
    } else {
      currentTrack = (currentTrack + 1) % 3;
      musicButton.textContent = `🎵 Track ${currentTrack + 1}`;
    }
  });

  // Load bird sprite and start
  birdSprite.width = 500;
  birdSprite.height = 500;
  birdSprite.onload = () => {
    loadAchievements();
    initStars();
    resetGame();
  };
  birdSprite.onerror = () => {
    console.error('Failed to load bird sprite');
  };
  birdSprite.src = 'https://cdn.jsdelivr.net/gh/kritollm/ChatGPT-FlappyBird@main/src/gfx/dallebird.png';
}
