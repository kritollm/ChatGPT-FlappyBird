import seedrandom from 'seedrandom';

export default async function loadSpaceBlaster() {
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
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
    ">
      <h1 style="
        color: #fff;
        text-shadow: 0 0 20px #ff00ff, 0 0 40px #00ffff;
        margin: 10px 0;
        font-size: clamp(18px, 4vw, 32px);
        text-align: center;
        letter-spacing: 3px;
      ">👾 SPACE BLASTER - RETRO EDITION 🚀</h1>

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
        <canvas id="canvas" width="600" height="700" style="
          display: block;
          background: linear-gradient(180deg, #000000 0%, #0a0a2e 100%);
          width: 100%;
          height: auto;
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
        Bruk piltaster eller WASD for å bevege · SPACE for å skyte · Ødelegg alle fiender!
      </div>
    </div>
  `;

  const seed = 'space-blaster-' + Date.now();
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
  }

  const player: Player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,
    lives: 3,
    invincible: false,
    fireRate: 300,
    lastShot: 0,
    powerLevel: 1,
  };

  interface Bullet {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    color: string;
    damage: number;
  }

  interface Enemy {
    x: number;
    y: number;
    width: number;
    height: number;
    health: number;
    maxHealth: number;
    speed: number;
    type: 'basic' | 'fast' | 'tank' | 'boss';
    pattern: number;
    timeAlive: number;
    color: string;
  }

  interface PowerUp {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'health' | 'rapid' | 'triple' | 'shield';
    speed: number;
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
  }

  const bullets: Bullet[] = [];
  const enemyBullets: Bullet[] = [];
  const enemies: Enemy[] = [];
  const powerUps: PowerUp[] = [];
  const particles: Particle[] = [];
  const stars: Star[] = [];

  let score = 0;
  let highScore = Number(localStorage.getItem('spaceBlasterHighScore')) || 0;
  let gameOver = false;
  let gameStarted = false;
  let wave = 1;
  let enemiesKilled = 0;
  let combo = 0;
  let maxCombo = 0;
  let comboTimer = 0;

  let lastEnemySpawn = 0;
  let enemySpawnInterval = 2000;

  const keys: { [key: string]: boolean } = {};

  // Initialize stars
  const STAR_COUNT = 100;
  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      const layer = Math.floor(prng() * 3);
      stars.push({
        x: prng() * canvas.width,
        y: prng() * canvas.height,
        size: layer === 0 ? prng() * 1 + 0.5 : layer === 1 ? prng() * 2 + 1 : prng() * 3 + 2,
        speed: layer === 0 ? prng() * 0.5 + 0.5 : layer === 1 ? prng() * 1 + 1 : prng() * 1.5 + 1.5,
        layer,
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
      const alpha = star.layer === 0 ? 0.3 : star.layer === 1 ? 0.6 : 1.0;
      context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      context.fillRect(star.x, star.y, star.size, star.size);
    });
  }

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

  function drawPlayer() {
    context.save();

    // Draw shield if invincible
    if (player.invincible) {
      context.strokeStyle = '#00FFFF';
      context.lineWidth = 3;
      context.beginPath();
      context.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2);
      context.stroke();
      context.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      context.lineWidth = 6;
      context.stroke();
    }

    // Draw ship body
    context.fillStyle = '#00FFFF';
    context.beginPath();
    context.moveTo(player.x + player.width / 2, player.y);
    context.lineTo(player.x + player.width, player.y + player.height);
    context.lineTo(player.x + player.width / 2, player.y + player.height * 0.7);
    context.lineTo(player.x, player.y + player.height);
    context.closePath();
    context.fill();

    // Draw ship details
    context.fillStyle = '#FF00FF';
    context.fillRect(player.x + player.width / 2 - 5, player.y + 15, 10, 15);

    // Draw engines
    context.fillStyle = '#FFD700';
    context.fillRect(player.x + 5, player.y + player.height - 10, 8, 10);
    context.fillRect(player.x + player.width - 13, player.y + player.height - 10, 8, 10);

    context.restore();
  }

  function spawnEnemy() {
    const types: Array<'basic' | 'fast' | 'tank' | 'boss'> = ['basic', 'basic', 'basic', 'fast', 'fast', 'tank'];

    // Spawn boss every 5 waves
    let type: 'basic' | 'fast' | 'tank' | 'boss';
    if (wave % 5 === 0 && enemies.filter(e => e.type === 'boss').length === 0) {
      type = 'boss';
    } else {
      type = types[Math.floor(prng() * types.length)];
    }

    let enemy: Enemy;

    switch (type) {
      case 'fast':
        enemy = {
          x: prng() * (canvas.width - 40),
          y: -40,
          width: 35,
          height: 35,
          health: 1,
          maxHealth: 1,
          speed: 3 + wave * 0.2,
          type,
          pattern: Math.floor(prng() * 3),
          timeAlive: 0,
          color: '#FF00FF',
        };
        break;
      case 'tank':
        enemy = {
          x: prng() * (canvas.width - 60),
          y: -60,
          width: 60,
          height: 60,
          health: 5,
          maxHealth: 5,
          speed: 1 + wave * 0.1,
          type,
          pattern: Math.floor(prng() * 3),
          timeAlive: 0,
          color: '#FF4444',
        };
        break;
      case 'boss':
        enemy = {
          x: canvas.width / 2 - 75,
          y: -150,
          width: 150,
          height: 150,
          health: 50,
          maxHealth: 50,
          speed: 0.5,
          type,
          pattern: 0,
          timeAlive: 0,
          color: '#FFD700',
        };
        break;
      default: // basic
        enemy = {
          x: prng() * (canvas.width - 40),
          y: -40,
          width: 40,
          height: 40,
          health: 2,
          maxHealth: 2,
          speed: 2 + wave * 0.15,
          type,
          pattern: Math.floor(prng() * 3),
          timeAlive: 0,
          color: '#00FF00',
        };
    }

    enemies.push(enemy);
  }

  function updateEnemies(deltaTime: number) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      enemy.timeAlive += deltaTime;

      // Movement patterns
      if (enemy.pattern === 0) {
        // Straight down
        enemy.y += enemy.speed;
      } else if (enemy.pattern === 1) {
        // Sine wave
        enemy.y += enemy.speed;
        enemy.x += Math.sin(enemy.timeAlive / 200) * 2;
      } else if (enemy.pattern === 2) {
        // Zigzag
        enemy.y += enemy.speed;
        enemy.x += Math.cos(enemy.timeAlive / 100) * 3;
      }

      // Boss movement
      if (enemy.type === 'boss') {
        enemy.x = canvas.width / 2 - enemy.width / 2 + Math.sin(enemy.timeAlive / 500) * 100;
        if (enemy.y < 50) {
          enemy.y += enemy.speed;
        }
      }

      // Keep enemies in bounds
      if (enemy.x < 0) enemy.x = 0;
      if (enemy.x + enemy.width > canvas.width) enemy.x = canvas.width - enemy.width;

      // Enemy shooting
      if (enemy.type === 'tank' && prng() < 0.01) {
        enemyBullets.push({
          x: enemy.x + enemy.width / 2 - 2,
          y: enemy.y + enemy.height,
          width: 4,
          height: 10,
          speed: 4,
          color: '#FF4444',
          damage: 1,
        });
      }

      if (enemy.type === 'boss' && prng() < 0.02) {
        // Boss shoots triple bullets
        for (let j = -1; j <= 1; j++) {
          enemyBullets.push({
            x: enemy.x + enemy.width / 2 - 3 + j * 30,
            y: enemy.y + enemy.height,
            width: 6,
            height: 12,
            speed: 5,
            color: '#FFD700',
            damage: 1,
          });
        }
      }

      // Remove enemies that are off screen
      if (enemy.y > canvas.height) {
        enemies.splice(i, 1);
        combo = 0;
      }
    }
  }

  function drawEnemies() {
    enemies.forEach((enemy) => {
      context.save();

      // Draw enemy based on type
      if (enemy.type === 'boss') {
        // Boss appearance
        context.fillStyle = enemy.color;
        context.beginPath();
        context.moveTo(enemy.x + enemy.width / 2, enemy.y);
        context.lineTo(enemy.x + enemy.width, enemy.y + enemy.height / 2);
        context.lineTo(enemy.x + enemy.width * 0.8, enemy.y + enemy.height);
        context.lineTo(enemy.x + enemy.width * 0.2, enemy.y + enemy.height);
        context.lineTo(enemy.x, enemy.y + enemy.height / 2);
        context.closePath();
        context.fill();

        context.strokeStyle = '#FF00FF';
        context.lineWidth = 3;
        context.stroke();

        // Boss eyes
        context.fillStyle = '#FF0000';
        context.fillRect(enemy.x + enemy.width * 0.3, enemy.y + enemy.height * 0.3, 15, 15);
        context.fillRect(enemy.x + enemy.width * 0.7 - 15, enemy.y + enemy.height * 0.3, 15, 15);
      } else {
        // Regular enemy appearance
        context.fillStyle = enemy.color;
        context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 2;
        context.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Enemy details
        const detailColor = enemy.type === 'tank' ? '#FFD700' : '#FFFFFF';
        context.fillStyle = detailColor;
        context.fillRect(enemy.x + enemy.width / 2 - 5, enemy.y + 5, 10, 10);
      }

      // Health bar for enemies with health > 1
      if (enemy.maxHealth > 1) {
        const healthBarWidth = enemy.width;
        const healthBarHeight = 4;
        const healthPercent = enemy.health / enemy.maxHealth;

        context.fillStyle = '#333';
        context.fillRect(enemy.x, enemy.y - 10, healthBarWidth, healthBarHeight);

        context.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFD700' : '#FF0000';
        context.fillRect(enemy.x, enemy.y - 10, healthBarWidth * healthPercent, healthBarHeight);
      }

      context.restore();
    });
  }

  function updatePlayer() {
    // Movement
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

    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < canvas.height / 2) player.y = canvas.height / 2;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
  }

  function shoot() {
    const now = Date.now();
    if (now - player.lastShot < player.fireRate) return;

    player.lastShot = now;

    if (player.powerLevel === 1) {
      bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 15,
        speed: -8,
        color: '#00FFFF',
        damage: 1,
      });
    } else if (player.powerLevel === 2) {
      // Triple shot
      bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 15,
        speed: -8,
        color: '#00FFFF',
        damage: 1,
      });
      bullets.push({
        x: player.x + 10,
        y: player.y + 10,
        width: 4,
        height: 15,
        speed: -8,
        color: '#FF00FF',
        damage: 1,
      });
      bullets.push({
        x: player.x + player.width - 14,
        y: player.y + 10,
        width: 4,
        height: 15,
        speed: -8,
        color: '#FF00FF',
        damage: 1,
      });
    }

    playShootSound();
  }

  function updateBullets() {
    // Player bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.y += bullet.speed;

      if (bullet.y < 0) {
        bullets.splice(i, 1);
        continue;
      }

      // Check collision with enemies
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
          createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 10, enemy.color);

          if (enemy.health <= 0) {
            const points = enemy.type === 'boss' ? 1000 : enemy.type === 'tank' ? 100 : enemy.type === 'fast' ? 50 : 25;
            score += points;
            enemiesKilled++;
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            comboTimer = 180;

            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 30, enemy.color);
            enemies.splice(j, 1);

            // Spawn power-up chance
            if (prng() < 0.1) {
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
      bullet.y += bullet.speed;

      if (bullet.y > canvas.height) {
        enemyBullets.splice(i, 1);
        continue;
      }

      // Check collision with player
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
      context.fillStyle = bullet.color;
      context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

      // Add glow effect
      context.shadowColor = bullet.color;
      context.shadowBlur = 10;
      context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      context.shadowBlur = 0;
    });

    enemyBullets.forEach((bullet) => {
      context.fillStyle = bullet.color;
      context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

      context.shadowColor = bullet.color;
      context.shadowBlur = 8;
      context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      context.shadowBlur = 0;
    });
  }

  function spawnPowerUp(x: number, y: number) {
    const types: Array<'health' | 'rapid' | 'triple' | 'shield'> = ['health', 'rapid', 'triple', 'shield'];
    const type = types[Math.floor(prng() * types.length)];

    powerUps.push({
      x,
      y,
      width: 30,
      height: 30,
      type,
      speed: 2,
    });
  }

  function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const powerUp = powerUps[i];
      powerUp.y += powerUp.speed;

      if (powerUp.y > canvas.height) {
        powerUps.splice(i, 1);
        continue;
      }

      // Check collision with player
      if (
        powerUp.x < player.x + player.width &&
        powerUp.x + powerUp.width > player.x &&
        powerUp.y < player.y + player.height &&
        powerUp.y + powerUp.height > player.y
      ) {
        collectPowerUp(powerUp.type);
        powerUps.splice(i, 1);
        createParticles(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, 20, '#FFD700');
      }
    }
  }

  function collectPowerUp(type: 'health' | 'rapid' | 'triple' | 'shield') {
    switch (type) {
      case 'health':
        if (player.lives < 5) player.lives++;
        break;
      case 'rapid':
        player.fireRate = 150;
        setTimeout(() => (player.fireRate = 300), 10000);
        break;
      case 'triple':
        player.powerLevel = 2;
        setTimeout(() => (player.powerLevel = 1), 15000);
        break;
      case 'shield':
        player.invincible = true;
        setTimeout(() => (player.invincible = false), 8000);
        break;
    }
  }

  function drawPowerUps() {
    powerUps.forEach((powerUp) => {
      context.save();
      context.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
      context.rotate(Date.now() / 500);

      let icon = '';
      let color = '';

      switch (powerUp.type) {
        case 'health':
          icon = '❤️';
          color = '#FF0000';
          break;
        case 'rapid':
          icon = '⚡';
          color = '#FFFF00';
          break;
        case 'triple':
          icon = '🔱';
          color = '#00FFFF';
          break;
        case 'shield':
          icon = '🛡️';
          color = '#00FF00';
          break;
      }

      context.fillStyle = color;
      context.font = '24px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(icon, 0, 0);

      context.restore();
    });
  }

  function hitPlayer() {
    player.lives--;
    createParticles(player.x + player.width / 2, player.y + player.height / 2, 30, '#00FFFF');
    combo = 0;

    if (player.lives <= 0) {
      gameOver = true;
    } else {
      player.invincible = true;
      setTimeout(() => (player.invincible = false), 2000);
    }
  }

  function drawHUD() {
    context.font = '20px "Courier New"';
    context.fillStyle = 'white';
    context.strokeStyle = 'black';
    context.lineWidth = 2;

    context.strokeText(`SCORE: ${score}`, 10, 30);
    context.fillText(`SCORE: ${score}`, 10, 30);

    context.strokeText(`HI: ${highScore}`, canvas.width - 150, 30);
    context.fillText(`HI: ${highScore}`, canvas.width - 150, 30);

    context.strokeText(`WAVE: ${wave}`, canvas.width / 2 - 50, 30);
    context.fillText(`WAVE: ${wave}`, canvas.width / 2 - 50, 30);

    // Lives
    context.strokeText(`LIVES:`, 10, 60);
    context.fillText(`LIVES:`, 10, 60);

    for (let i = 0; i < player.lives; i++) {
      context.fillStyle = '#00FFFF';
      context.fillRect(90 + i * 25, 45, 20, 20);
    }

    // Combo
    if (combo > 1) {
      context.font = 'bold 24px Arial';
      context.fillStyle = '#FFD700';
      context.strokeStyle = '#FF4500';
      context.lineWidth = 2;
      context.textAlign = 'center';
      context.strokeText(`COMBO x${combo}!`, canvas.width / 2, canvas.height - 50);
      context.fillText(`COMBO x${combo}!`, canvas.width / 2, canvas.height - 50);
      context.textAlign = 'left';
    }

    // Active power-ups
    let yOffset = 90;
    context.font = '16px "Courier New"';
    if (player.invincible) {
      context.fillStyle = '#00FF00';
      context.fillText('🛡️ SHIELD', 10, yOffset);
      yOffset += 25;
    }
    if (player.powerLevel > 1) {
      context.fillStyle = '#00FFFF';
      context.fillText('🔱 TRIPLE SHOT', 10, yOffset);
      yOffset += 25;
    }
    if (player.fireRate < 300) {
      context.fillStyle = '#FFFF00';
      context.fillText('⚡ RAPID FIRE', 10, yOffset);
    }
  }

  function drawStartScreen() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const scale = 1 + Math.sin(Date.now() / 300) * 0.1;
    context.save();
    context.translate(canvas.width / 2, canvas.height / 3);
    context.scale(scale, scale);
    context.font = 'bold 48px "Courier New"';
    context.fillStyle = '#FFD700';
    context.strokeStyle = '#FF4500';
    context.lineWidth = 4;
    context.textAlign = 'center';
    context.strokeText('SPACE BLASTER', 0, 0);
    context.fillText('SPACE BLASTER', 0, 0);
    context.restore();

    context.font = 'bold 24px Arial';
    context.fillStyle = '#00FFFF';
    context.textAlign = 'center';
    context.fillText('RETRO EDITION', canvas.width / 2, canvas.height / 3 + 50);

    context.font = '18px "Courier New"';
    context.fillStyle = 'white';
    context.fillText('CONTROLS:', canvas.width / 2, canvas.height / 2);
    context.fillText('Arrow Keys / WASD - Move', canvas.width / 2, canvas.height / 2 + 30);
    context.fillText('SPACE - Shoot', canvas.width / 2, canvas.height / 2 + 60);

    context.font = '16px "Courier New"';
    context.fillStyle = '#FFD700';
    context.fillText('POWER-UPS:', canvas.width / 2, canvas.height / 2 + 110);
    context.font = '14px Arial';
    context.fillStyle = '#FF0000';
    context.fillText('❤️ Extra Life', canvas.width / 2, canvas.height / 2 + 135);
    context.fillStyle = '#FFFF00';
    context.fillText('⚡ Rapid Fire', canvas.width / 2, canvas.height / 2 + 160);
    context.fillStyle = '#00FFFF';
    context.fillText('🔱 Triple Shot', canvas.width / 2, canvas.height / 2 + 185);
    context.fillStyle = '#00FF00';
    context.fillText('🛡️ Shield', canvas.width / 2, canvas.height / 2 + 210);

    const alpha = Math.sin(Date.now() / 200) * 0.5 + 0.5;
    context.save();
    context.globalAlpha = alpha;
    context.font = 'bold 28px "Courier New"';
    context.fillStyle = '#FF00FF';
    context.fillText('>>> PRESS SPACE TO START <<<', canvas.width / 2, canvas.height - 80);
    context.restore();

    context.textAlign = 'left';
  }

  function drawGameOver() {
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = '48px "Courier New"';
    context.fillStyle = '#FF4444';
    context.strokeStyle = 'black';
    context.lineWidth = 4;
    context.textAlign = 'center';
    context.strokeText('GAME OVER', canvas.width / 2, canvas.height / 2 - 100);
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 100);

    context.font = '24px "Courier New"';
    context.fillStyle = 'white';
    context.fillText(`FINAL SCORE: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
    context.fillText(`WAVE REACHED: ${wave}`, canvas.width / 2, canvas.height / 2 + 20);
    context.fillText(`MAX COMBO: ${maxCombo}`, canvas.width / 2, canvas.height / 2 + 60);
    context.fillText(`ENEMIES KILLED: ${enemiesKilled}`, canvas.width / 2, canvas.height / 2 + 100);

    if (score > highScore) {
      context.font = 'bold 28px "Courier New"';
      context.fillStyle = '#FFD700';
      context.fillText('🏆 NEW HIGH SCORE! 🏆', canvas.width / 2, canvas.height / 2 + 150);
    }

    context.textAlign = 'left';
  }

  function updateHighScore() {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('spaceBlasterHighScore', highScore.toString());
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
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  function playExplosionSound() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  }

  function resetGame() {
    updateHighScore();

    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 100;
    player.lives = 3;
    player.invincible = false;
    player.fireRate = 300;
    player.powerLevel = 1;

    bullets.length = 0;
    enemyBullets.length = 0;
    enemies.length = 0;
    powerUps.length = 0;
    particles.length = 0;

    score = 0;
    wave = 1;
    enemiesKilled = 0;
    combo = 0;
    maxCombo = 0;
    comboTimer = 0;
    lastEnemySpawn = 0;
    enemySpawnInterval = 2000;

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

    context.clearRect(0, 0, canvas.width, canvas.height);

    updateStars();
    drawStars();

    if (!gameStarted) {
      drawStartScreen();
      requestAnimationFrame(gameLoop);
      return;
    }

    // Update game state
    updatePlayer();
    updateBullets();
    updateEnemies(deltaTime);
    updatePowerUps();
    updateParticles();

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
    if (enemies.length === 0 && now - lastEnemySpawn > 3000) {
      wave++;
      enemySpawnInterval = Math.max(500, enemySpawnInterval - 100);
    }

    // Draw everything
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawPowerUps();
    drawParticles();
    drawHUD();

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

  // Music
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

  function playRetroMusic() {
    if (musicPlaying) return;
    musicPlaying = true;

    initAudio();

    const melody = [
      { freq: 659.25, time: 0, duration: 0.15 },
      { freq: 659.25, time: 0.15, duration: 0.15 },
      { freq: 659.25, time: 0.3, duration: 0.15 },
      { freq: 523.25, time: 0.45, duration: 0.1 },
      { freq: 659.25, time: 0.55, duration: 0.15 },
      { freq: 783.99, time: 0.7, duration: 0.3 },
      { freq: 392.0, time: 1.0, duration: 0.3 },
    ];

    function playMusicLoop() {
      if (!modAudioContext || !analyser) return;

      melody.forEach((note) => {
        const osc = modAudioContext!.createOscillator();
        const gain = modAudioContext!.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(note.freq, modAudioContext!.currentTime + note.time);

        gain.gain.setValueAtTime(0.05, modAudioContext!.currentTime + note.time);
        gain.gain.exponentialRampToValueAtTime(0.01, modAudioContext!.currentTime + note.time + note.duration);

        osc.connect(gain);
        gain.connect(analyser!);

        osc.start(modAudioContext!.currentTime + note.time);
        osc.stop(modAudioContext!.currentTime + note.time + note.duration);
      });

      setTimeout(playMusicLoop, 1300);
    }

    playMusicLoop();
  }

  const musicButton = document.getElementById('musicButton')!;
  musicButton.addEventListener('click', () => {
    if (!musicPlaying) {
      playRetroMusic();
      musicButton.textContent = '🎵 Music Playing';
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
