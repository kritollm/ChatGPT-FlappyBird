import seedrandom from 'seedrandom';

export default async function loadThunderStrike() {
  const app = document.getElementById('app')!;

  // Create game container with epic 90s styling
  app.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #000000 0%, #1a0033 25%, #0a0520 50%, #000000 100%);
      position: relative;
      overflow: hidden;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
          radial-gradient(circle at 20% 30%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(0, 255, 255, 0.1) 0%, transparent 50%);
        pointer-events: none;
      "></div>

      <h1 style="
        color: #FFD700;
        text-shadow:
          0 0 10px #FFD700,
          0 0 20px #FF00FF,
          0 0 30px #00FFFF,
          0 0 40px #FFD700,
          3px 3px 0px #FF0000,
          -3px -3px 0px #00FFFF;
        margin: 10px 0;
        font-size: clamp(24px, 5vw, 48px);
        text-align: center;
        letter-spacing: 8px;
        z-index: 10;
        position: relative;
        font-family: 'Impact', 'Arial Black', sans-serif;
        animation: titlePulse 2s infinite;
      ">⚡ THUNDER STRIKE ⚡</h1>

      <style>
        @keyframes titlePulse {
          0%, 100% {
            text-shadow:
              0 0 10px #FFD700,
              0 0 20px #FF00FF,
              0 0 30px #00FFFF,
              0 0 40px #FFD700,
              3px 3px 0px #FF0000,
              -3px -3px 0px #00FFFF;
          }
          50% {
            text-shadow:
              0 0 20px #FFD700,
              0 0 30px #FF00FF,
              0 0 40px #00FFFF,
              0 0 50px #FFD700,
              5px 5px 0px #FF0000,
              -5px -5px 0px #00FFFF;
          }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      </style>

      <div id="gameContainer" style="
        position: relative;
        box-shadow:
          0 0 50px rgba(255, 215, 0, 0.8),
          inset 0 0 50px rgba(255, 0, 255, 0.3);
        border: 4px solid #FFD700;
        border-radius: 10px;
        overflow: hidden;
        margin: 5px;
        max-width: min(700px, 90vw);
        max-height: calc(100vh - 220px);
        z-index: 10;
        background: #000000;
      ">
        <canvas id="canvas" width="700" height="900" style="
          display: block;
          background: linear-gradient(180deg, #000033 0%, #000000 100%);
          width: 100%;
          height: auto;
        "></canvas>

        <!-- CRT Scanline Effect -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: scanline 6s linear infinite;
          pointer-events: none;
        "></div>

        <button id="restartButton" style="
          display: none;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 16px 32px;
          font-size: clamp(18px, 3vw, 24px);
          font-family: 'Impact', 'Arial Black', sans-serif;
          color: #FFD700;
          border: 4px solid #FFD700;
          border-radius: 8px;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          background: linear-gradient(135deg, #FF0000 0%, #FF00FF 50%, #FF0000 100%);
          box-shadow:
            0 0 30px rgba(255, 215, 0, 1),
            inset 0 0 20px rgba(255, 255, 255, 0.3);
          z-index: 1000;
          letter-spacing: 3px;
        ">⚡ RESTART ⚡</button>
      </div>

      <button id="musicButton" style="
        margin: 10px;
        padding: 12px 24px;
        font-size: clamp(14px, 3vw, 18px);
        font-family: 'Impact', 'Arial Black', sans-serif;
        color: #00FFFF;
        border: 3px solid #00FFFF;
        border-radius: 8px;
        cursor: pointer;
        text-transform: uppercase;
        font-weight: bold;
        background: linear-gradient(135deg, #000033 0%, #330066 100%);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
        letter-spacing: 2px;
        z-index: 10;
        position: relative;
      ">🎵 EPIC SOUNDTRACK</button>

      <div style="
        color: #FFD700;
        text-align: center;
        margin: 5px;
        font-size: clamp(12px, 2.5vw, 16px);
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
        font-weight: bold;
        z-index: 10;
        position: relative;
      ">
        🎮 ARROWS/WASD: Move • SPACE: Fire • Destroy the alien invasion! 🎮
      </div>
    </div>
  `;

  const seed = 'thunder-strike-' + Date.now();
  const prng = seedrandom(seed);

  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d')!;

  interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    lives: number;
    invincible: boolean;
    fireRate: number;
    lastShot: number;
    powerLevel: number;
    weapon: 'laser' | 'spread' | 'plasma' | 'missile';
    charge: number;
  }

  const player: Player = {
    x: canvas.width / 2 - 30,
    y: canvas.height - 120,
    width: 60,
    height: 70,
    speed: 6,
    lives: 5,
    invincible: false,
    fireRate: 200,
    lastShot: 0,
    powerLevel: 1,
    weapon: 'laser',
    charge: 0,
  };

  interface Bullet {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    color: string;
    damage: number;
    type: 'laser' | 'spread' | 'plasma' | 'missile';
    rotation?: number;
    trail?: Array<{x: number, y: number}>;
  }

  interface Enemy {
    x: number;
    y: number;
    width: number;
    height: number;
    health: number;
    maxHealth: number;
    speed: number;
    type: 'scout' | 'fighter' | 'bomber' | 'mothership' | 'asteroid';
    pattern: number;
    timeAlive: number;
    color: string;
    shootTimer: number;
    points: number;
  }

  interface PowerUp {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'health' | 'weapon' | 'shield' | 'nuke' | 'rapidfire';
    speed: number;
    rotation: number;
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

  interface Star {
    x: number;
    y: number;
    size: number;
    speed: number;
    layer: number;
    brightness: number;
  }

  interface Explosion {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    life: number;
    color: string;
  }

  const bullets: Bullet[] = [];
  const enemyBullets: Bullet[] = [];
  const enemies: Enemy[] = [];
  const powerUps: PowerUp[] = [];
  const particles: Particle[] = [];
  const stars: Star[] = [];
  const explosions: Explosion[] = [];

  let score = 0;
  let highScore = Number(localStorage.getItem('thunderStrikeHighScore')) || 0;
  let gameOver = false;
  let gameStarted = false;
  let wave = 1;
  let enemiesKilled = 0;
  let combo = 0;
  let maxCombo = 0;
  let comboTimer = 0;

  let lastEnemySpawn = 0;
  let enemySpawnInterval = 1500;

  let screenShake = 0;
  let screenShakeX = 0;
  let screenShakeY = 0;

  const keys: { [key: string]: boolean } = {};

  // Initialize stars with parallax layers
  const STAR_COUNT = 150;
  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      const layer = Math.floor(prng() * 4);
      stars.push({
        x: prng() * canvas.width,
        y: prng() * canvas.height,
        size: layer === 0 ? 1 : layer === 1 ? 1.5 : layer === 2 ? 2 : 3,
        speed: layer === 0 ? 1 : layer === 1 ? 2 : layer === 2 ? 3 : 4,
        layer,
        brightness: 0.3 + prng() * 0.7,
      });
    }
  }

  function updateStars() {
    stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = prng() * canvas.width;
      }
    });
  }

  function drawStars() {
    stars.forEach((star) => {
      const alpha = star.layer === 0 ? 0.3 : star.layer === 1 ? 0.5 : star.layer === 2 ? 0.7 : 1.0;
      context.fillStyle = `rgba(255, 255, 255, ${alpha * star.brightness})`;
      if (star.layer >= 2) {
        context.shadowColor = '#FFFFFF';
        context.shadowBlur = star.size * 2;
      }
      context.fillRect(star.x, star.y, star.size, star.size);
      context.shadowBlur = 0;
    });
  }

  function createParticles(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (prng() - 0.5) * 12,
        vy: (prng() - 0.5) * 12,
        life: 60,
        maxLife: 60,
        color,
        size: prng() * 4 + 2,
      });
    }
  }

  function createExplosion(x: number, y: number, maxRadius: number, color: string) {
    explosions.push({
      x,
      y,
      radius: 0,
      maxRadius,
      life: 30,
      color,
    });
  }

  function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
      const exp = explosions[i];
      exp.radius += exp.maxRadius / 15;
      exp.life--;
      if (exp.life <= 0) {
        explosions.splice(i, 1);
      }
    }
  }

  function drawExplosions() {
    explosions.forEach((exp) => {
      const alpha = exp.life / 30;
      context.save();
      context.globalAlpha = alpha;

      // Outer ring
      const gradient = context.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.radius);
      gradient.addColorStop(0, exp.color);
      gradient.addColorStop(0.5, '#FF8C00');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
      context.fill();

      // Inner glow
      context.fillStyle = '#FFFFFF';
      context.shadowColor = exp.color;
      context.shadowBlur = 20;
      context.beginPath();
      context.arc(exp.x, exp.y, exp.radius * 0.3, 0, Math.PI * 2);
      context.fill();

      context.restore();
    });
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.vx *= 0.98;
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
      context.shadowColor = p.color;
      context.shadowBlur = 8;
      context.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      context.restore();
    });
  }

  function triggerScreenShake(intensity: number) {
    screenShake = intensity;
  }

  function updateScreenShake() {
    if (screenShake > 0) {
      screenShakeX = (prng() - 0.5) * screenShake;
      screenShakeY = (prng() - 0.5) * screenShake;
      screenShake *= 0.85;
      if (screenShake < 0.5) {
        screenShake = 0;
        screenShakeX = 0;
        screenShakeY = 0;
      }
    }
  }

  function drawPlayer() {
    context.save();
    context.translate(player.x + player.width / 2, player.y + player.height / 2);

    // Shield effect
    if (player.invincible) {
      const pulseSize = Math.sin(Date.now() / 100) * 10 + player.width;
      context.strokeStyle = '#00FFFF';
      context.lineWidth = 4;
      context.shadowColor = '#00FFFF';
      context.shadowBlur = 20;
      context.beginPath();
      context.arc(0, 0, pulseSize / 2, 0, Math.PI * 2);
      context.stroke();
      context.shadowBlur = 0;
    }

    // Ship body - sleek fighter design
    const gradient = context.createLinearGradient(0, -player.height / 2, 0, player.height / 2);
    gradient.addColorStop(0, '#00FFFF');
    gradient.addColorStop(0.5, '#0080FF');
    gradient.addColorStop(1, '#0040FF');

    context.fillStyle = gradient;
    context.beginPath();
    context.moveTo(0, -player.height / 2);
    context.lineTo(player.width / 3, player.height / 4);
    context.lineTo(player.width / 4, player.height / 2);
    context.lineTo(-player.width / 4, player.height / 2);
    context.lineTo(-player.width / 3, player.height / 4);
    context.closePath();
    context.fill();

    // Cockpit
    context.fillStyle = '#FFD700';
    context.shadowColor = '#FFD700';
    context.shadowBlur = 15;
    context.beginPath();
    context.ellipse(0, -player.height / 6, 8, 12, 0, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;

    // Wings
    context.fillStyle = '#FF00FF';
    context.beginPath();
    context.moveTo(-player.width / 3, 0);
    context.lineTo(-player.width / 2 - 10, player.height / 4);
    context.lineTo(-player.width / 3, player.height / 4);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(player.width / 3, 0);
    context.lineTo(player.width / 2 + 10, player.height / 4);
    context.lineTo(player.width / 3, player.height / 4);
    context.closePath();
    context.fill();

    // Engine glow
    const engineGlow = Math.sin(Date.now() / 50) * 0.3 + 0.7;
    context.fillStyle = `rgba(255, 100, 0, ${engineGlow})`;
    context.shadowColor = '#FF6600';
    context.shadowBlur = 20;
    context.fillRect(-8, player.height / 2, 6, 15);
    context.fillRect(2, player.height / 2, 6, 15);

    context.restore();
  }

  function spawnEnemy() {
    const types: Array<'scout' | 'fighter' | 'bomber' | 'mothership' | 'asteroid'> =
      ['scout', 'scout', 'fighter', 'fighter', 'bomber', 'asteroid'];

    // Spawn mothership boss every 10 waves
    let type: 'scout' | 'fighter' | 'bomber' | 'mothership' | 'asteroid';
    if (wave % 10 === 0 && enemies.filter(e => e.type === 'mothership').length === 0) {
      type = 'mothership';
    } else {
      type = types[Math.floor(prng() * types.length)];
    }

    let enemy: Enemy;

    switch (type) {
      case 'scout':
        enemy = {
          x: prng() * (canvas.width - 40),
          y: -40,
          width: 40,
          height: 40,
          health: 2,
          maxHealth: 2,
          speed: 4 + wave * 0.2,
          type,
          pattern: Math.floor(prng() * 4),
          timeAlive: 0,
          color: '#00FF00',
          shootTimer: 0,
          points: 50,
        };
        break;
      case 'fighter':
        enemy = {
          x: prng() * (canvas.width - 50),
          y: -50,
          width: 50,
          height: 50,
          health: 5,
          maxHealth: 5,
          speed: 2.5 + wave * 0.15,
          type,
          pattern: Math.floor(prng() * 4),
          timeAlive: 0,
          color: '#FF00FF',
          shootTimer: 0,
          points: 100,
        };
        break;
      case 'bomber':
        enemy = {
          x: prng() * (canvas.width - 70),
          y: -70,
          width: 70,
          height: 70,
          health: 10,
          maxHealth: 10,
          speed: 1.5 + wave * 0.1,
          type,
          pattern: Math.floor(prng() * 3),
          timeAlive: 0,
          color: '#FF4444',
          shootTimer: 0,
          points: 200,
        };
        break;
      case 'asteroid':
        const size = 40 + prng() * 40;
        enemy = {
          x: prng() * (canvas.width - size),
          y: -size,
          width: size,
          height: size,
          health: 3,
          maxHealth: 3,
          speed: 2 + prng() * 2,
          type,
          pattern: 0,
          timeAlive: 0,
          color: '#888888',
          shootTimer: 0,
          points: 75,
        };
        break;
      case 'mothership':
        enemy = {
          x: canvas.width / 2 - 100,
          y: -200,
          width: 200,
          height: 200,
          health: 100 + wave * 20,
          maxHealth: 100 + wave * 20,
          speed: 0.8,
          type,
          pattern: 0,
          timeAlive: 0,
          color: '#FFD700',
          shootTimer: 0,
          points: 5000,
        };
        break;
    }

    enemies.push(enemy);
  }

  function updateEnemies(deltaTime: number) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      enemy.timeAlive += deltaTime;
      enemy.shootTimer += deltaTime;

      // Movement patterns
      if (enemy.type === 'mothership') {
        enemy.x = canvas.width / 2 - enemy.width / 2 + Math.sin(enemy.timeAlive / 1000) * 150;
        if (enemy.y < 80) {
          enemy.y += enemy.speed;
        } else {
          enemy.y = 80 + Math.sin(enemy.timeAlive / 500) * 20;
        }
      } else if (enemy.type === 'asteroid') {
        enemy.y += enemy.speed;
        enemy.timeAlive += 0.05;
      } else {
        if (enemy.pattern === 0) {
          enemy.y += enemy.speed;
        } else if (enemy.pattern === 1) {
          enemy.y += enemy.speed;
          enemy.x += Math.sin(enemy.timeAlive / 300) * 3;
        } else if (enemy.pattern === 2) {
          enemy.y += enemy.speed;
          enemy.x += Math.cos(enemy.timeAlive / 200) * 4;
        } else if (enemy.pattern === 3) {
          // Dive pattern
          if (enemy.y < canvas.height / 3) {
            enemy.y += enemy.speed;
          } else {
            enemy.y += enemy.speed * 2;
            enemy.x += (player.x - enemy.x) * 0.02;
          }
        }
      }

      // Keep in bounds
      if (enemy.x < 0) enemy.x = 0;
      if (enemy.x + enemy.width > canvas.width) enemy.x = canvas.width - enemy.width;

      // Enemy shooting
      if (enemy.type === 'fighter' && enemy.shootTimer > 1000) {
        enemy.shootTimer = 0;
        enemyBullets.push({
          x: enemy.x + enemy.width / 2 - 3,
          y: enemy.y + enemy.height,
          width: 6,
          height: 12,
          speed: 6,
          color: '#FF00FF',
          damage: 1,
          type: 'laser',
        });
      }

      if (enemy.type === 'bomber' && enemy.shootTimer > 1500) {
        enemy.shootTimer = 0;
        for (let j = -1; j <= 1; j++) {
          enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 4 + j * 20,
            y: enemy.y + enemy.height,
            width: 8,
            height: 14,
            speed: 5,
            color: '#FF4444',
            damage: 1,
            type: 'plasma',
          });
        }
      }

      if (enemy.type === 'mothership' && enemy.shootTimer > 500) {
        enemy.shootTimer = 0;
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        for (let j = -2; j <= 2; j++) {
          const spreadAngle = angle + (j * 0.2);
          enemyBullets.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            width: 10,
            height: 10,
            speed: 7,
            color: '#FFD700',
            damage: 1,
            type: 'missile',
            rotation: spreadAngle,
          });
        }
      }

      // Remove if off screen
      if (enemy.y > canvas.height + 100) {
        enemies.splice(i, 1);
        combo = 0;
      }
    }
  }

  function drawEnemies() {
    enemies.forEach((enemy) => {
      context.save();
      context.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

      if (enemy.type === 'mothership') {
        // Epic boss design
        context.rotate(Math.sin(enemy.timeAlive / 500) * 0.1);

        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, enemy.width / 2);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FF00FF');
        gradient.addColorStop(1, '#FF0000');

        context.fillStyle = gradient;
        context.shadowColor = '#FFD700';
        context.shadowBlur = 30;

        // Main body
        context.beginPath();
        context.ellipse(0, 0, enemy.width / 2, enemy.height / 3, 0, 0, Math.PI * 2);
        context.fill();

        // Core
        context.fillStyle = '#00FFFF';
        context.shadowColor = '#00FFFF';
        context.shadowBlur = 40;
        context.beginPath();
        context.arc(0, 0, 30, 0, Math.PI * 2);
        context.fill();

        // Weapons
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i;
          const x = Math.cos(angle) * 60;
          const y = Math.sin(angle) * 40;
          context.fillStyle = '#FF0000';
          context.fillRect(x - 5, y - 5, 10, 10);
        }
      } else if (enemy.type === 'asteroid') {
        context.rotate(enemy.timeAlive);
        context.fillStyle = '#666666';
        context.strokeStyle = '#999999';
        context.lineWidth = 2;

        context.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i;
          const radius = enemy.width / 2 + (prng() * 10 - 5);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.closePath();
        context.fill();
        context.stroke();
      } else {
        // Regular enemy ships
        const gradient = context.createLinearGradient(0, -enemy.height / 2, 0, enemy.height / 2);
        gradient.addColorStop(0, enemy.color);
        gradient.addColorStop(1, '#000000');

        context.fillStyle = gradient;
        context.shadowColor = enemy.color;
        context.shadowBlur = 15;

        // Ship hull
        context.beginPath();
        context.moveTo(0, enemy.height / 2);
        context.lineTo(enemy.width / 3, -enemy.height / 3);
        context.lineTo(0, -enemy.height / 2);
        context.lineTo(-enemy.width / 3, -enemy.height / 3);
        context.closePath();
        context.fill();

        // Cockpit/Core
        context.fillStyle = '#FFFFFF';
        context.fillRect(-8, -10, 16, 16);
      }

      context.restore();

      // Health bar
      if (enemy.maxHealth > 3) {
        const healthBarWidth = enemy.width;
        const healthPercent = enemy.health / enemy.maxHealth;

        context.fillStyle = '#333';
        context.fillRect(enemy.x, enemy.y - 12, healthBarWidth, 6);

        context.fillStyle = healthPercent > 0.6 ? '#00FF00' : healthPercent > 0.3 ? '#FFFF00' : '#FF0000';
        context.shadowColor = context.fillStyle;
        context.shadowBlur = 5;
        context.fillRect(enemy.x, enemy.y - 12, healthBarWidth * healthPercent, 6);
        context.shadowBlur = 0;
      }
    });
  }

  function updatePlayer() {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
      player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
      player.x += player.speed;
    }
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
      player.y -= player.speed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
      player.y += player.speed;
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < canvas.height / 2) player.y = canvas.height / 2;
    if (player.y + player.height > canvas.height - 20) player.y = canvas.height - player.height - 20;

    // Charge mechanic
    if (keys[' ']) {
      player.charge = Math.min(player.charge + 2, 100);
    }
  }

  function shoot() {
    const now = Date.now();
    if (now - player.lastShot < player.fireRate) return;

    player.lastShot = now;

    if (player.weapon === 'laser') {
      bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 20,
        speed: -12,
        color: '#00FFFF',
        damage: 1,
        type: 'laser',
      });
    } else if (player.weapon === 'spread') {
      for (let i = -2; i <= 2; i++) {
        bullets.push({
          x: player.x + player.width / 2 - 3 + i * 8,
          y: player.y,
          width: 5,
          height: 15,
          speed: -10 - Math.abs(i),
          color: '#FF00FF',
          damage: 1,
          type: 'spread',
        });
      }
    } else if (player.weapon === 'plasma') {
      bullets.push({
        x: player.x + player.width / 2 - 5,
        y: player.y,
        width: 10,
        height: 10,
        speed: -15,
        color: '#FFD700',
        damage: 3,
        type: 'plasma',
        trail: [],
      });
    }

    playShootSound();
  }

  function updateBullets() {
    // Player bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.y += bullet.speed;

      // Trail for plasma
      if (bullet.type === 'plasma' && bullet.trail) {
        bullet.trail.push({ x: bullet.x, y: bullet.y });
        if (bullet.trail.length > 10) bullet.trail.shift();
      }

      if (bullet.y < -50) {
        bullets.splice(i, 1);
        continue;
      }

      // Collision with enemies
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (
          bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y
        ) {
          enemy.health -= bullet.damage;
          bullets.splice(i, 1);
          createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 15, bullet.color);

          if (enemy.health <= 0) {
            score += enemy.points * (combo + 1);
            enemiesKilled++;
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            comboTimer = 180;

            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width, enemy.color);
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 40, enemy.color);
            enemies.splice(j, 1);

            triggerScreenShake(enemy.type === 'mothership' ? 20 : 8);

            // Power-up drop chance
            if (prng() < 0.15) {
              spawnPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            }

            playExplosionSound();
          }

          break;
        }
      }
    }

    // Enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const bullet = enemyBullets[i];

      if (bullet.rotation !== undefined) {
        bullet.x += Math.cos(bullet.rotation) * bullet.speed;
        bullet.y += Math.sin(bullet.rotation) * bullet.speed;
      } else {
        bullet.y += bullet.speed;
      }

      if (bullet.y > canvas.height + 50 || bullet.x < -50 || bullet.x > canvas.width + 50) {
        enemyBullets.splice(i, 1);
        continue;
      }

      if (
        !player.invincible &&
        bullet.x < player.x + player.width &&
        bullet.x + bullet.width > player.x &&
        bullet.y < player.y + player.height &&
        bullet.y + bullet.height > player.y
      ) {
        enemyBullets.splice(i, 1);
        hitPlayer();
      }
    }
  }

  function drawBullets() {
    bullets.forEach((bullet) => {
      // Draw trail for plasma
      if (bullet.type === 'plasma' && bullet.trail) {
        bullet.trail.forEach((point, index) => {
          const alpha = index / bullet.trail!.length;
          context.save();
          context.globalAlpha = alpha * 0.6;
          context.fillStyle = bullet.color;
          context.fillRect(point.x, point.y, bullet.width * alpha, bullet.height * alpha);
          context.restore();
        });
      }

      context.fillStyle = bullet.color;
      context.shadowColor = bullet.color;
      context.shadowBlur = 15;

      if (bullet.type === 'plasma') {
        context.beginPath();
        context.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
        context.fill();
      } else {
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
      context.shadowBlur = 0;
    });

    enemyBullets.forEach((bullet) => {
      context.fillStyle = bullet.color;
      context.shadowColor = bullet.color;
      context.shadowBlur = 10;

      if (bullet.rotation !== undefined) {
        context.save();
        context.translate(bullet.x, bullet.y);
        context.rotate(bullet.rotation);
        context.fillRect(-bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height);
        context.restore();
      } else {
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
      context.shadowBlur = 0;
    });
  }

  function spawnPowerUp(x: number, y: number) {
    const types: Array<'health' | 'weapon' | 'shield' | 'nuke' | 'rapidfire'> =
      ['health', 'weapon', 'shield', 'nuke', 'rapidfire'];
    const type = types[Math.floor(prng() * types.length)];

    powerUps.push({
      x,
      y,
      width: 35,
      height: 35,
      type,
      speed: 2,
      rotation: 0,
    });
  }

  function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const powerUp = powerUps[i];
      powerUp.y += powerUp.speed;
      powerUp.rotation += 0.1;

      if (powerUp.y > canvas.height) {
        powerUps.splice(i, 1);
        continue;
      }

      if (
        powerUp.x < player.x + player.width &&
        powerUp.x + powerUp.width > player.x &&
        powerUp.y < player.y + player.height &&
        powerUp.y + powerUp.height > player.y
      ) {
        collectPowerUp(powerUp.type);
        powerUps.splice(i, 1);
        createParticles(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, 25, '#FFD700');
      }
    }
  }

  function collectPowerUp(type: 'health' | 'weapon' | 'shield' | 'nuke' | 'rapidfire') {
    switch (type) {
      case 'health':
        if (player.lives < 10) player.lives++;
        break;
      case 'weapon':
        const weapons: Array<'laser' | 'spread' | 'plasma'> = ['laser', 'spread', 'plasma'];
        player.weapon = weapons[Math.floor(prng() * weapons.length)];
        setTimeout(() => (player.weapon = 'laser'), 15000);
        break;
      case 'shield':
        player.invincible = true;
        setTimeout(() => (player.invincible = false), 10000);
        break;
      case 'nuke':
        enemies.forEach(enemy => {
          createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width * 2, '#FFD700');
          score += enemy.points;
        });
        enemies.length = 0;
        triggerScreenShake(30);
        break;
      case 'rapidfire':
        player.fireRate = 100;
        setTimeout(() => (player.fireRate = 200), 12000);
        break;
    }
  }

  function drawPowerUps() {
    powerUps.forEach((powerUp) => {
      context.save();
      context.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
      context.rotate(powerUp.rotation);

      let icon = '';
      let color = '';
      let borderColor = '';

      switch (powerUp.type) {
        case 'health':
          icon = '❤️';
          color = '#FF0000';
          borderColor = '#FF6666';
          break;
        case 'weapon':
          icon = '⚔️';
          color = '#00FFFF';
          borderColor = '#66FFFF';
          break;
        case 'shield':
          icon = '🛡️';
          color = '#00FF00';
          borderColor = '#66FF66';
          break;
        case 'nuke':
          icon = '💣';
          color = '#FFD700';
          borderColor = '#FFEB99';
          break;
        case 'rapidfire':
          icon = '⚡';
          color = '#FFFF00';
          borderColor = '#FFFF99';
          break;
      }

      // Glowing border
      context.strokeStyle = borderColor;
      context.lineWidth = 3;
      context.shadowColor = color;
      context.shadowBlur = 20;
      context.strokeRect(-powerUp.width / 2, -powerUp.height / 2, powerUp.width, powerUp.height);

      context.fillStyle = color;
      context.font = '28px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(icon, 0, 0);

      context.restore();
    });
  }

  function hitPlayer() {
    player.lives--;
    createParticles(player.x + player.width / 2, player.y + player.height / 2, 30, '#00FFFF');
    createExplosion(player.x + player.width / 2, player.y + player.height / 2, 50, '#FF0000');
    combo = 0;
    triggerScreenShake(15);

    if (player.lives <= 0) {
      gameOver = true;
    } else {
      player.invincible = true;
      setTimeout(() => (player.invincible = false), 2000);
    }
  }

  function drawHUD() {
    context.font = 'bold 22px "Impact"';
    context.strokeStyle = 'black';
    context.lineWidth = 3;

    // Score
    context.fillStyle = '#FFD700';
    context.shadowColor = '#FFD700';
    context.shadowBlur = 10;
    context.strokeText(`SCORE: ${score}`, 15, 35);
    context.fillText(`SCORE: ${score}`, 15, 35);

    // High Score
    context.fillStyle = '#FF00FF';
    context.shadowColor = '#FF00FF';
    context.strokeText(`HI: ${highScore}`, canvas.width - 180, 35);
    context.fillText(`HI: ${highScore}`, canvas.width - 180, 35);

    // Wave
    context.fillStyle = '#00FFFF';
    context.shadowColor = '#00FFFF';
    context.strokeText(`WAVE ${wave}`, canvas.width / 2 - 60, 35);
    context.fillText(`WAVE ${wave}`, canvas.width / 2 - 60, 35);
    context.shadowBlur = 0;

    // Lives
    context.font = 'bold 18px "Impact"';
    context.fillStyle = '#FFFFFF';
    context.strokeText('LIVES:', 15, 65);
    context.fillText('LIVES:', 15, 65);

    for (let i = 0; i < player.lives; i++) {
      context.fillStyle = i < 3 ? '#00FFFF' : '#FFD700';
      context.shadowColor = context.fillStyle;
      context.shadowBlur = 8;
      context.fillRect(90 + i * 28, 50, 24, 24);
    }
    context.shadowBlur = 0;

    // Weapon indicator
    if (player.weapon !== 'laser') {
      context.font = 'bold 16px "Impact"';
      context.fillStyle = '#FFD700';
      context.shadowColor = '#FFD700';
      context.shadowBlur = 10;
      const weaponText = player.weapon.toUpperCase();
      context.strokeText(`⚔️ ${weaponText}`, 15, 95);
      context.fillText(`⚔️ ${weaponText}`, 15, 95);
      context.shadowBlur = 0;
    }

    // Combo
    if (combo > 1) {
      const scale = 1 + Math.sin(Date.now() / 100) * 0.15;
      context.save();
      context.translate(canvas.width / 2, canvas.height - 80);
      context.scale(scale, scale);
      context.font = 'bold 40px "Impact"';
      context.fillStyle = '#FFD700';
      context.strokeStyle = '#FF0000';
      context.lineWidth = 4;
      context.shadowColor = '#FFD700';
      context.shadowBlur = 20;
      context.textAlign = 'center';
      context.strokeText(`COMBO x${combo}!`, 0, 0);
      context.fillText(`COMBO x${combo}!`, 0, 0);
      context.restore();
    }
  }

  function drawStartScreen() {
    context.fillStyle = 'rgba(0, 0, 0, 0.85)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const scale = 1 + Math.sin(Date.now() / 250) * 0.12;
    context.save();
    context.translate(canvas.width / 2, canvas.height / 4);
    context.scale(scale, scale);
    context.font = 'bold 56px "Impact"';
    context.fillStyle = '#FFD700';
    context.strokeStyle = '#FF0000';
    context.lineWidth = 5;
    context.shadowColor = '#FFD700';
    context.shadowBlur = 30;
    context.textAlign = 'center';
    context.strokeText('⚡ THUNDER STRIKE ⚡', 0, 0);
    context.fillText('⚡ THUNDER STRIKE ⚡', 0, 0);
    context.restore();

    context.font = 'bold 28px "Impact"';
    context.fillStyle = '#00FFFF';
    context.shadowColor = '#00FFFF';
    context.shadowBlur = 15;
    context.textAlign = 'center';
    context.fillText('ALIEN INVASION', canvas.width / 2, canvas.height / 4 + 60);

    context.font = '20px "Arial"';
    context.fillStyle = '#FFFFFF';
    context.shadowBlur = 5;
    context.fillText('CONTROLS:', canvas.width / 2, canvas.height / 2 - 20);
    context.fillText('Arrow Keys / WASD - Move Ship', canvas.width / 2, canvas.height / 2 + 15);
    context.fillText('SPACE - Fire Weapons', canvas.width / 2, canvas.height / 2 + 45);

    context.font = 'bold 18px "Arial"';
    context.fillStyle = '#FFD700';
    context.fillText('POWER-UPS:', canvas.width / 2, canvas.height / 2 + 90);

    context.font = '16px "Arial"';
    const powerups = [
      { icon: '❤️', name: 'Extra Life', color: '#FF0000' },
      { icon: '⚔️', name: 'Weapon Upgrade', color: '#00FFFF' },
      { icon: '🛡️', name: 'Shield', color: '#00FF00' },
      { icon: '💣', name: 'Screen Nuke', color: '#FFD700' },
      { icon: '⚡', name: 'Rapid Fire', color: '#FFFF00' },
    ];

    powerups.forEach((pu, index) => {
      context.fillStyle = pu.color;
      context.shadowColor = pu.color;
      context.fillText(`${pu.icon} ${pu.name}`, canvas.width / 2, canvas.height / 2 + 120 + index * 28);
    });

    const alpha = Math.sin(Date.now() / 180) * 0.5 + 0.5;
    context.save();
    context.globalAlpha = alpha;
    context.font = 'bold 32px "Impact"';
    context.fillStyle = '#FF00FF';
    context.shadowColor = '#FF00FF';
    context.shadowBlur = 25;
    context.fillText('>>> PRESS SPACE TO START <<<', canvas.width / 2, canvas.height - 100);
    context.restore();

    context.textAlign = 'left';
    context.shadowBlur = 0;
  }

  function drawGameOver() {
    context.fillStyle = 'rgba(0, 0, 0, 0.9)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 64px "Impact"';
    context.fillStyle = '#FF0000';
    context.strokeStyle = 'black';
    context.lineWidth = 6;
    context.shadowColor = '#FF0000';
    context.shadowBlur = 30;
    context.textAlign = 'center';
    context.strokeText('GAME OVER', canvas.width / 2, canvas.height / 2 - 120);
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 120);

    context.font = 'bold 28px "Impact"';
    context.fillStyle = '#FFD700';
    context.shadowColor = '#FFD700';
    context.fillText(`FINAL SCORE: ${score}`, canvas.width / 2, canvas.height / 2 - 30);

    context.fillStyle = '#00FFFF';
    context.shadowColor = '#00FFFF';
    context.fillText(`WAVE REACHED: ${wave}`, canvas.width / 2, canvas.height / 2 + 10);
    context.fillText(`MAX COMBO: x${maxCombo}`, canvas.width / 2, canvas.height / 2 + 50);
    context.fillText(`ENEMIES DESTROYED: ${enemiesKilled}`, canvas.width / 2, canvas.height / 2 + 90);

    if (score > highScore) {
      context.font = 'bold 36px "Impact"';
      context.fillStyle = '#FFD700';
      context.shadowBlur = 40;
      context.fillText('★ NEW HIGH SCORE! ★', canvas.width / 2, canvas.height / 2 + 150);
    }

    context.textAlign = 'left';
    context.shadowBlur = 0;
  }

  function updateHighScore() {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('thunderStrikeHighScore', highScore.toString());
    }
  }

  let audioCtx: AudioContext | null = null;

  function playShootSound() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  }

  function playExplosionSound() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  }

  function resetGame() {
    updateHighScore();

    player.x = canvas.width / 2 - 30;
    player.y = canvas.height - 120;
    player.lives = 5;
    player.invincible = false;
    player.fireRate = 200;
    player.powerLevel = 1;
    player.weapon = 'laser';
    player.charge = 0;

    bullets.length = 0;
    enemyBullets.length = 0;
    enemies.length = 0;
    powerUps.length = 0;
    particles.length = 0;
    explosions.length = 0;

    score = 0;
    wave = 1;
    enemiesKilled = 0;
    combo = 0;
    maxCombo = 0;
    comboTimer = 0;
    lastEnemySpawn = 0;
    enemySpawnInterval = 1500;

    gameOver = false;
    gameStarted = false;

    gameLoop();
  }

  const restartButton = document.getElementById('restartButton')!;
  restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none';
    resetGame();
  });

  function showRestartButton() {
    restartButton.style.display = 'block';
  }

  let lastTime = Date.now();

  function gameLoop() {
    const now = Date.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    context.save();
    updateScreenShake();
    context.translate(screenShakeX, screenShakeY);

    context.clearRect(-50, -50, canvas.width + 100, canvas.height + 100);

    updateStars();
    drawStars();

    if (!gameStarted) {
      drawStartScreen();
      context.restore();
      requestAnimationFrame(gameLoop);
      return;
    }

    updatePlayer();
    updateBullets();
    updateEnemies(deltaTime);
    updatePowerUps();
    updateParticles();
    updateExplosions();

    if (comboTimer > 0) {
      comboTimer--;
      if (comboTimer === 0) {
        combo = 0;
      }
    }

    // Auto shoot when space is held
    if (keys[' ']) {
      shoot();
    }

    // Spawn enemies
    if (now - lastEnemySpawn > enemySpawnInterval) {
      spawnEnemy();
      lastEnemySpawn = now;
    }

    // Wave progression
    if (enemies.length === 0 && now - lastEnemySpawn > 4000) {
      wave++;
      enemySpawnInterval = Math.max(400, enemySpawnInterval - 80);
      createParticles(canvas.width / 2, canvas.height / 2, 50, '#FFD700');
    }

    drawPlayer();
    drawEnemies();
    drawBullets();
    drawPowerUps();
    drawExplosions();
    drawParticles();
    drawHUD();

    context.restore();

    if (!gameOver) {
      requestAnimationFrame(gameLoop);
    } else {
      drawGameOver();
      updateHighScore();
      showRestartButton();
    }
  }

  // Input handlers
  document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.code === 'Space') {
      e.preventDefault();
      if (!gameStarted) {
        gameStarted = true;
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  // Epic retro music
  let modAudioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let musicPlaying = false;

  function initAudio() {
    if (!modAudioContext) {
      modAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = modAudioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.connect(modAudioContext.destination);
    }
  }

  function playEpicMusic() {
    if (musicPlaying) return;
    musicPlaying = true;

    initAudio();

    // Epic 90s game soundtrack
    const bassline = [
      { freq: 110, time: 0, duration: 0.2 },
      { freq: 110, time: 0.2, duration: 0.2 },
      { freq: 146.83, time: 0.4, duration: 0.2 },
      { freq: 130.81, time: 0.6, duration: 0.2 },
    ];

    const melody = [
      { freq: 523.25, time: 0, duration: 0.15 },
      { freq: 659.25, time: 0.15, duration: 0.15 },
      { freq: 783.99, time: 0.3, duration: 0.15 },
      { freq: 880.0, time: 0.45, duration: 0.15 },
      { freq: 783.99, time: 0.6, duration: 0.15 },
      { freq: 659.25, time: 0.75, duration: 0.15 },
    ];

    function playMusicLoop() {
      if (!modAudioContext || !analyser) return;

      // Bass
      bassline.forEach((note) => {
        const osc = modAudioContext!.createOscillator();
        const gain = modAudioContext!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.freq, modAudioContext!.currentTime + note.time);

        gain.gain.setValueAtTime(0.12, modAudioContext!.currentTime + note.time);
        gain.gain.exponentialRampToValueAtTime(0.01, modAudioContext!.currentTime + note.time + note.duration);

        osc.connect(gain);
        gain.connect(analyser!);

        osc.start(modAudioContext!.currentTime + note.time);
        osc.stop(modAudioContext!.currentTime + note.time + note.duration);
      });

      // Melody
      melody.forEach((note) => {
        const osc = modAudioContext!.createOscillator();
        const gain = modAudioContext!.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(note.freq, modAudioContext!.currentTime + note.time);

        gain.gain.setValueAtTime(0.06, modAudioContext!.currentTime + note.time);
        gain.gain.exponentialRampToValueAtTime(0.01, modAudioContext!.currentTime + note.time + note.duration);

        osc.connect(gain);
        gain.connect(analyser!);

        osc.start(modAudioContext!.currentTime + note.time);
        osc.stop(modAudioContext!.currentTime + note.time + note.duration);
      });

      setTimeout(playMusicLoop, 900);
    }

    playMusicLoop();
  }

  const musicButton = document.getElementById('musicButton')!;
  musicButton.addEventListener('click', () => {
    if (!musicPlaying) {
      playEpicMusic();
      musicButton.textContent = '🎵 MUSIC PLAYING';
    }
  });

  (window as any).stopMusic = () => {
    if (modAudioContext && modAudioContext.state === 'running') {
      modAudioContext.suspend();
    }
    musicPlaying = false;
  };

  // Initialize and start
  initStars();
  resetGame();
}
