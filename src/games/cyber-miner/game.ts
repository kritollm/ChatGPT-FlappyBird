export default async function loadCyberMiner() {
  const app = document.getElementById('app')!;

  app.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, #1a0033 0%, #0a0015 100%);
      position: relative;
    ">
      <h1 style="
        color: #00ffff;
        text-shadow: 0 0 20px #00ffff, 0 0 40px #ff00ff;
        margin: 10px 0;
        font-size: clamp(20px, 5vw, 36px);
        text-align: center;
        letter-spacing: 4px;
        z-index: 10;
      ">⚡ CYBER MINER ⚡</h1>

      <div id="gameContainer" style="
        position: relative;
        box-shadow: 0 0 40px rgba(0, 255, 255, 0.6), inset 0 0 40px rgba(255, 0, 255, 0.2);
        border: 3px solid #00ffff;
        border-radius: 15px;
        overflow: hidden;
        margin: 10px;
        max-width: calc(100vw - 20px);
        max-height: calc(100vh - 220px);
        background: rgba(10, 0, 21, 0.9);
      ">
        <canvas id="canvas" width="640" height="640" style="
          display: block;
          background: linear-gradient(135deg, #0a0015 0%, #1a0033 50%, #0a0015 100%);
          width: 100%;
          height: auto;
        "></canvas>

        <div id="hud" style="
          position: absolute;
          top: -55px;
          left: 0;
          right: 0;
          width: 100%;
          pointer-events: none;
          z-index: 100;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 5px;
        ">
          <div style="display: inline-flex; align-items: center; margin: 0; padding: 4px 8px; background: rgba(0, 0, 0, 0.8); border: 2px solid #00ffff; border-radius: 4px; font-size: clamp(10px, 1.8vw, 13px); color: #00ffff; text-shadow: 0 0 5px #00ffff; font-weight: bold; white-space: nowrap;">
            LEVEL: <span id="level">1</span>
          </div>
          <div style="display: inline-flex; align-items: center; margin: 0; padding: 4px 8px; background: rgba(0, 0, 0, 0.8); border: 2px solid #00ffff; border-radius: 4px; font-size: clamp(10px, 1.8vw, 13px); color: #00ffff; text-shadow: 0 0 5px #00ffff; font-weight: bold; white-space: nowrap;">
            CORES: <span id="cores">0</span>/<span id="totalCores">0</span>
          </div>
          <div id="timeDisplay" style="display: inline-flex; align-items: center; margin: 0; padding: 4px 8px; background: rgba(0, 0, 0, 0.8); border: 2px solid #00ffff; border-radius: 4px; font-size: clamp(10px, 1.8vw, 13px); color: #00ffff; text-shadow: 0 0 5px #00ffff; font-weight: bold; white-space: nowrap;">
            TIME: <span id="time">30</span>
          </div>
          <div style="display: inline-flex; align-items: center; margin: 0; padding: 4px 8px; background: rgba(0, 0, 0, 0.8); border: 2px solid #00ffff; border-radius: 4px; font-size: clamp(10px, 1.8vw, 13px); color: #00ffff; text-shadow: 0 0 5px #00ffff; font-weight: bold; white-space: nowrap;">
            SCORE: <span id="score">0</span>
          </div>
          <div style="display: inline-flex; align-items: center; margin: 0; padding: 4px 8px; background: rgba(0, 0, 0, 0.8); border: 2px solid #ff00ff; border-radius: 4px; font-size: clamp(10px, 1.8vw, 13px); color: #ff00ff; text-shadow: 0 0 5px #ff00ff; font-weight: bold; white-space: nowrap;">
            COMBO: <span id="combo">0</span>
          </div>
        </div>

        <div id="gameOverScreen" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.95);
          border: 3px solid #ff0066;
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          display: none;
          z-index: 200;
          box-shadow: 0 0 50px rgba(255, 0, 102, 0.8);
        ">
          <h2 style="color: #ff0066; font-size: clamp(24px, 5vw, 48px); text-shadow: 0 0 20px #ff0066; margin-bottom: 20px;">
            SYSTEM BREACH
          </h2>
          <p style="color: #00ffff; font-size: clamp(14px, 3vw, 18px); margin: 10px 0;">
            Final Score: <span id="finalScore">0</span>
          </p>
          <p style="color: #00ffff; font-size: clamp(14px, 3vw, 18px); margin: 10px 0;">
            Cores Collected: <span id="finalCores">0</span>
          </p>
          <p style="color: #00ffff; font-size: clamp(14px, 3vw, 18px); margin: 10px 0;">
            Max Combo: <span id="maxCombo">0</span>
          </p>
          <button id="rebootButton" style="
            padding: 10px 20px;
            margin: 10px;
            font-size: clamp(12px, 2.5vw, 16px);
            font-family: 'Courier New', monospace;
            color: #00ffff;
            background: linear-gradient(135deg, #1a0033 0%, #2a0055 100%);
            border: 2px solid #00ffff;
            border-radius: 8px;
            cursor: pointer;
            text-transform: uppercase;
            font-weight: bold;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
            letter-spacing: 2px;
          ">REBOOT SYSTEM</button>
        </div>

        <div id="touchControls" style="
          display: none;
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
        ">
          <div style="display: grid; grid-template-columns: repeat(3, 50px); grid-template-rows: repeat(3, 50px); gap: 5px;">
            <div></div>
            <button class="touch-btn" data-dir="up" style="
              background: rgba(0, 255, 255, 0.3);
              border: 2px solid #00ffff;
              border-radius: 10px;
              color: #00ffff;
              font-size: 24px;
              cursor: pointer;
              box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            ">↑</button>
            <div></div>
            <button class="touch-btn" data-dir="left" style="
              background: rgba(0, 255, 255, 0.3);
              border: 2px solid #00ffff;
              border-radius: 10px;
              color: #00ffff;
              font-size: 24px;
              cursor: pointer;
              box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            ">←</button>
            <div></div>
            <button class="touch-btn" data-dir="right" style="
              background: rgba(0, 255, 255, 0.3);
              border: 2px solid #00ffff;
              border-radius: 10px;
              color: #00ffff;
              font-size: 24px;
              cursor: pointer;
              box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            ">→</button>
            <div></div>
            <button class="touch-btn" data-dir="down" style="
              background: rgba(0, 255, 255, 0.3);
              border: 2px solid #00ffff;
              border-radius: 10px;
              color: #00ffff;
              font-size: 24px;
              cursor: pointer;
              box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            ">↓</button>
            <div></div>
          </div>
        </div>
      </div>

      <div id="controls" style="margin: 10px; text-align: center; z-index: 10;">
        <button id="startButton" style="
          padding: 10px 20px;
          margin: 5px;
          font-size: clamp(12px, 2.5vw, 16px);
          font-family: 'Courier New', monospace;
          color: #00ffff;
          background: linear-gradient(135deg, #1a0033 0%, #2a0055 100%);
          border: 2px solid #00ffff;
          border-radius: 8px;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
          letter-spacing: 2px;
        ">INITIATE HACK</button>
        <button id="musicButton" style="
          padding: 10px 20px;
          margin: 5px;
          font-size: clamp(12px, 2.5vw, 16px);
          font-family: 'Courier New', monospace;
          color: #00ffff;
          background: linear-gradient(135deg, #1a0033 0%, #2a0055 100%);
          border: 2px solid #00ffff;
          border-radius: 8px;
          cursor: pointer;
          text-transform: uppercase;
          font-weight: bold;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
          letter-spacing: 2px;
        ">🎵 ENABLE AUDIO</button>
      </div>

      <div style="
        color: #00ffff;
        text-align: center;
        margin: 10px;
        font-size: clamp(10px, 2vw, 14px);
        text-shadow: 0 0 5px rgba(0, 255, 255, 0.8);
        max-width: 600px;
        line-height: 1.6;
        z-index: 10;
      ">
        <span style="color: #ff00ff; font-weight: bold;">PILTASTER</span> eller <span style="color: #ff00ff; font-weight: bold;">WASD</span> for å bevege | Samle <span style="color: #ff00ff; font-weight: bold;">ENERGY CORES</span> | Unngå <span style="color: #ff00ff; font-weight: bold;">DATA BLOCKS</span>
      </div>
    </div>
  `;

  // Detect touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    const touchControls = document.getElementById('touchControls')!;
    touchControls.style.display = 'block';
  }

  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  const GRID_SIZE = 32;
  const GRID_WIDTH = 20;
  const GRID_HEIGHT = 20;
  const LEVEL_TIME = 30;

  enum TileType {
    EMPTY = 0,
    WALL = 1,
    DIRT = 2,
    DATA_BLOCK = 3,
    ENERGY_CORE = 4,
    FIREWALL = 5,
    VIRUS = 6,
    EXIT = 7,
  }

  let gameStarted = false;
  let gameOver = false;
  let level = 1;
  let score = 0;
  let timeLeft = LEVEL_TIME;
  let combo = 0;
  let maxCombo = 0;
  let coresCollected = 0;
  let totalCores = 0;

  let grid: TileType[][] = [];

  const player = {
    x: 1,
    y: 1,
    moving: false,
    animFrame: 0,
    glowPhase: 0,
  };

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
  const fallingObjects = new Set<string>();

  let audioContext: AudioContext | null = null;
  let musicEnabled = false;
  let currentOscillators: OscillatorNode[] = [];

  function init() {
    canvas.width = GRID_WIDTH * GRID_SIZE;
    canvas.height = GRID_HEIGHT * GRID_SIZE;
    generateLevel();
    setupControls();
    requestAnimationFrame(gameLoop);
  }

  function generateLevel() {
    grid = [];

    for (let y = 0; y < GRID_HEIGHT; y++) {
      grid[y] = [];
      for (let x = 0; x < GRID_WIDTH; x++) {
        grid[y][x] = TileType.EMPTY;
      }
    }

    for (let y = 0; y < GRID_HEIGHT; y++) {
      grid[y][0] = TileType.WALL;
      grid[y][GRID_WIDTH - 1] = TileType.WALL;
    }
    for (let x = 0; x < GRID_WIDTH; x++) {
      grid[0][x] = TileType.WALL;
      grid[GRID_HEIGHT - 1][x] = TileType.WALL;
    }

    player.x = 1;
    player.y = 1;

    for (let y = 2; y < GRID_HEIGHT - 2; y++) {
      for (let x = 1; x < GRID_WIDTH - 1; x++) {
        if (Math.random() < 0.7) {
          grid[y][x] = TileType.DIRT;
        }
      }
    }

    // Place ENERGY CORES first (priority)
    const numCores = 5 + level;
    totalCores = numCores;
    coresCollected = 0;
    for (let i = 0; i < numCores; i++) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 50) {
        const x = Math.floor(Math.random() * (GRID_WIDTH - 4)) + 2;
        const y = Math.floor(Math.random() * (GRID_HEIGHT - 4)) + 2;
        if (grid[y][x] === TileType.DIRT) {
          grid[y][x] = TileType.ENERGY_CORE;
          placed = true;
        }
        attempts++;
      }
    }

    // Then place DATA_BLOCKS on remaining DIRT
    const numBlocks = 15 + level * 2;
    for (let i = 0; i < numBlocks; i++) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 50) {
        const x = Math.floor(Math.random() * (GRID_WIDTH - 4)) + 2;
        const y = Math.floor(Math.random() * (GRID_HEIGHT - 4)) + 2;
        if (grid[y][x] === TileType.DIRT) {
          grid[y][x] = TileType.DATA_BLOCK;
          placed = true;
        }
        attempts++;
      }
    }

    grid[GRID_HEIGHT - 2][GRID_WIDTH - 2] = TileType.EXIT;

    timeLeft = LEVEL_TIME;
    combo = 0;

    updateHUD();
  }

  function movePlayer(dx: number, dy: number) {
    if (!gameStarted || gameOver) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) {
      return;
    }

    const targetTile = grid[newY][newX];

    if (targetTile === TileType.WALL || targetTile === TileType.DATA_BLOCK) {
      return;
    }

    if (targetTile === TileType.EXIT) {
      if (coresCollected >= totalCores) {
        nextLevel();
        return;
      } else {
        createParticles(newX * GRID_SIZE + GRID_SIZE / 2, newY * GRID_SIZE + GRID_SIZE / 2, 10, '#ff0066');
        return;
      }
    }

    if (targetTile === TileType.ENERGY_CORE) {
      coresCollected++;
      score += 100 * (combo + 1);
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      createParticles(newX * GRID_SIZE + GRID_SIZE / 2, newY * GRID_SIZE + GRID_SIZE / 2, 20, '#00ffff');
      playCollectSound();
      player.x = newX;
      player.y = newY;
      // Remove core with slight delay to prevent instant falling object crush
      setTimeout(() => {
        grid[newY][newX] = TileType.EMPTY;
        checkFalling();
      }, 50);
      updateHUD();
      return;
    } else {
      combo = 0;
    }

    player.x = newX;
    player.y = newY;

    if (targetTile === TileType.DIRT) {
      createParticles(newX * GRID_SIZE + GRID_SIZE / 2, newY * GRID_SIZE + GRID_SIZE / 2, 8, '#9370db');
      grid[newY][newX] = TileType.EMPTY;
    }

    updateHUD();
    checkFalling();
  }

  function checkFalling() {
    fallingObjects.clear();

    for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
      for (let x = 1; x < GRID_WIDTH - 1; x++) {
        if (grid[y][x] === TileType.DATA_BLOCK || grid[y][x] === TileType.ENERGY_CORE) {
          if (grid[y + 1][x] === TileType.EMPTY) {
            fallingObjects.add(`${x},${y}`);
          }
        }
      }
    }
  }

  function updateFalling() {
    const toMove: any[] = [];
    fallingObjects.forEach((key) => {
      const [x, y] = key.split(',').map(Number);
      if (grid[y] && grid[y][x] !== undefined) {
        const type = grid[y][x];
        if (y + 1 < GRID_HEIGHT && grid[y + 1][x] === TileType.EMPTY) {
          toMove.push({ fromX: x, fromY: y, toX: x, toY: y + 1, type });
        }
      }
    });

    toMove.forEach((move) => {
      grid[move.fromY][move.fromX] = TileType.EMPTY;
      grid[move.toY][move.toX] = move.type;

      if (move.toX === player.x && move.toY === player.y) {
        playerDie();
      }
    });

    if (toMove.length > 0) {
      setTimeout(() => checkFalling(), 200);
    }
  }

  function playerDie() {
    gameOver = true;
    createParticles(player.x * GRID_SIZE + GRID_SIZE / 2, player.y * GRID_SIZE + GRID_SIZE / 2, 50, '#ff0066');
    showGameOver();
  }

  function nextLevel() {
    level++;
    score += Math.floor(timeLeft * 50);
    createParticles(player.x * GRID_SIZE + GRID_SIZE / 2, player.y * GRID_SIZE + GRID_SIZE / 2, 30, '#00ff00');
    playVictorySound();
    setTimeout(() => {
      generateLevel();
    }, 1000);
  }

  function createParticles(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 60,
        maxLife: 60,
        color,
        size: Math.random() * 3 + 1,
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life--;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticles() {
    particles.forEach((p) => {
      const alpha = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    });
  }

  function draw() {
    ctx.fillStyle = '#0a0015';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GRID_SIZE, 0);
      ctx.lineTo(x * GRID_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GRID_SIZE);
      ctx.lineTo(canvas.width, y * GRID_SIZE);
      ctx.stroke();
    }

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const tile = grid[y][x];
        const px = x * GRID_SIZE;
        const py = y * GRID_SIZE;

        switch (tile) {
          case TileType.WALL:
            drawWall(px, py);
            break;
          case TileType.DIRT:
            drawDirt(px, py);
            break;
          case TileType.DATA_BLOCK:
            drawDataBlock(px, py);
            break;
          case TileType.ENERGY_CORE:
            drawEnergyCore(px, py);
            break;
          case TileType.EXIT:
            drawExit(px, py);
            break;
        }
      }
    }

    drawPlayer();
    drawParticles();

    ctx.fillStyle = 'rgba(0, 255, 255, 0.02)';
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 2);
    }
  }

  function drawWall(x: number, y: number) {
    ctx.fillStyle = '#1a0033';
    ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff00ff';
    ctx.strokeRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    ctx.shadowBlur = 0;
  }

  function drawDirt(x: number, y: number) {
    ctx.fillStyle = '#2a1a4a';
    ctx.fillRect(x + 4, y + 4, GRID_SIZE - 8, GRID_SIZE - 8);
    ctx.fillStyle = 'rgba(138, 43, 226, 0.3)';
    ctx.fillRect(x + 6, y + 6, 4, 4);
    ctx.fillRect(x + GRID_SIZE - 10, y + GRID_SIZE - 10, 4, 4);
  }

  function drawDataBlock(x: number, y: number) {
    const time = Date.now() / 1000;
    const glow = Math.sin(time * 3) * 0.3 + 0.7;
    ctx.save();
    ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);
    ctx.shadowBlur = 20 * glow;
    ctx.shadowColor = '#00ffff';
    ctx.fillStyle = `rgba(0, 255, 255, ${0.3 * glow})`;
    ctx.fillRect(-GRID_SIZE / 3, -GRID_SIZE / 3, (GRID_SIZE * 2) / 3, (GRID_SIZE * 2) / 3);
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-GRID_SIZE / 3, -GRID_SIZE / 3, (GRID_SIZE * 2) / 3, (GRID_SIZE * 2) / 3);
    ctx.restore();
  }

  function drawEnergyCore(x: number, y: number) {
    const time = Date.now() / 500;
    const pulse = Math.sin(time) * 0.3 + 0.7;
    const rotate = time * 2;
    ctx.save();
    ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);
    ctx.rotate(rotate);
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';

    ctx.beginPath();
    ctx.moveTo(0, -10 * pulse);
    ctx.lineTo(8 * pulse, 0);
    ctx.lineTo(0, 10 * pulse);
    ctx.lineTo(-8 * pulse, 0);
    ctx.closePath();
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * pulse);
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(0.5, '#ff00ff');
    gradient.addColorStop(1, '#00ffff');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawExit(x: number, y: number) {
    const time = Date.now() / 1000;
    const active = coresCollected >= totalCores;
    const color = active ? '#00ff00' : '#ff0066';
    ctx.save();
    ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);

    if (active) {
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#00ff00';
      const rotate = time * 2;
      ctx.rotate(rotate);
    } else {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0066';
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, GRID_SIZE / 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, GRID_SIZE / 4, 0, Math.PI * 2);
    ctx.stroke();

    // Draw indicator dot instead of text for cleaner look
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } function drawPlayer() {
    const time = Date.now() / 500;
    player.glowPhase = Math.sin(time) * 0.3 + 0.7;
    const px = player.x * GRID_SIZE + GRID_SIZE / 2;
    const py = player.y * GRID_SIZE + GRID_SIZE / 2;
    ctx.save();
    ctx.translate(px, py);
    ctx.shadowBlur = 30 * player.glowPhase;
    ctx.shadowColor = '#ff00ff';

    ctx.beginPath();
    ctx.arc(0, 0, GRID_SIZE / 3, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, GRID_SIZE / 3);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(0.7, '#00ffff');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function updateHUD() {
    document.getElementById('level')!.textContent = level.toString();
    document.getElementById('cores')!.textContent = coresCollected.toString();
    document.getElementById('totalCores')!.textContent = totalCores.toString();
    const timeValue = Math.max(0, Math.ceil(timeLeft));
    document.getElementById('time')!.textContent = timeValue.toString();
    document.getElementById('score')!.textContent = score.toString();
    document.getElementById('combo')!.textContent = combo.toString();

    const timeDisplay = document.getElementById('timeDisplay')!;
    if (timeLeft < 10) {
      timeDisplay.style.borderColor = '#ff0066';
      timeDisplay.style.color = '#ff0066';
      timeDisplay.style.textShadow = '0 0 10px #ff0066';
    } else {
      timeDisplay.style.borderColor = '#00ffff';
      timeDisplay.style.color = '#00ffff';
      timeDisplay.style.textShadow = '0 0 5px #00ffff';
    }
  }

  function showGameOver() {
    const gameOverScreen = document.getElementById('gameOverScreen')!;
    document.getElementById('finalScore')!.textContent = score.toString();
    document.getElementById('finalCores')!.textContent = coresCollected.toString();
    document.getElementById('maxCombo')!.textContent = maxCombo.toString();
    gameOverScreen.style.display = 'block';
  }

  function setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!gameStarted || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer(1, 0);
          break;
      }
    });

    // Touch controls
    document.querySelectorAll('.touch-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const dir = (e.target as HTMLElement).dataset.dir;
        switch (dir) {
          case 'up':
            movePlayer(0, -1);
            break;
          case 'down':
            movePlayer(0, 1);
            break;
          case 'left':
            movePlayer(-1, 0);
            break;
          case 'right':
            movePlayer(1, 0);
            break;
        }
      });
    });

    document.getElementById('startButton')!.addEventListener('click', () => {
      gameStarted = true;
      const btn = document.getElementById('startButton')! as HTMLButtonElement;
      btn.textContent = 'HACKING...';
      btn.disabled = true;
    });

    document.getElementById('musicButton')!.addEventListener('click', () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      musicEnabled = !musicEnabled;
      document.getElementById('musicButton')!.textContent = musicEnabled ? '🎵 AUDIO ON' : '🎵 AUDIO OFF';
      if (musicEnabled) {
        playBackgroundMusic();
      } else {
        stopBackgroundMusic();
      }
    });

    document.getElementById('rebootButton')!.addEventListener('click', () => {
      location.reload();
    });
  }

  function playCollectSound() {
    if (!musicEnabled || !audioContext) return;

    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Silently fail if audio has issues
    }
  }

  function playVictorySound() {
    if (!musicEnabled || !audioContext) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = audioContext!.createOscillator();
      const gain = audioContext!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, audioContext!.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.1, audioContext!.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext!.currentTime + i * 0.1 + 0.2);
      osc.connect(gain);
      gain.connect(audioContext!.destination);
      osc.start(audioContext!.currentTime + i * 0.1);
      osc.stop(audioContext!.currentTime + i * 0.1 + 0.2);
    });
  }

  function playBackgroundMusic() {
    if (!musicEnabled || !audioContext) return;
    stopBackgroundMusic();

    const bass = audioContext.createOscillator();
    const bassGain = audioContext.createGain();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(110, audioContext.currentTime);
    bassGain.gain.setValueAtTime(0.05, audioContext.currentTime);
    bass.connect(bassGain);
    bassGain.connect(audioContext.destination);
    bass.start();
    currentOscillators.push(bass);

    const notes = [440, 554.37, 659.25];
    let noteIndex = 0;

    function playArpNote() {
      if (!musicEnabled || !audioContext) return;

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(notes[noteIndex], audioContext.currentTime);
      gain.gain.setValueAtTime(0.03, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.2);

      noteIndex = (noteIndex + 1) % notes.length;
      setTimeout(playArpNote, 200);
    }

    playArpNote();
  }

  function stopBackgroundMusic() {
    currentOscillators.forEach((osc) => osc.stop());
    currentOscillators = [];
  }

  let lastTime = 0;
  let fallingTimer = 0;

  function gameLoop(timestamp: number) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (gameStarted && !gameOver) {
      timeLeft -= deltaTime / 1000;
      if (timeLeft <= 0) {
        playerDie();
      }

      fallingTimer += deltaTime;
      if (fallingTimer >= 500) {
        fallingTimer = 0;
        updateFalling();
      }

      updateParticles();
      updateHUD();
    }

    draw();
    requestAnimationFrame(gameLoop);
  }

  init();
}
