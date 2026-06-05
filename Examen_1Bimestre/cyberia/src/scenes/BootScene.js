import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // --- Loading bar ---
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const barBg = this.add.rectangle(w / 2, h / 2, 400, 20, 0x111111);
    barBg.setStrokeStyle(1, 0x00ffcc);
    const bar = this.add.rectangle(w / 2 - 200, h / 2, 0, 16, 0x00ffcc);
    bar.setOrigin(0, 0.5);

    const loadingText = this.add.text(w / 2, h / 2 - 40, 'CONECTANDO AL WIRED...', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#00ffcc',
      letterSpacing: 4
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      bar.width = 400 * value;
    });

    this.load.on('complete', () => {
      loadingText.setText('ACCESO CONCEDIDO');
    });

    // ----------------------------------------------------------------
    // GENERATE ALL ASSETS PROCEDURALLY (no external files needed)
    // ----------------------------------------------------------------
    this.generateAssets();
  }

  generateAssets() {
    // We'll create everything via Graphics/canvas in the create() step
    // so we just need to signal preload is done.
  }

  create() {
    this.createPlayerSpritesheet();
    this.createCloneSpritesheet();
    this.createTileset();
    this.createParticleTexture();
    this.createAudioSynth();

    this.time.delayedCall(800, () => {
      this.scene.start('MenuScene');
    });
  }

  // ----------------------------------------------------------------
  // PLAYER SPRITESHEET  (4 directions × 4 frames = 16 frames, 32×32 each)
  // ----------------------------------------------------------------
  createPlayerSpritesheet() {
    this.createCharacterSpritesheet('lain', {
      glow: '#00ffcc',
      skin: '#d2b59a',
      hair: '#2a1748',
      clothes: '#160d2f',
      accent: '#9fffee'
    });
  }

  createCloneSpritesheet() {
    this.createCharacterSpritesheet('lainClone', {
      glow: '#ff4fd8',
      skin: '#c7a48a',
      hair: '#3a0f35',
      clothes: '#250825',
      accent: '#ffb4ef'
    });
  }

  createCharacterSpritesheet(textureKey, palette) {
    const frameW = 32;
    const frameH = 32;
    const cols = 4; // walk frames per direction
    const rows = 4; // down, left, right, up
    const canvas = document.createElement('canvas');
    canvas.width = frameW * cols;
    canvas.height = frameH * rows;
    const ctx = canvas.getContext('2d');

    const dirs = [
      { row: 0, faceVisible: true, armShift: -1, cableShift: 0 },
      { row: 1, faceVisible: false, armShift: -2, cableShift: -1 },
      { row: 2, faceVisible: false, armShift: 2, cableShift: 1 },
      { row: 3, faceVisible: false, armShift: 1, cableShift: 0 }
    ];

    dirs.forEach(({ row, faceVisible, armShift, cableShift }) => {
      for (let col = 0; col < cols; col++) {
        const x = col * frameW;
        const y = row * frameH;
        const t = col / (cols - 1);
        const swing = Math.sin(t * Math.PI * 2) * 2.5;

        ctx.clearRect(x, y, frameW, frameH);

        const cx = x + frameW / 2;
        const cy = y + frameH / 2;

        const aura = ctx.createRadialGradient(cx, cy, 2, cx, cy, 16);
        aura.addColorStop(0, `${palette.glow}20`);
        aura.addColorStop(1, `${palette.glow}00`);
        ctx.fillStyle = aura;
        ctx.fillRect(x, y, frameW, frameH);

        ctx.fillStyle = palette.skin;
        ctx.fillRect(cx - 5, cy - 12, 10, 9);

        ctx.fillStyle = palette.hair;
        ctx.fillRect(cx - 6, cy - 14, 12, 5);
        ctx.fillRect(cx - 7, cy - 12, 3, 8);
        ctx.fillRect(cx + 4, cy - 12, 3, 8);

        ctx.fillStyle = faceVisible ? palette.glow : palette.accent;
        ctx.fillRect(cx - 3, cy - 9, 2, 2);
        ctx.fillRect(cx + 1, cy - 9, 2, 2);

        ctx.fillStyle = palette.clothes;
        ctx.fillRect(cx - 6, cy - 3, 12, 12);
        ctx.fillStyle = `${palette.accent}66`;
        ctx.fillRect(cx - 4, cy - 1, 8, 2);

        ctx.fillStyle = palette.hair;
        ctx.fillRect(cx - 9, cy - 1 + armShift, 4, 6 + swing);
        ctx.fillRect(cx + 5, cy - 1 - armShift, 4, 6 - swing);

        ctx.fillStyle = palette.clothes;
        ctx.fillRect(cx - 4, cy + 9, 3, 6 + swing);
        ctx.fillRect(cx + 1, cy + 9, 3, 6 - swing);

        ctx.fillStyle = palette.glow;
        ctx.fillRect(cx - 5, cy + 15 + swing, 4, 2);
        ctx.fillRect(cx + 1, cy + 15 - swing, 4, 2);

        ctx.strokeStyle = `${palette.glow}66`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + cableShift, cy - 2);
        ctx.bezierCurveTo(cx + 8, cy + 1, cx + 10, cy + 7, cx + 6, cy + 12);
        ctx.stroke();
      }
    });

    this.textures.addCanvas(textureKey, canvas);

    // Register spritesheet layout
    this.textures.get(textureKey).add('__BASE', 0, 0, 0, frameW * cols, frameH * rows);

    // Manually register frames
    const tex = this.textures.get(textureKey);
    let idx = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        tex.add(idx, 0, col * frameW, row * frameH, frameW, frameH);
        idx++;
      }
    }
  }

  // ----------------------------------------------------------------
  // TILESET  (128×64 canvas with 5 tile types, 32×32 each)
  // ----------------------------------------------------------------
  createTileset() {
    const tw = 32;
    const numTiles = 5;
    const canvas = document.createElement('canvas');
    canvas.width = tw * numTiles;
    canvas.height = tw;
    const ctx = canvas.getContext('2d');

    // Tile 0 — floor (dark grid)
    this.drawFloorTile(ctx, 0 * tw, 0, tw);
    // Tile 1 — wall (solid barrier)
    this.drawWallTile(ctx, 1 * tw, 0, tw);
    // Tile 2 — goal / exit node
    this.drawGoalTile(ctx, 2 * tw, 0, tw);
    // Tile 3 — data fragment (collectible)
    this.drawDataTile(ctx, 3 * tw, 0, tw);
    // Tile 4 — hazard (electric)
    this.drawHazardTile(ctx, 4 * tw, 0, tw);

    this.textures.addCanvas('tiles', canvas);
    const tex = this.textures.get('tiles');
    for (let i = 0; i < numTiles; i++) {
      tex.add(i, 0, i * tw, 0, tw, tw);
    }
  }

 drawFloorTile(ctx, x, y, s) {
  // Fondo de terminal de tubos catódicos oscuro
  ctx.fillStyle = '#05050d';
  ctx.fillRect(x, y, s, s);

  // Cuadrícula industrial muy tenue
  ctx.strokeStyle = '#0a0a1f';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x, y, s, s);

  // Ruido/Estática analógica de fondo (Efecto Lain)
  ctx.fillStyle = 'rgba(0, 255, 204, 0.03)';
  for (let i = 0; i < 6; i++) {
    let rx = Math.random() * s;
    let ry = Math.random() * s;
    ctx.fillRect(x + rx, y + ry, 1, 1);
  }

  // Cables caóticos tirados en el suelo
  ctx.strokeStyle = '#121233';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + s/3);
  ctx.bezierCurveTo(x + s/4, y + s/2, x + 3*s/4, y + s/4, x + s, y + 2*s/3);
  ctx.stroke();

  // Una segunda línea de cables cruzada
  ctx.strokeStyle = '#08081a';
  ctx.beginPath();
  ctx.moveTo(x + s/2, y);
  ctx.lineTo(x + s/2 + (Math.random()*4 - 2), y + s);
  ctx.stroke();
}

 drawWallTile(ctx, x, y, s) {
  // Cuerpo del bloque / Servidor
  ctx.fillStyle = '#070612';
  ctx.fillRect(x, y, s, s);

  // Rejillas de ventilación de servidores industriales
  ctx.strokeStyle = '#151226';
  ctx.lineWidth = 1;
  for(let i = 4; i < s; i += 6) {
    ctx.moveTo(x + 4, y + i);
    ctx.lineTo(x + s - 4, y + i);
  }
  ctx.stroke();

  // Pantallas incrustadas / Terminales de la Wired
  ctx.fillStyle = '#020d0a';
  ctx.fillRect(x + 6, y + 6, s - 12, s - 12);
  
  // Marco de la pantalla quemada
  ctx.strokeStyle = '#005544';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 6, y + 6, s - 12, s - 12);

  // Código / Líneas de datos simuladas dentro del monitor de la pared
  ctx.fillStyle = '#00ccaa';
  ctx.fillRect(x + 9, y + 10, 8, 1.5);
  ctx.fillRect(x + 9, y + 14, 12, 1.5);
  ctx.fillRect(x + 9, y + 18, 5, 1.5);

  // Un pequeño LED indicador parpadeante analógico
  ctx.fillStyle = Math.random() > 0.5 ? '#ff2255' : '#00ffaa';
  ctx.fillRect(x + s - 10, y + s - 10, 2, 2);
}

  drawGoalTile(ctx, x, y, s) {
    ctx.fillStyle = '#001a1a';
    ctx.fillRect(x, y, s, s);
    const grd = ctx.createRadialGradient(x + s / 2, y + s / 2, 2, x + s / 2, y + s / 2, 14);
    grd.addColorStop(0, '#00ffcc88');
    grd.addColorStop(1, '#00ffcc00');
    ctx.fillStyle = grd;
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(x + 14, y + 14, 4, 4);
  }

  drawDataTile(ctx, x, y, s) {
  // Fondo transparente sobre el suelo
  this.drawFloorTile(ctx, x, y, s);

  // Base del Chip de silicio
  ctx.fillStyle = '#220a2b';
  ctx.fillRect(x + 8, y + 8, s - 16, s - 16);
  ctx.strokeStyle = '#ff00aa';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 8, y + 8, s - 16, s - 16);

  // Pines dorados/rosas del chip Psyche
  ctx.fillStyle = '#ff88dd';
  for (let i = 10; i < s - 10; i += 4) {
    ctx.fillRect(x + 5, y + i, 3, 1.5);   // Izquierda
    ctx.fillRect(x + s - 8, y + i, 3, 1.5); // Derecha
  }

  // Núcleo brillante de datos del chip
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + s/2 - 2, y + s/2 - 2, 4, 4);
}
  drawHazardTile(ctx, x, y, s) {
    ctx.fillStyle = '#0d0005';
    ctx.fillRect(x, y, s, s);
    // lightning bolt
    ctx.fillStyle = '#ff3300';
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 4);
    ctx.lineTo(x + 10, y + 18);
    ctx.lineTo(x + 16, y + 18);
    ctx.lineTo(x + 8, y + 28);
    ctx.lineTo(x + 22, y + 14);
    ctx.lineTo(x + 16, y + 14);
    ctx.lineTo(x + 24, y + 4);
    ctx.closePath();
    ctx.fill();
  }

  createParticleTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x00ffcc, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }

  createAudioSynth() {
    // Audio is synthesized in GameScene using Web Audio API
    // This just flags that the context exists
    this.registry.set('audioReady', true);
  }
}
