import seedrandom from 'seedrandom';

const seed = 'min-seed-verdi';
const prng = seedrandom(seed);

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const context = canvas.getContext('2d');

const buffer1Canvas = document.createElement('canvas');
const buffer1Context = buffer1Canvas.getContext('2d');

const buffer2Canvas = document.createElement('canvas');
const buffer2Context = buffer2Canvas.getContext('2d');

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
};

const pipeWidth = 50;
const pipeGap = 100;

const pipeSpeed = 2;
const pipeColor = 'green';

const buffers = [buffer1Context, buffer2Context];
let currentBufferIndex = 0;
let pipes = [];

function rectsCollide(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

const drawBird = () => {
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
};

function getRandomGapSize() {
  // Velg et tilfeldig tall mellom 50 og halvparten av canvas-høyden for gap-størrelse
  return Math.min(Math.floor(prng() * 50 + 200), 180);
}

const maxGapDistance = 200; // Angir maksimal avstand mellom gapene

function getRandomPipePosition() {
  // Velg et tilfeldig tall mellom 50 og halvparten av canvas-høyden for øvre hindringens plassering
  const lastPipe = pipes[pipes.length - 1];
  const minUpperPipeY = lastPipe ? lastPipe.upperPipeY + maxGapDistance : 50;
  // Beregn plasseringen av nedre hindring basert på gap-størrelsen og øvre hindrings plassering
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
    });
  } else if (!lastPipe) {
    const [upperPipeY, lowerPipeY] = getRandomPipePosition();
    pipes.push({ x: canvas.width, upperPipeY, lowerPipeY });
  }
}
let gameOver = false;

const updateBuffers = () => {
  currentBufferIndex = (currentBufferIndex + 1) % buffers.length;

  const nextBufferContext = buffers[currentBufferIndex];
  nextBufferContext.clearRect(0, 0, canvas.width, canvas.height);
  updatePipes();
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
      rectsCollide(birdRect, upperPipeRect) ||
      rectsCollide(birdRect, lowerPipeRect) ||
      bird.y < 0 ||
      bird.y + bird.height > canvas.height
    ) {
      console.log('Game over');
      return true;
    }
    return false;
  });
  if(gameOver) return;
  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;
    nextBufferContext.fillStyle = pipeColor;
    nextBufferContext.fillRect(pipe.x, 0, pipeWidth, pipe.upperPipeY);
    nextBufferContext.fillRect(
      pipe.x,
      pipe.lowerPipeY,
      pipeWidth,
      canvas.height - pipe.lowerPipeY
    );
  });
  // Gjenta loopen
  requestAnimationFrame(gameLoop);
};

const updateBird = () => {
  bird.vy += bird.gravity;
  bird.y += bird.vy;
  bird.spriteIndex = 0;
};

const handleInput = (event) => {
  bird.vy = bird.jumpPower;
};

const gameLoop = () => {
  // Oppdater den aktive bufferen og tegn den på skjermen
  const activeBufferContext = buffers[currentBufferIndex];
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(activeBufferContext.canvas, 0, 0);
  updateBird();
  drawBird();

  // Oppdater fuglen og tegn den på skjermen

  updateBuffers();
};

// canvas.width = window.innerWidth - pipeWidth * 2;
// canvas.height = window.innerHeight;

const pipePositions = [];

for (let i = 0; i < canvas.width; i += pipeWidth + canvas.width / 2) {
  const [upperPipeY, lowerPipeY] = getRandomPipePosition();
  pipePositions.push([i, upperPipeY, lowerPipeY]);
}

buffer1Canvas.width = canvas.width;
buffer1Canvas.height = canvas.height;

buffer2Canvas.width = canvas.width;
buffer2Canvas.height = canvas.height;

canvas.addEventListener('mousedown', handleInput);

birdSprite.width = 500;
birdSprite.height = 500;
birdSprite.onload = () => {
  console.log('gameLoop');
  gameLoop();
};
birdSprite.onerror = (e) => {
  console.log('Det skjedde en feil under lasting av bildet');
  console.log(e);
};
console.log(birdSprite);
birdSprite.src =
  'https://cdn.jsdelivr.net/gh/kritollm/ChatGPT-FlappyBird@main/bird.png';
//gameLoop();
