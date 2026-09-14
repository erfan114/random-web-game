/** @type {HTMLCanvasElement} */
const canvasElement = document.getElementById("my-game");
const ctx = canvasElement.getContext("2d");

const fpsElement = document.getElementById("my-fps");
const scoreElement = document.getElementById("my-score");
const barElement = document.getElementById("bar");
const pauseElement = document.getElementById("pause");

const PLAYER_SPEED = 0.3;
const PLAYER_RADIUS = 10;
const ENTITY_RADIUS = 7;

function clear() {
  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
}

const INITIAL_POSITION = [canvasElement.width / 2, canvasElement.height / 2];
const INITIAL_VELOCITY = [0, 0];
const INITIAL_SCORE = 0;

let position = [...INITIAL_POSITION];
let velocity = [...INITIAL_VELOCITY];
let currentScore = INITIAL_SCORE;

function renderPlayer() {
  ctx.fillStyle = "hsl(237, 100%, 50%)";
  ctx.beginPath();
  ctx.arc(position[0], position[1], PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

const activeKeys = new Set();

let paused = false;

function togglePause() {
  if (paused) {
    pauseElement.style.display = "none";
  } else {
    pauseElement.style.display = "flex";
  }

  paused = !paused;
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Escape") {
    togglePause();

    return;
  }

  if (event.code === "KeyR") {
    restart();

    if (paused) {
      togglePause();
    }

    return;
  }

  activeKeys.add(event.code);
});

document.addEventListener("keyup", (event) => {
  activeKeys.delete(event.code);
});

const MAX_VELOCITY = 1;
const VELOCITY_THRESHOLD = 0.05;
const VELOCITY_DRAIN_SPEED = 0.1;

function getI(value) {
  return value < 0 ? -1 : 1;
}

function calculateVelocity() {
  for (const key of activeKeys) {
    if (key === "KeyW") {
      velocity[1] = Math.max(velocity[1] - VELOCITY_THRESHOLD, -MAX_VELOCITY);
    }

    if (key === "KeyS") {
      velocity[1] = Math.min(velocity[1] + VELOCITY_THRESHOLD, MAX_VELOCITY);
    }

    if (key === "KeyA") {
      velocity[0] = Math.max(velocity[0] - VELOCITY_THRESHOLD, -MAX_VELOCITY);
    }

    if (key === "KeyD") {
      velocity[0] = Math.min(velocity[0] + VELOCITY_THRESHOLD, MAX_VELOCITY);
    }
  }

  if (Math.abs(velocity[1]) > 0) {
    const i = getI(velocity[1]);

    velocity[1] -= VELOCITY_THRESHOLD * VELOCITY_DRAIN_SPEED * i;
  }

  if (Math.abs(velocity[0]) > 0) {
    const i = getI(velocity[0]);

    velocity[0] -= VELOCITY_THRESHOLD * VELOCITY_DRAIN_SPEED * i;
  }
}

const MAX_TRACE = 10;

const playerTrace = [];

function traceLastPositions() {
  if (playerTrace.length >= MAX_TRACE) {
    playerTrace.shift();
  }

  playerTrace.push(Array.from(position));
}

const PLAYER_COLOR_MIN = 30;
const PLAYER_COLOR_MAX = 60;
const COLOR_DIFF = 5;

function renderPlayerTrace() {
  for (let i = 0; i < playerTrace.length; i++) {
    const trace = playerTrace[i];
    const stepMultiplier = i / playerTrace.length;
    const color =
      PLAYER_COLOR_MIN + (PLAYER_COLOR_MAX - PLAYER_COLOR_MIN) * stepMultiplier;
    const light = 50 - COLOR_DIFF + stepMultiplier * COLOR_DIFF;

    ctx.fillStyle = `hsl(${color}, 100%, ${light}%)`;
    ctx.beginPath();
    ctx.arc(trace[0], trace[1], PLAYER_RADIUS * stepMultiplier, 0, Math.PI * 2);
    ctx.fill();
  }
}

function movePlayer(diff) {
  position[0] += velocity[0] * diff * PLAYER_SPEED;
  position[1] += velocity[1] * diff * PLAYER_SPEED;
}

function clamp(min, value, max) {
  return Math.min(Math.max(min, value), max);
}

function xBound(value, r) {
  return clamp(r, value, canvasElement.width - r);
}

function yBound(value, r) {
  return clamp(r, value, canvasElement.height - r);
}

function boundaryCheck() {
  position[0] = xBound(position[0], PLAYER_RADIUS);
  position[1] = yBound(position[1], PLAYER_RADIUS);
}

const currentEntities = new Set();

const MAX_POSSIBLE_ENTITIES = 50;
const MAX_VALUE = 50;
const MIN_VALUE = 10;

function generateEntity() {
  if (currentEntities.size >= MAX_POSSIBLE_ENTITIES) return;

  const x = clamp(
    ENTITY_RADIUS,
    Math.random() * canvasElement.width,
    canvasElement.width - ENTITY_RADIUS,
  );

  const y = clamp(
    ENTITY_RADIUS,
    Math.random() * canvasElement.height,
    canvasElement.height - ENTITY_RADIUS,
  );

  const score = Math.round(MIN_VALUE + Math.random() * (MAX_VALUE - MIN_VALUE));

  currentEntities.add({
    x,
    y,
    score,
  });
}

const DANGER_RADIUS = 100;

const MAX_ESCAPE_SPEED = 4;
const MIN_ESCAPE_SPEED = 2;

function escapeEntities() {
  const totalRadius = PLAYER_RADIUS + DANGER_RADIUS + ENTITY_RADIUS;

  for (const entity of currentEntities) {
    const { x, y, score } = entity;

    const dx = x - position[0];
    const dy = y - position[1];

    const distance = Math.hypot(dx, dy);

    if (distance > totalRadius || distance === 0) {
      continue;
    }

    const scoreSpeed = score / MAX_VALUE;
    const dynamicSpeed =
      MAX_ESCAPE_SPEED * (1 - distance / totalRadius) * scoreSpeed;

    // Direction away from the player
    const nx = dx / distance;
    const ny = dy / distance;

    entity.x = xBound(entity.x + nx * dynamicSpeed, ENTITY_RADIUS);
    entity.y = yBound(entity.y + ny * dynamicSpeed, ENTITY_RADIUS);
  }
}

const MAX_REMAINING_TIMER = 1000;
const INITIAL_TIMER_DRAIN = 1;

let remainingTimer = MAX_REMAINING_TIMER;
let timerDrain = INITIAL_TIMER_DRAIN;

function updateRemainingTime() {
  remainingTimer = Math.max(remainingTimer - timerDrain, 0);
}

function restart() {
  position = [...INITIAL_POSITION];
  velocity = [...INITIAL_VELOCITY];
  currentScore = INITIAL_SCORE;
  remainingTimer = MAX_REMAINING_TIMER;
  currentEntities.clear();
  activeKeys.clear();
}

function checkRemainingTime() {
  if (remainingTimer > 0) return;

  alert(`You lost, score: ${currentScore}`);
  restart();
}

function addRemainingTime(v) {
  remainingTimer = Math.min(remainingTimer + v, MAX_REMAINING_TIMER);
}

function checkEntitiesCollision() {
  const totalRadius = PLAYER_RADIUS + ENTITY_RADIUS;

  for (const entity of currentEntities) {
    const { x, y, score } = entity;

    const dx = x - position[0];
    const dy = y - position[1];

    const delta = Math.hypot(dx, dy);

    if (delta > totalRadius) {
      continue;
    }

    currentScore += score;
    addRemainingTime(score);

    currentEntities.delete(entity);
  }
}

function renderEntities() {
  for (const { x, y, score } of currentEntities) {
    ctx.fillStyle = `hsl(51, 100%, ${score}%)`;
    ctx.beginPath();
    ctx.arc(x, y, ENTITY_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}

let currentFPS;

function calculateFPS(diff) {
  const total = 1000 / diff;

  currentFPS = Math.round(total);
}

function updateUI() {
  fpsElement.innerText = currentFPS;
  scoreElement.innerText = currentScore;
  barElement.style.width = `${(remainingTimer / MAX_REMAINING_TIMER) * 100}%`;
}

let lastTime = performance.now();

function loop() {
  const now = performance.now();
  const diff = now - lastTime;

  lastTime = now;

  if (!paused) {
    clear();
    calculateVelocity();
    renderPlayerTrace();
    movePlayer(diff);
    boundaryCheck();
    generateEntity();
    checkEntitiesCollision();
    escapeEntities();
    updateRemainingTime();
    checkRemainingTime();
    renderPlayer();
    renderEntities();

    calculateFPS(diff);
  }

  requestAnimationFrame(loop);
}

setInterval(traceLastPositions, 10);
setInterval(updateUI, 100);

loop();
