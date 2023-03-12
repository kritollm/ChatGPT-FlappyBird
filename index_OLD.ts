// const canvas = <HTMLCanvasElement>document.getElementById('canvas');
// const context = canvas.getContext('2d');

// const buffer1Canvas = document.createElement('canvas');
// const buffer1Context = buffer1Canvas.getContext('2d');

// const buffer2Canvas = document.createElement('canvas');
// const buffer2Context = buffer2Canvas.getContext('2d');

// const birdSprite = new Image();

// const bird = {
//   x: 50,
//   y: 250,
//   width: 50,
//   height: 50,
//   vy: 0,
//   gravity: 0.1,
//   jumpPower: -3,
//   spriteIndex: 0,
// };

// const pipeWidth = 50;
// const pipeGap = 100;

// const pipeSpeed = 2;
// const pipeColor = 'green';
// const bufferWidth = canvas.width + pipeWidth * 2;

// const buffers = [buffer1Context, buffer2Context];
// let currentBufferIndex = 0;
// let currentBufferX = 0;

// const drawBird = () => {
//   context.drawImage(
//     birdSprite,
//     bird.spriteIndex * bird.width,
//     0,
//     birdSprite.width,
//     birdSprite.height,
//     bird.x,
//     bird.y,
//     bird.width,
//     bird.height
//   );
// };

// function getRandomGapSize() {
//   // Velg et tilfeldig tall mellom 50 og halvparten av canvas-høyden for gap-størrelse
//   return Math.floor(Math.random() * (canvas.height / 2 - 50)) + 50;
// }

// function getRandomPipePosition() {
//   // Velg et tilfeldig tall mellom 50 og halvparten av canvas-høyden for øvre hindringens plassering
//   const upperPipeY = Math.floor(Math.random() * (canvas.height / 2 - 50)) + 50;
//   // Beregn plasseringen av nedre hindring basert på gap-størrelsen og øvre hindrings plassering
//   const gapSize = getRandomGapSize();
//   const lowerPipeY = upperPipeY + gapSize + pipeWidth;
//   return [upperPipeY, lowerPipeY];
// }

// function drawPipes(bufferContext, startX) {
//   let pipeX = startX + bufferWidth;
//   while (pipeX > startX - pipeWidth) {
//     const [upperPipeY, lowerPipeY] = getRandomPipePosition();
//     bufferContext.fillStyle = pipeColor;
//     bufferContext.fillRect(pipeX - pipeWidth, 0, pipeWidth, upperPipeY);
//     bufferContext.fillRect(
//       pipeX - pipeWidth,
//       lowerPipeY,
//       pipeWidth,
//       canvas.height - lowerPipeY
//     );
//     pipeX -= pipeWidth + canvas.width / 2;
//   }
// }

// const updateBuffers = () => {
//   currentBufferX += pipeSpeed;
//   if (currentBufferX > bufferWidth) {
//     currentBufferIndex = (currentBufferIndex + 1) % buffers.length;
//     currentBufferX = -canvas.width / 2;
//     const nextBufferContext = buffers[currentBufferIndex];
//     nextBufferContext.clearRect(0, 0, bufferWidth, canvas.height);
//     drawPipes(nextBufferContext, currentBufferX);
//   }
// };

// const updateBird = () => {
//   bird.vy += bird.gravity;
//   bird.y += bird.vy;
//   bird.spriteIndex = 0; //bird.vy >= 0 ? 1 : 0;
// };

// const handleInput = (event) => {
//   bird.vy = bird.jumpPower;
// };

// const gameLoop = () => {
//   context.clearRect(0, 0, canvas.width, canvas.height);
//   updateBuffers();
//   context.drawImage(buffers[currentBufferIndex].canvas, -currentBufferX, 0);
//   updateBird();
//   drawBird();
//   requestAnimationFrame(gameLoop);
// };

// canvas.width = window.innerWidth - pipeWidth * 2;
// canvas.height = window.innerHeight;

// buffer1Canvas.width = bufferWidth;
// buffer1Canvas.height = canvas.height;
// drawPipes(buffer1Context, 0);

// buffer2Canvas.width = bufferWidth;

// buffer2Canvas.height = canvas.height;
// drawPipes(buffer2Context, 0);

// canvas.addEventListener('mousedown', handleInput);

// birdSprite.width = 500;
// birdSprite.height = 500;
// birdSprite.onload = () => {
//   console.log('gameLoop');
//   gameLoop();
// };
// birdSprite.onerror = (e) => {
//   console.log('Det skjedde en feil under lasting av bildet');
//   console.log(e);
// };
// console.log(birdSprite);
// birdSprite.src =
//   'https://cdn.jsdelivr.net/gh/kritollm/ChatGPT-FlappyBird@main/bird.png';
// //gameLoop();
