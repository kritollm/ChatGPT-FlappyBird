// CYBER MINER - Original Grid-Based Puzzle Action Game
// 100% Original - No Copyright Issues

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Game constants
const GRID_SIZE = 32;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const FPS = 60;
const LEVEL_TIME = 30;

// Tile types
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

// Game state
let gameStarted = false;
let gameOver = false;
let level = 1;
let score = 0;
let timeLeft = LEVEL_TIME;
let combo = 0;
let maxCombo = 0;
let coresCollected = 0;
let totalCores = 0;

// Grid
let grid: number[][] = [];

// Player
const player = {
  x: 1,
  y: 1,
  moving: false,
  animFrame: 0,
  glowPhase: 0,
};

// Particles
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

// Falling objects tracking
const fallingObjects: Set<string> = new Set();

// Music system
let audioContext: AudioContext | null = null;
let musicEnabled = false;
let currentOscillators: OscillatorNode[] = [];

// Initialize
function init() {
  // Set canvas size
  canvas.width = GRID_WIDTH * GRID_SIZE;
  canvas.height = GRID_HEIGHT * GRID_SIZE;

  // Generate first level
  generateLevel();

  // Setup controls
  setupControls();

  // Start game loop
  requestAnimationFrame(gameLoop);
}

// Generate level
function generateLevel() {
  grid = [];

  // Create empty grid
  for (let y = 0; y < GRID_HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      grid[y][x] = TileType.EMPTY;
    }
  }

  // Add walls around edges
  for (let y = 0; y < GRID_HEIGHT; y++) {
    grid[y][0] = TileType.WALL;
    grid[y][GRID_WIDTH - 1] = TileType.WALL;
  }
  for (let x = 0; x < GRID_WIDTH; x++) {
    grid[0][x] = TileType.WALL;
    grid[GRID_HEIGHT - 1][x] = TileType.WALL;
  }

  // Place player
  player.x = 1;
  player.y = 1;

  // Fill with dirt (70% chance)
  for (let y = 2; y < GRID_HEIGHT - 2; y++) {
    for (let x = 1; x < GRID_WIDTH - 1; x++) {
      if (Math.random() < 0.7) {
        grid[y][x] = TileType.DIRT;
      }
    }
  }

  // Place data blocks (falling obstacles)
  const numBlocks = 15 + level * 2;
  for (let i = 0; i < numBlocks; i++) {
    const x = Math.floor(Math.random() * (GRID_WIDTH - 4)) + 2;
    const y = Math.floor(Math.random() * (GRID_HEIGHT - 4)) + 2;
    if (grid[y][x] === TileType.DIRT) {
      grid[y][x] = TileType.DATA_BLOCK;
    }
  }

  // Place energy cores (collectibles)
  const numCores = 5 + level;
  totalCores = numCores;
  coresCollected = 0;
  for (let i = 0; i < numCores; i++) {
    const x = Math.floor(Math.random() * (GRID_WIDTH - 4)) + 2;
    const y = Math.floor(Math.random() * (GRID_HEIGHT - 4)) + 2;
    if (grid[y][x] === TileType.DIRT) {
      grid[y][x] = TileType.ENERGY_CORE;
    }
  }

  // Place exit
  grid[GRID_HEIGHT - 2][GRID_WIDTH - 2] = TileType.EXIT;

  // Reset timer
  timeLeft = LEVEL_TIME;
  combo = 0;

  // Update HUD
  updateHUD();
}

// Player movement
function movePlayer(dx: number, dy: number) {
  if (!gameStarted || gameOver) return;

  const newX = player.x + dx;
  const newY = player.y + dy;

  // Check bounds
  if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) {
    return;
  }

  const targetTile = grid[newY][newX];

  // Check if can move
  if (targetTile === TileType.WALL || targetTile === TileType.DATA_BLOCK) {
    return;
  }

  // Check if exit
  if (targetTile === TileType.EXIT) {
    if (coresCollected >= totalCores) {
      nextLevel();
      return;
    } else {
      // Can't exit yet
      createParticles(newX * GRID_SIZE + GRID_SIZE / 2, newY * GRID_SIZE + GRID_SIZE / 2, 10, '#ff0066');
      return;
    }
  }

  // Collect energy core
  if (targetTile === TileType.ENERGY_CORE) {
    coresCollected++;
    score += 100 * (combo + 1);
    combo++;
    if (combo > maxCombo) maxCombo = combo;
    createParticles(newX * GRID_SIZE + GRID_SIZE / 2, newY * GRID_SIZE + GRID_SIZE / 2, 20, '#00ffff');
    playCollectSound();
  } else {
    // Reset combo if not collecting
    combo = 0;
  }

  // Move player
  player.x = newX;
  player.y = newY;

  // Remove dirt/core
  if (targetTile === TileType.DIRT) {
    createParticles(newX * GRID_SIZE + GRID_SIZE / 2, newY * GRID_SIZE + GRID_SIZE / 2, 8, '#9370db');
  }

  grid[newY][newX] = TileType.EMPTY;

  // Update HUD
  updateHUD();

  // Check falling
  checkFalling();
}

// Check for falling blocks
function checkFalling() {
  fallingObjects.clear();

  // Check from bottom to top
  for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
    for (let x = 1; x < GRID_WIDTH - 1; x++) {
      if (grid[y][x] === TileType.DATA_BLOCK || grid[y][x] === TileType.ENERGY_CORE) {
        // Check if empty below
        if (grid[y + 1][x] === TileType.EMPTY) {
          fallingObjects.add(`${x},${y}`);
        }
      }
    }
  }
}

// Update falling objects
function updateFalling() {
  const toMove: Array<{fromX: number, fromY: number, toX: number, toY: number, type: number}> = [];

  fallingObjects.forEach(key => {
    const [x, y] = key.split(',').map(Number);
    if (grid[y] && grid[y][x] !== undefined) {
      const type = grid[y][x];
      if (y + 1 < GRID_HEIGHT && grid[y + 1][x] === TileType.EMPTY) {
        toMove.push({fromX: x, fromY: y, toX: x, toY: y + 1, type});
      }
    }
  });

  // Execute moves
  toMove.forEach(move => {
    grid[move.fromY][move.fromX] = TileType.EMPTY;
    grid[move.toY][move.toX] = move.type;

    // Check if crushes player
    if (move.toX === player.x && move.toY === player.y) {
      playerDie();
    }
  });

  // Recheck falling
  if (toMove.length > 0) {
    setTimeout(() => checkFalling(), 200);
  }
}

// Player death
function playerDie() {
  gameOver = true;
  createParticles(player.x * GRID_SIZE + GRID_SIZE / 2, player.y * GRID_SIZE + GRID_SIZE / 2, 50, '#ff0066');
  showGameOver();
}

// Next level
function nextLevel() {
  level++;
  score += timeLeft * 50;
  createParticles(player.x * GRID_SIZE + GRID_SIZE / 2, player.y * GRID_SIZE + GRID_SIZE / 2, 30, '#00ff00');
  playVictorySound();
  setTimeout(() => {
    generateLevel();
  }, 1000);
}

// Particles
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
  particles.forEach(p => {
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

// Drawing
function draw() {
  // Clear
  ctx.fillStyle = '#0a0015';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines (cyber grid)
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

  // Draw tiles
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

  // Draw player
  drawPlayer();

  // Draw particles
  drawParticles();

  // Draw scanlines
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

  // Glow effect
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#ff00ff';
  ctx.strokeRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
  ctx.shadowBlur = 0;
}

function drawDirt(x: number, y: number) {
  ctx.fillStyle = '#2a1a4a';
  ctx.fillRect(x + 4, y + 4, GRID_SIZE - 8, GRID_SIZE - 8);

  // Pattern
  ctx.fillStyle = 'rgba(138, 43, 226, 0.3)';
  ctx.fillRect(x + 6, y + 6, 4, 4);
  ctx.fillRect(x + GRID_SIZE - 10, y + GRID_SIZE - 10, 4, 4);
}

function drawDataBlock(x: number, y: number) {
  const time = Date.now() / 1000;
  const glow = Math.sin(time * 3) * 0.3 + 0.7;

  ctx.save();
  ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);

  // Outer glow
  ctx.shadowBlur = 20 * glow;
  ctx.shadowColor = '#00ffff';

  // Main block
  ctx.fillStyle = `rgba(0, 255, 255, ${0.3 * glow})`;
  ctx.fillRect(-GRID_SIZE / 3, -GRID_SIZE / 3, GRID_SIZE * 2 / 3, GRID_SIZE * 2 / 3);

  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(-GRID_SIZE / 3, -GRID_SIZE / 3, GRID_SIZE * 2 / 3, GRID_SIZE * 2 / 3);

  ctx.restore();
}

function drawEnergyCore(x: number, y: number) {
  const time = Date.now() / 500;
  const pulse = Math.sin(time) * 0.3 + 0.7;
  const rotate = time * 2;

  ctx.save();
  ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);
  ctx.rotate(rotate);

  // Glow
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00ffff';

  // Diamond shape
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
  const color = active ? '#00ff00' : '#666666';

  ctx.save();
  ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);

  if (active) {
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00ff00';

    // Rotating portal effect
    const rotate = time * 2;
    ctx.rotate(rotate);
  }

  // Portal
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, GRID_SIZE / 3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, GRID_SIZE / 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawPlayer() {
  const time = Date.now() / 500;
  player.glowPhase = Math.sin(time) * 0.3 + 0.7;

  const px = player.x * GRID_SIZE + GRID_SIZE / 2;
  const py = player.y * GRID_SIZE + GRID_SIZE / 2;

  ctx.save();
  ctx.translate(px, py);

  // Glow effect
  ctx.shadowBlur = 30 * player.glowPhase;
  ctx.shadowColor = '#ff00ff';

  // Main body - circle
  ctx.beginPath();
  ctx.arc(0, 0, GRID_SIZE / 3, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, GRID_SIZE / 3);
  gradient.addColorStop(0, '#ff00ff');
  gradient.addColorStop(0.7, '#00ffff');
  gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Update HUD
function updateHUD() {
  document.getElementById('level')!.textContent = level.toString();
  document.getElementById('cores')!.textContent = coresCollected.toString();
  document.getElementById('totalCores')!.textContent = totalCores.toString();
  document.getElementById('time')!.textContent = Math.ceil(timeLeft).toString();
  document.getElementById('score')!.textContent = score.toString();
  document.getElementById('combo')!.textContent = combo.toString();

  // Danger time
  const timeDisplay = document.getElementById('timeDisplay')!;
  if (timeLeft < 10) {
    timeDisplay.classList.add('danger');
  } else {
    timeDisplay.classList.remove('danger');
  }
}

// Show game over
function showGameOver() {
  const gameOverScreen = document.getElementById('gameOverScreen')!;
  document.getElementById('finalScore')!.textContent = score.toString();
  document.getElementById('finalCores')!.textContent = coresCollected.toString();
  document.getElementById('maxCombo')!.textContent = maxCombo.toString();
  gameOverScreen.style.display = 'block';
}

// Controls
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

  document.getElementById('startButton')!.addEventListener('click', () => {
    gameStarted = true;
    document.getElementById('startButton')!.textContent = 'HACKING...';
    (document.getElementById('startButton')! as HTMLButtonElement).disabled = true;
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
}

// Audio
function playCollectSound() {
  if (!musicEnabled || !audioContext) return;

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
}

function playVictorySound() {
  if (!musicEnabled || !audioContext) return;

  const notes = [523.25, 659.25, 783.99, 1046.50];
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

  // Simple bassline
  const bass = audioContext.createOscillator();
  const bassGain = audioContext.createGain();

  bass.type = 'sawtooth';
  bass.frequency.setValueAtTime(110, audioContext.currentTime);

  bassGain.gain.setValueAtTime(0.05, audioContext.currentTime);

  bass.connect(bassGain);
  bassGain.connect(audioContext.destination);

  bass.start();
  currentOscillators.push(bass);

  // Arpeggio
  const notes = [440, 554.37, 659.25];
  let noteIndex = 0;

  function playArpNote() {
    if (!musicEnabled) return;

    const osc = audioContext!.createOscillator();
    const gain = audioContext!.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(notes[noteIndex], audioContext!.currentTime);

    gain.gain.setValueAtTime(0.03, audioContext!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext!.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(audioContext!.destination);

    osc.start();
    osc.stop(audioContext!.currentTime + 0.2);

    noteIndex = (noteIndex + 1) % notes.length;
    setTimeout(playArpNote, 200);
  }

  playArpNote();
}

function stopBackgroundMusic() {
  currentOscillators.forEach(osc => osc.stop());
  currentOscillators = [];
}

// Game loop
let lastTime = 0;
let fallingTimer = 0;

function gameLoop(timestamp: number) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  if (gameStarted && !gameOver) {
    // Update timer
    timeLeft -= deltaTime / 1000;
    if (timeLeft <= 0) {
      playerDie();
    }

    // Update falling (every 500ms)
    fallingTimer += deltaTime;
    if (fallingTimer >= 500) {
      fallingTimer = 0;
      updateFalling();
    }

    // Update particles
    updateParticles();

    // Update HUD
    updateHUD();
  }

  // Draw
  draw();

  requestAnimationFrame(gameLoop);
}

// Start
init();
