import seedrandom from 'seedrandom';
// Importerer Howler
import { Howl, Howler } from 'howler';

const seed = 'min-seed-verdi';
const prng = seedrandom(seed);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');

// Equalizer canvas
const eqCanvas = document.getElementById('eqCanvas') as HTMLCanvasElement;
const eqContext = eqCanvas.getContext('2d');

const birdSprite = new Image();

const bird = {
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
};

const pipeWidth = 50;
let pipeGap = 100;
let pipeSpeed = 2;
const pipeColor = 'green';

let pipes = [];
let score = 0;
let highScore = Number(localStorage.getItem('highScore')) || 0;
let startTime = Date.now();
let gameOver = false;

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

const stars: Star[] = [];
const STAR_COUNT = 50;

let difficultyTimer = 0;
let difficultyInterval = 15000; // Øk vanskelighetsgraden hvert 15. sekund

// Particle system
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

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // gravity
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

// MOD Player & Equalizer
let modPlayer: any = null;
let analyser: AnalyserNode | null = null;
let modAudioContext: AudioContext | null = null;
let dataArray: Uint8Array | null = null;
let bufferLength: number = 0;

function initModPlayer() {
  // This will be initialized when chiptune2.js loads
  if ((window as any).ChiptuneJsPlayer) {
    modAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyser = modAudioContext.createAnalyser();
    analyser.fftSize = 128;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    modPlayer = new (window as any).ChiptuneJsPlayer(new (window as any).ChiptuneJsConfig(-1));
  }
}

function loadModFile(url: string) {
  if (!modPlayer || !analyser || !modAudioContext) {
    console.log('MOD player not ready yet');
    return;
  }

  fetch(url)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const source = modAudioContext!.createBufferSource();
      modPlayer.load(buffer, (loadedBuffer: AudioBuffer) => {
        source.buffer = loadedBuffer;
        source.connect(analyser!);
        analyser!.connect(modAudioContext!.destination);
        source.loop = true;
        source.start(0);
      });
    })
    .catch(err => console.error('Error loading MOD file:', err));
}

function drawEqualizer() {
  if (!analyser || !dataArray || !eqContext) return;

  // @ts-ignore - TypeScript strict type checking issue with Uint8Array
  analyser.getByteFrequencyData(dataArray);

  eqContext.fillStyle = 'rgba(0, 0, 0, 0.3)';
  eqContext.fillRect(0, 0, eqCanvas.width, eqCanvas.height);

  const barWidth = (eqCanvas.width / bufferLength) * 2;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * eqCanvas.height;

    // Retro color cycling effect
    const hue = (i * 3 + Date.now() / 20) % 360;
    eqContext.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;

    eqContext.fillRect(
      x,
      eqCanvas.height - barHeight,
      barWidth - 1,
      barHeight
    );

    x += barWidth;
  }
}

// CRT Scanline effect
function drawScanlines() {
  context.save();
  context.globalAlpha = 0.1;
  context.fillStyle = 'black';
  for (let y = 0; y < canvas.height; y += 3) {
    context.fillRect(0, y, canvas.width, 1);
  }
  context.restore();
}

function initStars() {
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: prng() * canvas.width,
      y: prng() * canvas.height,
      size: prng() * 2 + 1,
      speed: prng() * 0.5 + 0.2,
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
  context.fillStyle = 'white';
  stars.forEach((star) => {
    context.fillRect(star.x, star.y, star.size, star.size);
  });
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore.toString());
  }
}

// Definerer lydeffekten for flakse-handlingen
let flapSound = new Howl({
  src: [
    'https://raw.githubusercontent.com/kritollm/ChatGPT-FlappyBird/main/sound/244978_3008343-lq.mp3',
  ],
  //src: ['path/to/flap-sound.mp3'] // Erstatt med riktig filsti til din lydeffekt
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

// Funksjon for å håndtere flakse-handlingen
function flap() {
  // Spiller av lydeffekten
  flapSound.play && flapSound.play();
}

function increaseDifficulty() {
  pipeSpeed += 0.5; // Øk rørhastigheten
  if (pipeGap > 75) {
    pipeGap -= 5; // Reduser avstanden mellom rørene hvis den er større enn 75
  }
}

const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', () => {
  restartButton.style.display = 'none';
  resetGame();
});

function showRestartButton() {
  console.log('ResetButton');
  restartButton.style.display = 'block';
}

function resetGame() {
  updateHighScore();
  bird.lives = 3;
  bird.y = canvas.height / 2;
  bird.vy = 0;
  bird.gravity = 0.1;
  bird.invincible = false;
  pipes = [];
  startTime = Date.now();
  difficultyTimer = 0;
  pipeSpeed = 2;
  pipeGap = 100;
  score = 0;
  initStars();
  gameOver = false;
  gameLoop();
}

const updateDifficulty = (elapsedTime) => {
  if (elapsedTime - difficultyTimer >= difficultyInterval) {
    increaseDifficulty();
    difficultyTimer = elapsedTime;
  }
};

function rectsCollide(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

let blinkInterval = 200; // Kontrollerer blinkhastigheten
function drawBaseBird() {
  context.drawImage(
    birdSprite,
    bird.spriteIndex * bird.width,
    0,
    birdSprite.width,
    birdSprite.height,
    bird.x,
    bird.y,
    bird.width,
    bird.height
  );
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
  const upperPipeY =
    Math.floor(prng() * (maxUpperPipeY - minUpperPipeY + 1)) + minUpperPipeY;

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
  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;
    if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
      score += 1;
      pipe.scored = true;
      playScoreBeep();
      updateHighScore();
      // Add score particles!
      createParticles(bird.x + bird.width / 2, bird.y + bird.height / 2, 15, '#FFD700');
    }
    context.fillStyle = pipeColor;
    context.fillRect(pipe.x, 0, pipeWidth, pipe.upperPipeY);
    context.fillRect(
      pipe.x,
      pipe.lowerPipeY,
      pipeWidth,
      canvas.height - pipe.lowerPipeY
    );
  });
}

function drawHUD() {
  context.font = '24px Arial';
  context.fillStyle = 'black';
  context.fillText(`Score: ${score}`, 10, 30);
  context.fillText(`Lives: ${bird.lives}`, 10, 60);
  context.fillText(`High: ${highScore}`, canvas.width - 120, 30);
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  context.fillText(`Time: ${elapsedTime}s`, 10, 90);
}

function drawGameOver() {
  context.font = '48px Arial';
  context.fillStyle = 'red';
  context.textAlign = 'center';
  context.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 100);
  context.textAlign = 'start';
}

function handleNewLife() {
  bird.lives -= 1;
  // Collision particles!
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

const handleInput = (event) => {
  bird.vy = bird.jumpPower;
  flap();
};

const gameLoop = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  updateStars();
  drawStars();
  const elapsedTime = Date.now() - startTime;
  updateDifficulty(elapsedTime);
  updateBird();
  drawBird();
  updatePipes();
  drawPipes();
  updateParticles();
  drawParticles();
  drawScanlines();
  drawHUD();

  // Draw equalizer continuously
  drawEqualizer();

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
      if (bird.lives > 1) {
        handleNewLife();
        return false;
      } else {
        console.log('Game over');
        return true;
      }
    }
    return false;
  });

  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  } else {
    drawGameOver();
    updateHighScore();
    showRestartButton();
  }
};

canvas.addEventListener('mousedown', handleInput);
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    handleInput(e);
    bird.gravity = 0.05;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    bird.gravity = 0.1;
  }
});

birdSprite.width = 500;
birdSprite.height = 500;
birdSprite.onload = () => {
  console.log('gameLoop');
  initStars();
  resetGame();

  // Initialize MOD player after a short delay (to let chiptune2.js load)
  setTimeout(() => {
    initModPlayer();
  }, 1000);
};
birdSprite.onerror = (e) => {
  console.log('Det skjedde en feil under lasting av bildet');
  console.log(e);
};
birdSprite.src =
  'https://cdn.jsdelivr.net/gh/kritollm/ChatGPT-FlappyBird@main/gfx/dallebird.png';

// Music control button
const musicButton = document.getElementById('musicButton');
if (musicButton) {
  musicButton.addEventListener('click', () => {
    if (!modPlayer) {
      initModPlayer();
    }
    // Load a classic Amiga MOD file - using a free one from modarchive
    // Using a simple approach with Web Audio instead since MOD files require special handling
    // For now, we'll create a retro chiptune using oscillators
    playRetroMusic();
  });
}

// Fallback: Create retro chiptune music with Web Audio API
let musicPlaying = false;
function playRetroMusic() {
  if (musicPlaying) return;
  musicPlaying = true;

  if (!modAudioContext) {
    modAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyser = modAudioContext.createAnalyser();
    analyser.fftSize = 128;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    analyser.connect(modAudioContext.destination);
  }

  // Create a simple Amiga-style chiptune loop
  const notes = [
    { freq: 523.25, time: 0 },    // C5
    { freq: 587.33, time: 0.15 },  // D5
    { freq: 659.25, time: 0.3 },   // E5
    { freq: 783.99, time: 0.45 },  // G5
    { freq: 659.25, time: 0.6 },   // E5
    { freq: 587.33, time: 0.75 },  // D5
    { freq: 523.25, time: 0.9 },   // C5
    { freq: 440.00, time: 1.05 },  // A4
  ];

  function playChiptuneLoop() {
    if (!modAudioContext || !analyser) return;

    notes.forEach(note => {
      const osc = modAudioContext!.createOscillator();
      const gain = modAudioContext!.createGain();

      osc.type = 'square'; // Classic chiptune sound
      osc.frequency.setValueAtTime(note.freq, modAudioContext!.currentTime + note.time);

      gain.gain.setValueAtTime(0.1, modAudioContext!.currentTime + note.time);
      gain.gain.exponentialRampToValueAtTime(0.01, modAudioContext!.currentTime + note.time + 0.15);

      osc.connect(gain);
      gain.connect(analyser!);

      osc.start(modAudioContext!.currentTime + note.time);
      osc.stop(modAudioContext!.currentTime + note.time + 0.15);
    });

    setTimeout(playChiptuneLoop, 1200);
  }

  playChiptuneLoop();
}
