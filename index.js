// @ts-check

// * MATH

/**
 * @param {number} min
 * @param {number} value
 * @param {number} max
 */
function clamp(min, value, max) {
  return Math.min(Math.max(min, value), max);
}

class NumericRange {
  #min;
  #max;

  /**
   * @param {number} min
   * @param {number} max
   */
  constructor(min, max) {
    this.#min = min;
    this.#max = max;
  }

  /**
   * @param {number} pad
   */
  random(pad = 0) {
    const min = this.#min + pad;
    const max = this.#max - pad;

    return min + Math.random() * (max - min);
  }

  /**
   * @param {number} pad
   */
  randomInt(pad = 0) {
    return Math.round(this.random(pad));
  }
}

// * CONSTANTS

const BACKGROUND_COLOR = "lightblue";

const SCREEN_PADDING = 10;

const PLAYER_SPEED = 0.3;
const PLAYER_RADIUS = 10;

const ENTITY_RADIUS = 7;
const MAX_ENTITY_VALUE = 50;
const MIN_ENTITY_VALUE = 10;
const MAX_ENTITY_COUNT = 50;

const DANGER_RADIUS = 100;
const MAX_ESCAPE_SPEED = 4;

const MAX_VELOCITY = 1;
const VELOCITY_THRESHOLD = 0.05;
const VELOCITY_DRAIN_SPEED = 0.1;

const MAX_TRACE = 10;

const PLAYER_COLOR_MIN = 30;
const PLAYER_COLOR_MAX = 60;
const COLOR_DIFF = 5;

const MAX_REMAINING_TIMER = 1000;
const REMAINING_TIMER_DRAIN = 1;

const BAR_HEIGHT = 10;

const JOYSTICK_CONTAINER_SIZE = 200;
const JOYSTICK_SIZE = 100;

const PAUSE_BUTTON_TEXT = "Toggle pause";
const RESET_BUTTON_TEXT = "Restart";

// * ID

function createIDGenerator() {
  const generator = (function* () {
    let i = 1;

    while (true) {
      yield i++;
    }
  })();

  return () => generator.next().value.toString(16);
}

const generateID = createIDGenerator();

// * ELEMENT FACTORIES

/**
 * @param {number} size
 */
function createCanvasElement(size) {
  const element = document.createElement("canvas");

  element.id = generateID();
  element.width = size;
  element.height = size;

  return element;
}

/**
 * @param {string} initial
 */
function createTextElement(initial) {
  const element = document.createElement("span");

  element.id = generateID();
  element.style.color = "white";
  element.innerText = initial;

  return element;
}

/**
 * @param {HTMLSpanElement} fpsElement
 * @param {HTMLSpanElement} scoreElement
 */
function createInfoElement(fpsElement, scoreElement) {
  const element = document.createElement("div");

  element.id = generateID();
  element.style.position = "fixed";
  element.style.display = "flex";
  element.style.flexDirection = "column";
  element.style.left = "0px";
  element.style.top = "0px";
  element.style.padding = "1rem";
  element.style.color = "white";

  const fpsWrapperElement = document.createElement("div");

  fpsWrapperElement.append("FPS: ", fpsElement);

  const scoreWrapperElement = document.createElement("div");

  scoreWrapperElement.append("Score: ", scoreElement);

  const moveTipElement = createTextElement("Move: A/W/S/D/JOYSTICK");
  const pauseTipElement = createTextElement("Pause: ESC");
  const restartTipElement = createTextElement("Restart: R");

  element.append(
    fpsWrapperElement,
    scoreWrapperElement,
    document.createElement("br"),
    moveTipElement,
    pauseTipElement,
    restartTipElement,
  );

  return element;
}

function createPauseSceneElement() {
  const element = document.createElement("div");

  element.id = generateID();
  element.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  element.style.position = "fixed";
  element.style.inset = "0";
  element.style.color = "white";
  element.style.display = "none";
  element.style.flexDirection = "column";
  element.style.justifyContent = "center";
  element.style.alignItems = "center";

  const title = document.createElement("h1");

  title.innerText = "Game Paused";

  const message = document.createElement("p");

  message.innerText = `Press 'ESC' key or '${PAUSE_BUTTON_TEXT}' button to continue`;

  element.append(title, message);

  return element;
}

function createBarElement() {
  const element = document.createElement("span");

  element.id = generateID();

  element.style.position = "fixed";
  element.style.left = "0px";
  element.style.bottom = "0px";
  element.style.height = `${BAR_HEIGHT}px`;
  element.style.backgroundColor = "white";
  element.style.transition = "all 100ms linear";

  return element;
}

/**
 * @param {HTMLSpanElement} scoreElement
 */
function createLoseSceneElement(scoreElement) {
  const element = document.createElement("div");

  element.id = generateID();
  element.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
  element.style.position = "fixed";
  element.style.inset = "0";
  element.style.color = "white";
  element.style.display = "none";
  element.style.flexDirection = "column";
  element.style.justifyContent = "center";
  element.style.alignItems = "center";

  const title = document.createElement("h1");

  title.innerText = "You Lost!";

  const score = document.createElement("p");

  score.append("Score: ", scoreElement);

  const message = document.createElement("p");

  message.innerText = `Press 'R' key or '${RESET_BUTTON_TEXT}' button to restart`;

  element.append(title, score, message);

  return element;
}

function createJoystickElement() {
  const element = document.createElement("div");

  element.id = generateID();

  element.style.width = `${JOYSTICK_SIZE}px`;
  element.style.height = `${JOYSTICK_SIZE}px`;
  element.style.background = "gray";
  element.style.borderRadius = "100%";

  return element;
}

/**
 * @param {HTMLElement} joystick
 */
function createJoystickContainerElement(joystick) {
  const element = document.createElement("div");

  element.id = generateID();

  element.style.width = `${JOYSTICK_CONTAINER_SIZE}px`;
  element.style.height = `${JOYSTICK_CONTAINER_SIZE}px`;
  element.style.border = "5px gray solid";
  element.style.borderRadius = "100%";
  element.style.position = "fixed";
  element.style.transform = "translate(-50%,-50%)";
  element.style.display = "none";
  element.style.alignItems = "center";
  element.style.justifyContent = "center";

  element.append(joystick);

  return element;
}

/**
 * @param {string} text
 */
function createButton(text) {
  const element = document.createElement("button");

  element.innerText = text;

  return element;
}

/**
 * @param {HTMLButtonElement} pauseButton
 * @param {HTMLButtonElement} resetButton
 */
function createButtonsContainer(pauseButton, resetButton) {
  const element = document.createElement("div");

  element.style.right = `${SCREEN_PADDING}px`;
  element.style.top = `${SCREEN_PADDING}px`;
  element.style.position = "fixed";
  element.style.display = "flex";
  element.style.flexDirection = "column";
  element.style.gap = "2px";

  element.append(pauseButton, resetButton);

  return element;
}

// * UTILS

/**
 * @template {HTMLElement} T
 * @param {T} element
 * @returns {T}
 */
function add(element) {
  document.body.appendChild(element);

  return element;
}

/**
 * @template {HTMLElement} T
 * @param {T} element
 * @returns {T}
 */
function ensure(element) {
  const previous = document.getElementById(element.id);

  if (previous) {
    return /** @type {T} */ (previous);
  }

  return add(element);
}

// * ELEMENTS
const canvasElement = ensure(createCanvasElement(500));

const fpsTextElement = ensure(createTextElement("0"));
const scoreTextElement = ensure(createTextElement("0"));
const finalScoreTextElement = createTextElement("0");

const infoElement = ensure(createInfoElement(fpsTextElement, scoreTextElement));

const barElement = ensure(createBarElement());

const pauseSceneElement = ensure(createPauseSceneElement());
const loseSceneElement = ensure(createLoseSceneElement(finalScoreTextElement));

const joystickElement = createJoystickElement();
const joystickContainerElement = ensure(
  createJoystickContainerElement(joystickElement),
);

const pauseButtonElement = createButton(PAUSE_BUTTON_TEXT);
const resetButtonElement = createButton(RESET_BUTTON_TEXT);

const buttonsContainerElement = ensure(
  createButtonsContainer(pauseButtonElement, resetButtonElement),
);

// * RENDERER

class Renderer {
  #context;

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Your browser does not support '2D' context");
    }

    this.#context = context;
  }

  get width() {
    return this.#context.canvas.width;
  }

  get height() {
    return this.#context.canvas.height;
  }

  /**
   * @param {string} color
   */
  clear(color) {
    this.#context.fillStyle = color;
    this.#context.fillRect(0, 0, this.width, this.height);
  }

  /**
   * @param {string} color
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   */
  drawCircle(color, x, y, radius) {
    this.#context.fillStyle = color;
    this.#context.beginPath();
    this.#context.arc(x, y, radius, 0, Math.PI * 2);
    this.#context.fill();
  }
}

// * INPUT

class Input {
  /** @type {Set<string>} */
  #activeKeys = new Set();

  /** @param {KeyboardEvent} event */
  #onKeyDown = (event) => {
    this.#activeKeys.add(event.code);
  };

  /** @param {KeyboardEvent} event */
  #onKeyUp = (event) => {
    this.#activeKeys.delete(event.code);
  };

  constructor() {
    document.addEventListener("keydown", this.#onKeyDown);
    document.addEventListener("keyup", this.#onKeyUp);
  }

  /**
   * @param {string} code
   */
  isPressed(code) {
    return this.#activeKeys.has(code);
  }

  clear() {
    this.#activeKeys.clear();
  }
}

// * PLAYER

class Player {
  #initialX;
  #initialY;

  #x;
  #y;

  #velocityX = 0;
  #velocityY = 0;

  /** @type {[number, number][]} */
  #trace = [];

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.#x = x;
    this.#y = y;

    this.#initialX = x;
    this.#initialY = y;
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get trace() {
    return this.#trace;
  }

  reset() {
    this.#x = this.#initialX;
    this.#y = this.#initialY;

    this.#velocityX = 0;
    this.#velocityY = 0;

    this.#trace.length = 0;
  }

  /**
   * @param {Input} input
   * @param {Joystick} joystick
   */
  updateVelocity(input, joystick) {
    let inputX = 0;
    let inputY = 0;

    if (input.isPressed("KeyW")) inputY -= 1;
    if (input.isPressed("KeyS")) inputY += 1;
    if (input.isPressed("KeyA")) inputX -= 1;
    if (input.isPressed("KeyD")) inputX += 1;

    const joyStickInput = joystick.getInput();

    inputX += joyStickInput.x;
    inputY += joyStickInput.y;

    this.#velocityX = Math.min(
      Math.max(this.#velocityX + inputX * VELOCITY_THRESHOLD, -MAX_VELOCITY),
      MAX_VELOCITY,
    );

    this.#velocityY = Math.min(
      Math.max(this.#velocityY + inputY * VELOCITY_THRESHOLD, -MAX_VELOCITY),
      MAX_VELOCITY,
    );

    this.#velocityX = this.#drainVelocity(this.#velocityX);
    this.#velocityY = this.#drainVelocity(this.#velocityY);
  }

  /**
   * @param {number} velocity
   */
  #drainVelocity(velocity) {
    if (velocity === 0) {
      return 0;
    }

    const direction = velocity < 0 ? -1 : 1;

    return velocity - VELOCITY_THRESHOLD * VELOCITY_DRAIN_SPEED * direction;
  }

  /**
   * @param {number} diff
   */
  update(diff) {
    this.#x += this.#velocityX * diff * PLAYER_SPEED;
    this.#y += this.#velocityY * diff * PLAYER_SPEED;
  }

  /**
   * @param {number} width
   * @param {number} height
   */
  constrain(width, height) {
    this.#x = clamp(PLAYER_RADIUS, this.#x, width - PLAYER_RADIUS);

    this.#y = clamp(PLAYER_RADIUS, this.#y, height - PLAYER_RADIUS);
  }

  tracePosition() {
    if (this.#trace.length >= MAX_TRACE) {
      this.#trace.shift();
    }

    this.#trace.push([this.#x, this.#y]);
  }
}

// * ENTITY

class Entity {
  #x;
  #y;
  #score;

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} score
   */
  constructor(x, y, score) {
    this.#x = x;
    this.#y = y;
    this.#score = score;
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get score() {
    return this.#score;
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  move(x, y) {
    this.#x = x;
    this.#y = y;
  }
}

// * ENTITY GENERATOR

class EntityGenerator {
  #xRange;
  #yRange;
  #scoreRange;

  /**
   * @param {NumericRange} xRange
   * @param {NumericRange} yRange
   * @param {NumericRange} scoreRange
   */
  constructor(xRange, yRange, scoreRange) {
    this.#xRange = xRange;
    this.#yRange = yRange;
    this.#scoreRange = scoreRange;
  }

  generate() {
    return new Entity(
      this.#xRange.random(ENTITY_RADIUS),
      this.#yRange.random(ENTITY_RADIUS),
      this.#scoreRange.randomInt(),
    );
  }
}

// * ENTITY MANAGER

class EntityManager {
  #limit;
  #generator;

  /** @type {Set<Entity>} */
  #entities = new Set();

  /**
   * @param {EntityGenerator} generator
   * @param {number} limit
   */
  constructor(generator, limit = Infinity) {
    this.#generator = generator;
    this.#limit = limit;
  }

  fill() {
    if (this.#entities.size >= this.#limit) {
      return;
    }

    this.#entities.add(this.#generator.generate());
  }

  reset() {
    this.#entities.clear();
  }

  /**
   * @param {(entity: Entity) => void} callback
   */
  foreach(callback) {
    this.#entities.forEach(callback);
  }

  /**
   * @param {Player} player
   */
  collectCollisions(player) {
    const totalRadius = PLAYER_RADIUS + ENTITY_RADIUS;

    let score = 0;

    for (const entity of this.#entities) {
      const dx = entity.x - player.x;
      const dy = entity.y - player.y;

      const distance = Math.hypot(dx, dy);

      if (distance > totalRadius) {
        continue;
      }

      score += entity.score;
      this.#entities.delete(entity);
    }

    return score;
  }

  /**
   * @param {Player} player
   * @param {number} width
   * @param {number} height
   */
  update(player, width, height) {
    const totalRadius = PLAYER_RADIUS + DANGER_RADIUS + ENTITY_RADIUS;

    for (const entity of this.#entities) {
      const dx = entity.x - player.x;
      const dy = entity.y - player.y;

      const distance = Math.hypot(dx, dy);

      if (distance > totalRadius || distance === 0) {
        continue;
      }

      const scoreSpeed = entity.score / MAX_ENTITY_VALUE;

      const dynamicSpeed =
        MAX_ESCAPE_SPEED * (1 - distance / totalRadius) * scoreSpeed;

      const nx = dx / distance;
      const ny = dy / distance;

      const x = clamp(
        ENTITY_RADIUS,
        entity.x + nx * dynamicSpeed,
        width - ENTITY_RADIUS,
      );

      const y = clamp(
        ENTITY_RADIUS,
        entity.y + ny * dynamicSpeed,
        height - ENTITY_RADIUS,
      );

      entity.move(x, y);
    }
  }
}

// * JOYSTICK
class Joystick {
  #inner;
  #container;

  /** @type {number | null} */
  #pointerId = null;

  #origin = { x: 0, y: 0 };
  #input = { x: 0, y: 0 };
  #enabled = true;

  /**
   * @param {number} x
   * @param {number} y
   */
  #setInput(x, y) {
    this.#input.x = x;
    this.#input.y = y;
  }

  /**
   * @param {PointerEvent} event
   */
  #move = (event) => {
    if (event.pointerId !== this.#pointerId) return;

    const dx = event.clientX - this.#origin.x;
    const dy = event.clientY - this.#origin.y;

    const distance = Math.hypot(dx, dy);
    const radius = JOYSTICK_CONTAINER_SIZE / 2;

    const scale = distance > radius ? radius / distance : 1;

    const x = dx * scale;
    const y = dy * scale;

    this.#setInput(x / radius, y / radius);

    this.#inner.style.transform = `translate(${x}px, ${y}px)`;
  };

  /**
   * @param {boolean} state
   */
  #show(state) {
    this.#container.style.display = state ? "flex" : "none";
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  #setPosition(x, y) {
    this.#container.style.left = `${x}px`;
    this.#container.style.top = `${y}px`;
    this.#inner.style.transform = "none";
  }

  /**
   * @param {PointerEvent} event
   */
  #start = (event) => {
    if (
      this.#pointerId !== null ||
      !this.#enabled ||
      event.target instanceof HTMLButtonElement
    )
      return;

    this.#pointerId = event.pointerId;

    this.#origin.x = event.clientX;
    this.#origin.y = event.clientY;

    this.#setPosition(event.clientX, event.clientY);
    this.#show(true);
    document.addEventListener("pointermove", this.#move);
  };

  /**
   * @param {PointerEvent} event
   */
  #end = (event) => {
    if (event.pointerId !== this.#pointerId) return;

    this.#pointerId = null;

    this.#forceEnd();
  };

  #forceEnd() {
    document.removeEventListener("pointermove", this.#move);
    this.#show(false);
    this.#setInput(0, 0);
  }

  #registerListeners() {
    document.addEventListener("pointerdown", this.#start);
    document.addEventListener("pointerup", this.#end);
    document.addEventListener("pointercancel", this.#end);
  }

  /**
   * @param {HTMLElement} inner
   * @param {HTMLElement} container
   */
  constructor(inner, container) {
    this.#inner = inner;
    this.#container = container;

    this.#registerListeners();
  }

  disable() {
    this.#enabled = false;
    this.#forceEnd();
  }

  enable() {
    this.#enabled = true;
  }

  getInput() {
    return this.#input;
  }

  get isActive() {
    const hasPointer = this.#pointerId !== null;

    return hasPointer && this.#enabled;
  }
}

// * UI

class UI {
  #fpsElement;
  #scoreElement;
  #barElement;
  #pauseElement;
  #loseElement;

  /**
   * @param {HTMLElement} fpsElement
   * @param {HTMLElement} scoreElement
   * @param {HTMLElement} barElement
   * @param {HTMLElement} pauseElement
   * @param {HTMLElement} loseElement
   */
  constructor(fpsElement, scoreElement, barElement, pauseElement, loseElement) {
    this.#fpsElement = fpsElement;
    this.#scoreElement = scoreElement;
    this.#barElement = barElement;
    this.#pauseElement = pauseElement;
    this.#loseElement = loseElement;
  }

  /**
   * @param {number} fps
   * @param {number} score
   * @param {number} remaining
   * @param {number} maximum
   */
  update(fps, score, remaining, maximum) {
    this.#fpsElement.innerText = fps.toString();
    this.#scoreElement.innerText = score.toString();

    this.#barElement.style.width = `${(remaining / maximum) * 100}%`;
  }

  /**
   * @param {boolean} paused
   */
  setPaused(paused) {
    this.#pauseElement.style.display = paused ? "flex" : "none";
  }

  /**
   * @param {number} score
   */
  showLose(score) {
    finalScoreTextElement.innerText = score.toString();
    this.#loseElement.style.display = "flex";
  }

  hideLose() {
    this.#loseElement.style.display = "none";
  }
}

// * GAME

class Game {
  #renderer;
  #input;
  #ui;
  #joystick;

  #player;
  #entityManager;

  #score = 0;
  #remainingTimer = MAX_REMAINING_TIMER;

  /** @type {"running" | "paused" | "over"} */
  #state = "running";

  #lastTime = performance.now();
  #fps = 0;

  #traceTimer = 0;
  #uiTimer = 0;

  /**
   * @param {Renderer} renderer
   * @param {Input} input
   * @param {UI} ui
   * @param {Joystick} joystick
   */
  constructor(renderer, input, ui, joystick) {
    this.#renderer = renderer;
    this.#input = input;
    this.#ui = ui;
    this.#joystick = joystick;

    this.#player = new Player(renderer.width / 2, renderer.height / 2);

    const generator = new EntityGenerator(
      new NumericRange(0, renderer.width),
      new NumericRange(0, renderer.height),
      new NumericRange(MIN_ENTITY_VALUE, MAX_ENTITY_VALUE),
    );

    this.#entityManager = new EntityManager(generator, MAX_ENTITY_COUNT);

    document.addEventListener("keydown", this.#handleKeyDown);
  }

  /** @param {KeyboardEvent} event */
  #handleKeyDown = (event) => {
    if (event.code === "KeyR") {
      this.reset();

      return;
    }

    if (event.code === "Escape") {
      this.togglePause();
    }
  };

  reset() {
    this.#player.reset();
    this.#entityManager.reset();

    this.#score = 0;
    this.#remainingTimer = MAX_REMAINING_TIMER;

    this.#state = "running";

    this.#input.clear();

    this.#traceTimer = 0;
    this.#uiTimer = 0;

    this.#ui.setPaused(false);
    this.#ui.hideLose();

    this.#joystick.enable();
  }

  togglePause() {
    if (this.#state === "over") return;

    if (this.#state === "paused") {
      this.#state = "running";
    } else {
      this.#state = "paused";
    }

    this.#ui.setPaused(this.#state === "paused");
  }

  /**
   * @param {number} diff
   */
  #update(diff) {
    this.#player.updateVelocity(this.#input, this.#joystick);
    this.#player.update(diff);
    this.#player.constrain(this.#renderer.width, this.#renderer.height);

    this.#traceTimer += diff;

    if (this.#traceTimer >= 10) {
      this.#player.tracePosition();

      this.#traceTimer = 0;
    }

    this.#entityManager.fill();

    const collectedScore = this.#entityManager.collectCollisions(this.#player);

    this.#score += collectedScore;
    this.#remainingTimer += collectedScore;

    this.#entityManager.update(
      this.#player,
      this.#renderer.width,
      this.#renderer.height,
    );

    this.#remainingTimer = Math.max(
      this.#remainingTimer - REMAINING_TIMER_DRAIN,
      0,
    );

    if (this.#remainingTimer <= 0) {
      this.#remainingTimer = 0;
      this.#state = "over";
      this.#input.clear();
      this.#joystick.disable();
      this.#ui.showLose(this.#score);

      return;
    }

    this.#uiTimer += diff;

    if (this.#uiTimer >= 100) {
      this.#ui.update(
        this.#fps,
        this.#score,
        this.#remainingTimer,
        MAX_REMAINING_TIMER,
      );

      this.#uiTimer = 0;
    }
  }

  #drawPlayerTrace() {
    const trace = this.#player.trace;

    for (let i = 0; i < trace.length; i++) {
      const [x, y] = trace[i];
      const stepMultiplier = i / trace.length;

      const color =
        PLAYER_COLOR_MIN +
        (PLAYER_COLOR_MAX - PLAYER_COLOR_MIN) * stepMultiplier;

      const light = 50 - COLOR_DIFF + stepMultiplier * COLOR_DIFF;

      this.#renderer.drawCircle(
        `hsl(${color}, 100%, ${light}%)`,
        x,
        y,
        PLAYER_RADIUS * stepMultiplier,
      );
    }
  }

  #drawPlayer() {
    this.#renderer.drawCircle(
      "hsl(237, 100%, 50%)",
      this.#player.x,
      this.#player.y,
      PLAYER_RADIUS,
    );
  }

  #drawEntities() {
    this.#entityManager.foreach((entity) => {
      this.#renderer.drawCircle(
        `hsl(51, 100%, ${entity.score}%)`,
        entity.x,
        entity.y,
        ENTITY_RADIUS,
      );
    });
  }

  #frame = () => {
    const now = performance.now();
    const diff = now - this.#lastTime;

    this.#lastTime = now;

    this.#fps = Math.round(1000 / diff);

    this.#renderer.clear(BACKGROUND_COLOR);

    if (this.#state === "running") {
      this.#update(diff);
    }

    this.#drawPlayerTrace();
    this.#drawEntities();
    this.#drawPlayer();

    requestAnimationFrame(this.#frame);
  };

  start() {
    this.#lastTime = performance.now();
    requestAnimationFrame(this.#frame);
  }
}

// * START
const renderer = new Renderer(canvasElement);
const input = new Input();
const ui = new UI(
  fpsTextElement,
  scoreTextElement,
  barElement,
  pauseSceneElement,
  loseSceneElement,
);
const joystick = new Joystick(joystickElement, joystickContainerElement);
const game = new Game(renderer, input, ui, joystick);

pauseButtonElement.addEventListener("click", () => game.togglePause());
resetButtonElement.addEventListener("click", () => game.reset());

game.start();
