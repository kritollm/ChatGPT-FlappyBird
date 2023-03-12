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
  width: 30,
  height: 30,
  vy: 0,
  gravity: 0.1,
  jumpPower: -3,
  spriteIndex: 0,
};

const pipeWidth = 50;
const pipeGap = 100;

const pipeSpeed = 2;
const pipeColor = 'green';
const bufferWidth = canvas.width + pipeWidth * 2;

const buffers = [buffer1Context, buffer2Context];
let currentBufferIndex = 0;
let currentBufferX = 0;

const drawBird = () => {
  context.drawImage(
    birdSprite,
    bird.spriteIndex * bird.width,
    0,
    bird.width,
    bird.height,
    bird.x,
    bird.y,
    bird.width,
    bird.height
  );
};

const drawPipes = (bufferContext, startX) => {
  let pipeX = startX;
  while (pipeX < startX + bufferWidth) {
    bufferContext.fillStyle = pipeColor;
    bufferContext.fillRect(pipeX, 0, pipeWidth, pipeGap);
    bufferContext.fillRect(
      pipeX,
      pipeGap + pipeWidth,
      pipeWidth,
      canvas.height - pipeGap - pipeWidth
    );
    pipeX += pipeWidth + canvas.width / 2;
  }
};

const updateBuffers = () => {
  currentBufferX -= pipeSpeed;
  if (currentBufferX < -bufferWidth) {
    currentBufferIndex = (currentBufferIndex + 1) % buffers.length;
    currentBufferX = 0;
    const nextBufferContext = buffers[currentBufferIndex];
    nextBufferContext.clearRect(0, 0, bufferWidth, canvas.height);
    drawPipes(nextBufferContext, currentBufferX);
  }
};

const updateBird = () => {
  bird.vy += bird.gravity;
  bird.y += bird.vy;
  bird.spriteIndex = bird.vy >= 0 ? 1 : 0;
};

const handleInput = (event) => {
  bird.vy = bird.jumpPower;
};

const gameLoop = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  updateBuffers();
  context.drawImage(buffers[currentBufferIndex].canvas, -currentBufferX, 0);
  updateBird();
  drawBird();
  requestAnimationFrame(gameLoop);
};

canvas.width = window.innerWidth - pipeWidth * 2;
canvas.height = window.innerHeight;

buffer1Canvas.width = bufferWidth;
buffer1Canvas.height = canvas.height;
drawPipes(buffer1Context, 0);

buffer2Canvas.width = bufferWidth;

buffer2Canvas.height = canvas.height;
drawPipes(buffer2Context, 0);

canvas.addEventListener('mousedown', handleInput);

birdSprite.width = 50;
birdSprite.height = 50;
birdSprite.style.width = '50px';
birdSprite.style.height = '50px';
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
  'https://stackblitz.com/files/typescript-esnhgy/github/kritollm/ChatGPT-FlappyBird/main/DALL·E 2023-03-12 19.09.26.png';
//gameLoop();
