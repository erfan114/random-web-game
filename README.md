# Collect & Escape

A small browser arcade game built with vanilla JavaScript and HTML Canvas.

## Gameplay

Control the blue player and collect yellow entities before the timer runs out.

- Collect entities to increase your **score** and **remaining time**.
- Entities move away when you get close.
- Higher-value entities are harder to catch.
- The game ends when the timer reaches zero.

## Controls

| Action                | Controls                 |
| --------------------- | ------------------------ |
| Move                  | `WASD` / Arrow Keys      |
| Move on touch devices | Virtual joystick         |
| Pause                 | `Esc` / **Toggle pause** |
| Restart               | `R` / **Restart**        |

## Running

No dependencies or build tools are required.

Include the game script in an HTML page:

```html
<script src="./game.js"></script>
```

Open the page in a modern browser.

## Tech

- Vanilla JavaScript
- HTML Canvas
- Pointer Events
- `requestAnimationFrame`
- No external dependencies
