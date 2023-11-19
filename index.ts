import seedrandom from 'seedrandom';
// Importerer Howler
import { Howl, Howler } from 'howler';

const seed = 'min-seed-verdi';
const prng = seedrandom(seed);

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');

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
let startTime = Date.now();
let gameOver = false;

let difficultyTimer = 0;
let difficultyInterval = 15000; // Øk vanskelighetsgraden hvert 15. sekund

// Definerer lydeffekten for flakse-handlingen
const flapSound = new Howl({
  src: ['path/to/flap-sound.mp3'] // Erstatt med riktig filsti til din lydeffekt
});

// Funksjon for å håndtere flakse-handlingen
function flap() {
  // Kode for å få fuglen til å flakse

  // Spiller av lydeffekten
  flapSound.play();
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
  console.log("ResetButton");
  restartButton.style.display = 'block';
}

function resetGame() {
  bird.lives = 3;
  bird.y = canvas.height / 2;
  bird.vy = 0;
  bird.invincible = false;
  pipes = [];
  startTime = Date.now();
  difficultyTimer = 0;
  pipeSpeed = 2;
  pipeGap = 100;
  score = 0;
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
    });
  } else if (!lastPipe) {
    const [upperPipeY, lowerPipeY] = getRandomPipePosition();
    pipes.push({ x: canvas.width, upperPipeY, lowerPipeY });
  }
}

function drawPipes() {
  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;
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
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  context.fillText(`Time: ${elapsedTime}s`, 10, 90);
}

function handleNewLife() {
  bird.lives -= 1;
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
};

const gameLoop = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const elapsedTime = Date.now() - startTime;
  updateDifficulty(elapsedTime);
  updateBird();
  drawBird();
  updatePipes();
  drawPipes();
  drawHUD();

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
  }else{
    showRestartButton();
  }
};

canvas.addEventListener('mousedown', handleInput);

birdSprite.width = 500;
birdSprite.height = 500;
birdSprite.onload = () => {
  console.log('gameLoop');
  resetGame();
};
birdSprite.onerror = (e) => {
  console.log('Det skjedde en feil under lasting av bildet');
  console.log(e);
};
birdSprite.src =
  'https://cdn.jsdelivr.net/gh/kritollm/ChatGPT-FlappyBird@main/bird.png';
