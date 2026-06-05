# CYBERIA

> *"No matter where you go, everyone is connected."*

A top-down maze/racing game built with **Phaser 3** + **Vite**, inspired by *Serial Experiments Lain*.

---

## 🎮 Narrative

**Lain Iwakuri** has received a message from someone who shouldn't exist — a signal from deep within **the Wired**. She must navigate a labyrinth of corrupted data nodes and electric corridors, recovering memory fragments before her connection deteriorates entirely.

The maze is the Wired. The exit is the core. Time is the one thing even the Wired cannot stop.

---

## 🕹️ Controls

| Key | Action |
|-----|--------|
| `W` / `↑` | Move Up |
| `S` / `↓` | Move Down |
| `A` / `←` | Move Left |
| `D` / `→` | Move Right |

---

## 🎯 Objectives

- **Collect** pink ◆ data fragments → **+100 pts** each
- **Reach** the cyan exit node at the bottom of the maze
- **Survive** 90 seconds before disconnection
- **Avoid** red ⚡ electric hazards (costs 1 node/life)
- **Time bonus**: remaining seconds × 10 added to final score

---

## 📋 Project Requirements (EPN - Juegos Interactivos)

| Requirement | Implementation |
|-------------|---------------|
| Top-down perspective | Arcade physics, `gravity: 0`, 8-directional movement |
| Fluent movement | `body.setVelocity(vx, vy)` with diagonal normalization |
| Solid collisions | Static wall group + arcade collider |
| Tilemap | Procedural tile array (26×19), drawn via canvas textures |
| Start menu | `MenuScene` with narrative, rules, start button |
| Score / HUD | `HUDScene` (parallel scene) with score, lives, timer |
| Win/lose conditions | 90s timer → Game Over; Reach exit → Victory |
| End screens | `GameOverScene` + `VictoryScene` with final score |
| Background music | Web Audio API drone + arpeggio in `GameScene` |
| SFX | Synthesized collect, hurt, and UI sounds |
| Spritesheet + animation | 4-direction × 4-frame procedural spritesheet |
| Game narrative | *Serial Experiments Lain* — the Wired labyrinth |

---

## 🚀 Setup & Run

### Prerequisites
- **Node.js** v18+ 
- **npm** v8+

### Install & Start

```bash
# Install dependencies
npm install

# Start dev server (opens at http://localhost:3000)
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
cyberia/
├── index.html              # Entry HTML
├── vite.config.js          # Vite configuration
├── package.json
├── src/
│   ├── main.js             # Phaser game config + scene list
│   └── scenes/
│       ├── BootScene.js    # Asset generation (procedural)
│       ├── MenuScene.js    # Main menu + narrative
│       ├── GameScene.js    # Core gameplay
│       ├── HUDScene.js     # Score/lives/timer overlay
│       ├── GameOverScene.js
│       └── VictoryScene.js
└── README.md
```

---

## 🎨 Aesthetic

CRT monitor / cyberpunk aesthetic inspired by the 1998 anime *Serial Experiments Lain*:
- Dark background with cyan (`#00ffcc`) as primary accent
- Monospace typography throughout
- Scanline overlay and CRT grid
- Falling katakana/binary data rain
- Glitch effects on title
- Synthesized lo-fi ambient drone + eerie arpeggio

---

## 🏫 Course Info

**Juegos Interactivos** — Facultad de Ingeniería de Sistemas, EPN  
Individual Project: Top-Down Videogame with Phaser 3
