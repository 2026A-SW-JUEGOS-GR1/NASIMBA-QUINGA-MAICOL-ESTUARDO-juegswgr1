import Phaser from 'phaser';

// ============================================================
//  MAP LAYOUT   (0=floor, 1=wall, 2=exit, 3=data, 4=hazard)
//  Add new scenarios by copying LEVELS.wired and swapping the map/spawns.
// ============================================================
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,0,1,0,1],
  [1,3,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,3,1],
  [1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,3,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1],
  [1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,4,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,1],
  [1,0,1,1,1,0,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,0,1,0,1,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1],
  [1,0,0,0,0,3,1,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,0,1,0,1],
  [1,3,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,3,1],
  [1,0,1,1,0,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,4,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1],
];

const LEVELS = {
  wired: {
    map: MAP,
    playerSpawn: { col: 1, row: 1 },
    cloneSpawn: { col: 24, row: 16 },
    cloneSpeed: 92
  }
};

const TILE_SIZE = 32;
const COLS = MAP[0].length;
const ROWS = MAP.length;
const MAP_W = COLS * TILE_SIZE;
const MAP_H = ROWS * TILE_SIZE;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.score = 0;
    this.lives = 3;
    this.timeLeft = 50;
    this.gameActive = true;
    this.audioCtx = null;
    this.bgmNodes = [];
    this.styleKey = data?.styleKey || this.registry.get('playerStyle') || 'neon';
    this.levelKey = data?.levelKey || this.registry.get('levelKey') || 'wired';
  }

  create() {
    
    this.level = LEVELS[this.levelKey] || LEVELS.wired;
    this.registry.set('levelKey', this.levelKey);

    const map = this.level.map;
    const mapWidth = map[0].length * TILE_SIZE;
    const mapHeight = map.length * TILE_SIZE;

    // ---- WORLD BOUNDS ----
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // ---- BUILD MAP ----
    this.wallsGroup = this.physics.add.staticGroup();
    this.dataFragments = this.physics.add.group({ allowGravity: false, immovable: true });
    this.hazardsGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.exitTile = null;
    // Añadir esto en create() antes de llamar a this.buildMap(map);
const logPhrases = [
  "Layer_07: WIRED", 
  "Protocol: IPv6_v4_Active", 
  "Psyche_Overclocking... OK", 
  "WARNING: Real World connection degrading", 
  "Close the world. Open the nExt."
];

for (let i = 0; i < 12; i++) {
  let textSample = Phaser.Utils.Array.GetRandom(logPhrases);
  this.add.text(
    Phaser.Math.Between(100, mapWidth - 300),
    Phaser.Math.Between(100, mapHeight - 100),
    textSample,
    {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#002211' // Verde terminal extremadamente apagado, sutil.
    }
  ).setDepth(0).setAlpha(0.25);
}

    this.buildMap(map);

    // ---- PLAYER ----
    this.player = this.createPlayer(this.level.playerSpawn);
    this.clone = this.createClone(this.level.cloneSpawn);
    // Variables para el comportamiento del clon (Wired Ghost)
    this.cloneNextMoveTime = 0;
    this.cloneTargetX = this.clone.x;
    this.cloneTargetY = this.clone.y;

    // ---- CAMERA ----
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.4);

    // ---- COLLISIONS & OVERLAPS ----
    this.physics.add.collider(this.player, this.wallsGroup);
    this.physics.add.collider(this.clone, this.wallsGroup);

    this.physics.add.overlap(this.player, this.dataFragments, (player, frag) => {
      this.collectData(frag);
    });

    this.physics.add.overlap(this.player, this.hazardsGroup, (player, haz) => {
      if (!this._damageCooldown) this.loseLife('hazard');
    });

    this.physics.add.overlap(this.player, this.clone, () => {
      if (!this._damageCooldown) this.loseLife('clone');
    });

    if (this.exitSprite) {
      this.physics.add.overlap(this.player, this.exitSprite, () => {
        if (this.gameActive) this.triggerVictory();
      });
    }

    // ---- CONTROLS ----
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // ---- HUD EVENTS ----
    this.registry.set('score', 0);
    this.registry.set('lives', this.lives);
    this.registry.set('time', this.timeLeft);

    // ---- COUNTDOWN TIMER ----
    this.countdown = this.time.addEvent({
      delay: 1000,
      callback: this.tickTimer,
      callbackScope: this,
      loop: true
    });

    // ---- AUDIO ----
    this.startAudio();

    // ---- ANIMATIONS ----
    this.createAnimations();

    // ---- POST-FX: scanline overlay ----
    this.createOverlay();

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  // ----------------------------------------------------------------
buildMap(map) {
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      const tile = map[row][col];
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const y = row * TILE_SIZE + TILE_SIZE / 2;

      // Colocar SIEMPRE suelo primero para que no queden huecos negros transparentes
      if (tile !== 1) {
        this.add.image(x, y, 'tiles', 0);
      }

      if (tile === 1) {
        // ---- PARED / MONITORES DE LA WIRED ----
        const wall = this.add.image(x, y, 'tiles', 1);
        this.physics.add.existing(wall, true);
        this.wallsGroup.add(wall);

        // GLITCH EN LOS MONITORES: Parpadeo espectral aleatorio estilo Lain
        if (Phaser.Math.Between(1, 100) > 85) {
          this.tweens.add({
            targets: wall,
            alpha: 0.4,
            duration: Phaser.Math.Between(50, 200),
            yoyo: true,
            repeat: Phaser.Math.Between(1, 3),
            repeatDelay: Phaser.Math.Between(3000, 7000)
          });
        }

      } else if (tile === 2) {
        // ---- EXIT (Brecha de desconexión) ----
        this.exitSprite = this.physics.add.image(x, y, 'tiles', 2);
        this.exitSprite.setImmovable(true);
        this.exitSprite.body.allowGravity = false;
        this.exitSprite.body.setSize(28, 28).setOffset(2, 2);
        
        // Latido fantasmal de la desconexión
        this.tweens.add({
          targets: this.exitSprite,
          alpha: 0.2,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

      } else if (tile === 3) {
        // ---- CHIP PSYCHE COLLECTIBLE ----
        const frag = this.physics.add.image(x, y, 'tiles', 3);
        frag.setImmovable(true);
        frag.body.allowGravity = false;
        frag.body.setSize(26, 26).setOffset(3, 3);
        this.dataFragments.add(frag);

        // Flotación digital (efecto escalonado, no fluido, simulando bajo framerate analógico)
        this.tweens.add({
          targets: frag,
          y: y - 5,
          duration: 900 + Phaser.Math.Between(0, 300),
          yoyo: true,
          repeat: -1,
          ease: 'Stepped' 
        });

      } else if (tile === 4) {
        // ---- HAZARD (Sobrecarga de Voltaje) ----
        const haz = this.physics.add.image(x, y, 'tiles', 4);
        haz.setImmovable(true);
        haz.body.allowGravity = false;
        haz.body.setSize(26, 26).setOffset(3, 3);
        this.hazardsGroup.add(haz);

        // Parpadeo agresivo de cortocircuito
        this.tweens.add({
          targets: haz,
          alpha: 0.3,
          duration: 150,
          yoyo: true,
          repeat: -1
        });
      }
    }
  }
}

  // ----------------------------------------------------------------
  tileToWorldPoint(col, row) {
    return {
      x: col * TILE_SIZE + TILE_SIZE / 2,
      y: row * TILE_SIZE + TILE_SIZE / 2
    };
  }

  // ----------------------------------------------------------------
  createPlayer(spawn) {
    const { x: startX, y: startY } = this.tileToWorldPoint(spawn.col, spawn.row);
    const p = this.physics.add.sprite(startX, startY, 'lain', 0);
    p.setCollideWorldBounds(true);
    p.setDepth(10);
    // Shrink physics body slightly for better maze navigation
    p.body.setSize(18, 18);
    p.body.setOffset(7, 10);

    const style = {
      neon: 0x00ffcc,
      rose: 0xff5ea8,
      violet: 0xb58cff,
      amber: 0xffcf5a
    }[this.styleKey] || 0x00ffcc;
    p.setTint(style);

    // Glow effect via particle emitter
    const emitter = this.add.particles(0, 0, 'particle', {
      follow: p,
      lifespan: 300,
      speed: { min: 5, max: 20 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.4, end: 0 },
      tint: style,
      frequency: 80,
      blendMode: 'ADD'
    });
    emitter.setDepth(9);

    return p;
  }

  createClone(spawn) {
    const { x: startX, y: startY } = this.tileToWorldPoint(spawn.col, spawn.row);
    const clone = this.physics.add.sprite(startX, startY, 'lainClone', 0);
    clone.setCollideWorldBounds(true);
    clone.setDepth(10);
    clone.body.setSize(18, 18);
    clone.body.setOffset(7, 10);
    clone.setAlpha(0.95);
    return clone;
  }

  // ----------------------------------------------------------------
  createAnimations() {
    this.createCharacterAnimations('lain', '');
    this.createCharacterAnimations('lainClone', 'clone-');
  }

  createCharacterAnimations(textureKey, prefix) {
    const anims = [
      { key: `${prefix}walk-down`, frames: [0, 1, 2, 3] },
      { key: `${prefix}walk-left`, frames: [4, 5, 6, 7] },
      { key: `${prefix}walk-right`, frames: [8, 9, 10, 11] },
      { key: `${prefix}walk-up`, frames: [12, 13, 14, 15] }
    ];

    anims.forEach(({ key, frames }) => {
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: frames.map((frame) => ({ key: textureKey, frame })),
          frameRate: 8,
          repeat: -1
        });
      }
    });

    const idleKey = `${prefix}idle`;
    if (!this.anims.exists(idleKey)) {
      this.anims.create({
        key: idleKey,
        frames: [{ key: textureKey, frame: 0 }],
        frameRate: 1,
        repeat: -1
      });
    }
  }

  // ----------------------------------------------------------------
  update() {
    if (!this.gameActive) {
      this.player.setVelocity(0, 0);
      if (this.clone) {
        this.clone.setVelocity(0, 0);
      }
      return;
    }

    const speed = 130;
    let vx = 0;
    let vy = 0;

    const left  = this.cursors.left.isDown  || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up    = this.cursors.up.isDown    || this.wasd.up.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.down.isDown;

    if (left)  vx -= speed;
    if (right) vx += speed;
    if (up)    vy -= speed;
    if (down)  vy += speed;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.player.body.setVelocity(vx, vy);

    // Animations
    if (vx < 0)       this.player.play('walk-left', true);
    else if (vx > 0)  this.player.play('walk-right', true);
    else if (vy < 0)  this.player.play('walk-up', true);
    else if (vy > 0)  this.player.play('walk-down', true);
    else              this.player.play('idle', true);

    this.updateClone();
  }

updateClone() {
  if (!this.clone || !this.gameActive) return;

  const speed = this.level.cloneSpeed || 90;
  const distanceToPlayer = Phaser.Math.Distance.Between(this.clone.x, this.clone.y, this.player.x, this.player.y);
  
  // Rango en píxeles donde el clon "detecta" la presencia de Lain
  const detectionRadius = 180; 

  if (distanceToPlayer < 18) {
    // Si ya te alcanzó, se detiene para aplicar el daño lógico de la escena
    this.clone.setVelocity(0, 0);
    this.clone.play('clone-idle', true);
    return;
  }

  if (distanceToPlayer <= detectionRadius) {
    // -------------------------------------------------------------
    // MODO PERSECUCIÓN: Estás cerca, el clon se altera y te persigue
    // -------------------------------------------------------------
    this.physics.moveToObject(this.clone, this.player, speed);
  } else {
    // -------------------------------------------------------------
    // MODO PATRULLA ALEATORIA: Estás lejos, deambula por la Wired
    // -------------------------------------------------------------
    const currentTime = this.time.now;
    
    // Cada 2000 milisegundos (2 segundos), elige una nueva dirección al azar
    if (currentTime > this.cloneNextMoveTime) {
      // Elige un desplazamiento aleatorio (-100 a +100 píxeles de su posición actual)
      const randomX = this.clone.x + Phaser.Math.Between(-100, 100);
      const randomY = this.clone.y + Phaser.Math.Between(-100, 100);
      
      // Asegurarse de que el punto destino esté dentro de los límites del mapa del nivel
      const mapWidth = this.level.map[0].length * TILE_SIZE;
      const mapHeight = this.level.map.length * TILE_SIZE;
      
      this.cloneTargetX = Phaser.Math.Clamp(randomX, TILE_SIZE, mapWidth - TILE_SIZE);
      this.cloneTargetY = Phaser.Math.Clamp(randomY, TILE_SIZE, mapHeight - TILE_SIZE);
      
      // Establecer el próximo cambio de rumbo (2 segundos en el futuro + un pequeño factor aleatorio)
      this.cloneNextMoveTime = currentTime + Phaser.Math.Between(1800, 2500);
    }

    // Mover al clon hacia el objetivo aleatorio de patrulla
    const distanceToTarget = Phaser.Math.Distance.Between(this.clone.x, this.clone.y, this.cloneTargetX, this.cloneTargetY);
    if (distanceToTarget > 10) {
      this.physics.moveTo(this.clone, this.cloneTargetX, this.cloneTargetY, speed * 0.7); // Patrulla un poco más lento de lo que te persigue
    } else {
      this.clone.setVelocity(0, 0);
    }
  }

  // -------------------------------------------------------------
  // CONTROL DE ANIMACIONES (Mantiene tu sistema basado en velocidad)
  // -------------------------------------------------------------
  const vx = this.clone.body.velocity.x;
  const vy = this.clone.body.velocity.y;

  if (Math.abs(vx) > 5 || Math.abs(vy) > 5) {
    if (vx < 0) {
      this.clone.setFlipX(true);
      this.clone.play('clone-walk-left', true);
    } else if (vx > 0) {
      this.clone.setFlipX(false);
      this.clone.play('clone-walk-right', true);
    } else if (vy < 0) {
      this.clone.play('clone-walk-up', true);
    } else if (vy > 0) {
      this.clone.play('clone-walk-down', true);
    }
  } else {
    this.clone.play('clone-idle', true);
  }
}

  // ----------------------------------------------------------------
  collectData(frag) {
    frag.destroy();
    this.score += 100;
    this.registry.set('score', this.score);

    // SFX
    this.playSFX(880, 'sine', 0.08, 0.15);
    this.time.delayedCall(80, () => this.playSFX(1320, 'sine', 0.06, 0.1));

    // Flash effect
    this.cameras.main.flash(120, 0, 255, 180, false);

    // Score popup
    const txt = this.add.text(
      this.player.x, this.player.y - 20,
      '+100', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ff00aa',
        shadow: { blur: 8, color: '#ff00aa', fill: true }
      }
    ).setDepth(20);

    this.tweens.add({
      targets: txt,
      y: txt.y - 30,
      alpha: 0,
      duration: 700,
      onComplete: () => txt.destroy()
    });

    // Check if all fragments collected → bonus time
    if (this.dataFragments.getChildren().length === 0) {
      this.score += 500;
      this.registry.set('score', this.score);
      this.showMessage('TODOS LOS FRAGMENTOS RECUPERADOS  +500');
    }
  }

  loseLife(source = 'hazard') {
    if (!this.gameActive) return;
    this._damageCooldown = true;

    this.lives -= 1;
    this.registry.set('lives', this.lives);

    // SFX
    this.playSFX(source === 'clone' ? 160 : 110, source === 'clone' ? 'triangle' : 'sawtooth', 0.15, 0.4);

    // Screen shake + red flash
    this.cameras.main.shake(300, 0.02);
    this.cameras.main.flash(200, 255, 0, 0);

    // Player flicker
    this.tweens.add({
      targets: this.player,
      alpha: 0.2,
      duration: 80,
      yoyo: true,
      repeat: 5,
      onComplete: () => { this.player.alpha = 1; }
    });

    if (source === 'clone' && this.clone) {
      const { x, y } = this.tileToWorldPoint(this.level.cloneSpawn.col, this.level.cloneSpawn.row);
      this.clone.setPosition(x, y);
      this.clone.setVelocity(0, 0);
    }

    this.time.delayedCall(1200, () => { this._damageCooldown = false; });

    if (this.lives <= 0) {
      this.triggerGameOver('CONEXIÓN PERDIDA');
    }
  }

  tickTimer() {
    if (!this.gameActive) return;
    this.timeLeft -= 1;
    this.registry.set('time', this.timeLeft);

    // Tension audio on low time
    if (this.timeLeft === 20) {
      this.showMessage('LA CONEXIÓN SE DEGRADA...');
      this.playSFX(220, 'sawtooth', 0.05, 0.5);
    }

    if (this.timeLeft <= 0) {
      this.triggerGameOver('DISCONNECTED');
    }
  }

  triggerGameOver(reason) {
    if (!this.gameActive) return;
    this.gameActive = false;
    this.countdown.remove();

    this.stopBGM();
    this.playSFX(55, 'sawtooth', 0.2, 0.8);

    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.time.delayedCall(900, () => {
      this.scene.stop('HUDScene');
      this.scene.start('GameOverScene', { score: this.score, reason });
    });
  }

  triggerVictory() {
    if (!this.gameActive) return;
    this.gameActive = false;
    this.countdown.remove();

    this.score += this.timeLeft * 10;
    this.registry.set('score', this.score);

    this.stopBGM();
    // Victory chord
    [523, 659, 784, 1047].forEach((f, i) => {
      this.time.delayedCall(i * 80, () => this.playSFX(f, 'sine', 0.1, 0.4));
    });

    this.cameras.main.fadeOut(1000, 0, 255, 200);
    this.time.delayedCall(1100, () => {
      this.scene.stop('HUDScene');
      this.scene.start('VictoryScene', { score: this.score });
    });
  }

  // ----------------------------------------------------------------
  showMessage(msg) {
    const txt = this.add.text(
      this.cameras.main.worldView.centerX,
      this.cameras.main.worldView.centerY - 80,
      msg, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#00ffcc',
        shadow: { blur: 12, color: '#00ffcc', fill: true }
      }
    ).setDepth(50).setScrollFactor(0).setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      alpha: 0,
      duration: 2000,
      delay: 1500,
      onComplete: () => txt.destroy()
    });
  }

  createOverlay() {
    // Scanline overlay that stays fixed to camera
    const g = this.add.graphics();
    g.setScrollFactor(0);
    g.setDepth(200);
    g.lineStyle(1, 0x000000, 0.18);
    for (let y = 0; y < 600; y += 3) {
      g.moveTo(0, y);
      g.lineTo(800, y);
    }
    g.strokePath();
  }

  // ----------------------------------------------------------------
  //  AUDIO (Web Audio API — no external files needed)
  // ----------------------------------------------------------------
  startAudio() {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    if (!this.audioCtx) {
      this.audioCtx = this.game.sharedAudioCtx || new AudioContextClass();
      this._ownsAudioCtx = !this.game.sharedAudioCtx;
      this.game.sharedAudioCtx = this.audioCtx;
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.playBGM();
  }

  playBGM() {
    if (!this.audioCtx || this.bgmNodes.length > 0) return;
    const ac = this.audioCtx;

    // Ambient drone — the Wired
    const droneFreqs = [55, 82.5, 110];
    droneFreqs.forEach((freq) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.03;
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      this.bgmNodes.push(osc);
    });

    // Arpeggio melody — eerie, lo-fi
    const notes = [220, 277, 330, 415, 440, 554, 440, 415, 330, 277];
    let noteIdx = 0;

    this._arpTimer = this.time.addEvent({
      delay: 380,
      callback: () => {
        if (!this.audioCtx || !this.gameActive) return;
        const freq = notes[noteIdx % notes.length];
        this.playSFX(freq, 'triangle', 0.04, 0.35);
        noteIdx++;
      },
      loop: true
    });
  }

  stopBGM() {
    this.bgmNodes.forEach((node) => {
      node?.stop();
    });
    this.bgmNodes = [];
    if (this._arpTimer) this._arpTimer.remove();
  }

  playSFX(freq, type = 'sine', vol = 0.1, duration = 0.2) {
    if (!this.audioCtx) return;
    const ac = this.audioCtx;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + duration + 0.01);
  }

  shutdown() {
    this.stopBGM();
    if (this.audioCtx && this._ownsAudioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
  }
}
