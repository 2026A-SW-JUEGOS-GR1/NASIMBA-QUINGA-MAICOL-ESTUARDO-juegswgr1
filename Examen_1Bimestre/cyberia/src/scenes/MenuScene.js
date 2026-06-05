import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this.glitchTimer = 0;
    this.audioCtx = null;
    this.styleOptions = [
      { key: 'neon', label: 'Neón', tint: 0x00ffcc, accent: '#00ffcc' },
      { key: 'rose', label: 'Rosa', tint: 0xff5ea8, accent: '#ff5ea8' },
      { key: 'violet', label: 'Violeta', tint: 0xb58cff, accent: '#b58cff' },
      { key: 'amber', label: 'Ámbar', tint: 0xffcf5a, accent: '#ffcf5a' }
    ];
    this.selectedStyleKey = 'neon';
  }

create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Iniciar audio ambiental
    this.startAmbientAudio();
    this.registry.set('playerStyle', this.selectedStyleKey);

    // Fondo Cyberpunk CRT
    this.add.rectangle(w / 2, h / 2, w, h, 0x000008);
    this.createScanlines(w, h);
    this.createCRTGrid(w, h);
    this.createParticleSystem(w, h);

    // ── 1. INTERFAZ SUPERIOR (HEADER COMPACTO) ─────────────────────────────
    // Subimos el título para ganar aire abajo
    const titleY = 55; 

    this.glitchRect = this.add.rectangle(w / 2, titleY, w * 0.6, 44, 0x00ffcc, 0.04)
      .setStrokeStyle(1, 0x00ffcc, 0.3);

    this.titleText = this.add.text(w / 2, titleY, 'CYBERIA', {
      fontFamily: 'monospace',
      fontSize: '38px', // Reducido para evitar desbordamiento horizontal
      color: '#00ffcc',
      letterSpacing: 10,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffcc', blur: 15, fill: true }
    }).setOrigin(0.5);

    this.add.text(w / 2, titleY + 30, 'present day  —  present time', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff34',
      letterSpacing: 3
    }).setOrigin(0.5);


    // Helper para generar los contenedores del Wired
    const makePanel = (x, y, panelWidth, panelHeight, title, accent = 0x00ffcc) => {
      this.add.rectangle(x, y, panelWidth, panelHeight, 0x071018, 0.9)
        .setStrokeStyle(1, accent, 0.4)
        .setOrigin(0.5);
      
      this.add.text(x - panelWidth / 2 + 10, y - panelHeight / 2 + 8, title, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#00ffcc',
        letterSpacing: 1
      });
    };

    // ── 2. CONFIGURACIÓN DEL LAYOUT BI-COLUMNA AJUSTADO ────────────────────
    const contentY = 115; 
    const colWidth = (w - 40) / 2; // Más ancho para aprovechar los extremos
    const colLeftX = w * 0.26;     
    const colRightX = w * 0.74;    
    
    // Altura total disponible para los bloques centrales
    const maxCenterH = h - contentY - 85; 

    // ── COLUMNA IZQUIERDA: HISTORIA Y CONTROLES ────────────────────────────
    const narrativeH = Math.floor(maxCenterH * 0.58);
    const narrativeY = contentY + narrativeH / 2;
    makePanel(colLeftX, narrativeY, colWidth, narrativeH, 'SISTEMA // NARRATIVA');

    const narrative = [
      'LAIN IWAKURA recibió un mensaje',
      'de alguien que no debería existir.',
      'Recorre el WIRED, un laberinto de',
      'nodos de datos y pasillos eléctricos.',
      'Recolecta fragmentos de memoria y llega',
      'al núcleo antes de perder la conexión.',
      'No importa a dónde vayas...',
      'todos están conectados.'
    ].join('\n');

    this.add.text(colLeftX, narrativeY + 6, narrative, {
      fontFamily: 'monospace',
      fontSize: '10px', // Texto ligeramente más compacto para que respire
      color: '#8899bb',
      align: 'center',
      lineSpacing: 3,
      wordWrap: { width: colWidth - 20 }
    }).setOrigin(0.5);

    // Panel de Controles
    const controlsH = Math.floor(maxCenterH * 0.38);
    const controlsY = narrativeY + narrativeH / 2 + 8 + controlsH / 2;
    makePanel(colLeftX, controlsY, colWidth, controlsH, 'PROTOCOLOS // INPUT', 0xb58cff);

    this.add.text(colLeftX, controlsY + 4, [
      'W / A / S / D  o  Flechas: Mover Avatar',
      'Evita anomalías cuánticas y drones',
      'Alcanza el gateway antes del timeout'
    ].join('\n'), { 
      fontFamily: 'monospace', 
      fontSize: '10px', 
      color: '#89a4b8', 
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5);


    // ── COLUMNA DERECHA: CONFIGURACIÓN DE AVATAR Y PREVIA ──────────────────
    const customPanelH = maxCenterH; 
    const customPanelY = contentY + customPanelH / 2;
    makePanel(colRightX, customPanelY, colWidth, customPanelH, 'PERFIL // MODULACIÓN', 0xffcf5a);

    this.add.text(colRightX, customPanelY - customPanelH / 2 + 25, 'Firma Espectral:', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffcf5a'
    }).setOrigin(0.5);

    // Ajuste de los botones para que entren perfectamente en la columna
    const buttonWidth = Math.floor(colWidth * 0.42); 
    const buttonHeight = 26;
    const btnGapX = 10;
    const btnTop = customPanelY - customPanelH / 2 + 50;

    this.styleButtons = [];
    this.styleOptions.forEach((style, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      
      // Cálculo de posición X simétrico basado en el centro de la columna derecha
      const x = colRightX + (col === 0 ? -(buttonWidth / 2 + btnGapX / 2) : (buttonWidth / 2 + btnGapX / 2));
      const y = btnTop + row * 34;

      const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x00ffcc, 0.08)
        .setStrokeStyle(1, 0x00ffcc, 0.55)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(x, y, style.label, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#00ffcc'
      }).setOrigin(0.5);

      button.on('pointerover', () => {
        button.setFillStyle(0x00ffcc, 0.18);
        label.setColor('#ffffff');
      });
      button.on('pointerout', () => {
        this.updateStyleButton(button, label, style.key);
      });

      button.on('pointerdown', () => this.applyStyle(style.key));
      this.updateStyleButton(button, label, style.key);
      this.styleButtons.push({ button, label, styleKey: style.key });
    });

    // Sub-Panel de Previsualización (Ajustado proporcionalmente abajo)
    const previewBoxY = customPanelY + (customPanelH * 0.22);
    const previewBoxH = Math.floor(customPanelH * 0.42);

    this.previewFrame = this.add.rectangle(colRightX, previewBoxY, colWidth - 24, previewBoxH, 0x00161a, 0.95)
      .setStrokeStyle(1, 0x00ffcc, 0.35);

    this.previewText = this.add.text(colRightX, previewBoxY - (previewBoxH / 2) + 12, 'Estilo:', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.previewSprite = this.add.sprite(colRightX, previewBoxY, 'lain', 0).setScale(1.6);
    
    this.previewHint = this.add.text(colRightX, previewBoxY + (previewBoxH / 2) - 12, 'Datos asimilados por el núcleo', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#446666'
    }).setOrigin(0.5);


    // ── 3. INTERFAZ INFERIOR (BOTÓN ACCESO SEGURO) ─────────────────────────
    const bottomY = h - 45;

    const btnStart = this.add.rectangle(w / 2, bottomY, 280, 34, 0x00ffcc, 0.08)
      .setStrokeStyle(1, 0x00ffcc)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(w / 2, bottomY, 'CONECTAR CON EL WIRED', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#00ffcc',
      letterSpacing: 2
    }).setOrigin(0.5);

    btnStart.on('pointerover', () => {
      btnStart.setFillStyle(0x00ffcc, 0.18);
      btnText.setColor('#ffffff');
      this.playClickSound(880);
    });
    btnStart.on('pointerout', () => {
      btnStart.setFillStyle(0x00ffcc, 0.08);
      btnText.setColor('#00ffcc');
    });
    
    const executeTransition = () => {
      this.playClickSound(1320);
      if (this.audioCtx?.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.game.sharedAudioCtx = this.audioCtx;
      this.cameras.main.fadeOut(600, 0, 0, 8);
      this.time.delayedCall(600, () => {
        this.scene.start('GameScene', { styleKey: this.selectedStyleKey });
        this.scene.launch('HUDScene');
      });
    };

    btnStart.on('pointerdown', executeTransition);

    this.input.keyboard.on('keydown-SPACE', executeTransition);
    this.input.keyboard.on('keydown-ENTER', executeTransition);

    // Firma inferior fija de fondo
    this.add.text(w / 2, h - 14, 'Serial Experiments Lain  ·  Layer:01 / Cyberia', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#334444'
    }).setOrigin(0.5);

    // Glitch automático
    this.time.addEvent({
      delay: 2400,
      callback: this.triggerGlitch,
      callbackScope: this,
      loop: true
    });

    this.cameras.main.fadeIn(800, 0, 0, 8);
    this.applyStyle(this.selectedStyleKey);
  }

  applyStyle(styleKey) {
    this.selectedStyleKey = styleKey;
    const style = this.styleOptions.find((item) => item.key === styleKey) || this.styleOptions[0];
    this.registry.set('playerStyle', style.key);
    
    if (this.previewSprite) {
      this.previewSprite.clearTint();
      this.previewSprite.setTint(style.tint);
    }
    if (this.previewFrame) {
      this.previewFrame.setStrokeStyle(1, style.tint, 0.75);
    }
    if (this.previewText) {
      this.previewText.setText(`MODULACIÓN: ESPÉCULO ${style.label.toUpperCase()}`);
      this.previewText.setColor(style.accent);
    }

    // Actualizar el estado visual en caliente de todos los botones de la lista
    this.styleButtons.forEach(btnGroup => {
      this.updateStyleButton(btnGroup.button, btnGroup.label, btnGroup.styleKey);
    });
  }

  updateStyleButton(button, label, styleKey) {
    const isSelected = this.selectedStyleKey === styleKey;
    button.setFillStyle(0x00ffcc, isSelected ? 0.22 : 0.08);
    button.setStrokeStyle(1, isSelected ? 0xffffff : 0x00ffcc, isSelected ? 1 : 0.5);
    label.setColor(isSelected ? '#ffffff' : '#00ffcc');
  }

  createScanlines(w, h) {
    const g = this.add.graphics();
    g.lineStyle(1, 0x000000, 0.25);
    for (let y = 0; y < h; y += 3) {
      g.moveTo(0, y); g.lineTo(w, y);
    }
    g.strokePath().setDepth(100);
  }

  createCRTGrid(w, h) {
    const g = this.add.graphics();
    g.lineStyle(1, 0x001122, 0.12);
    for (let x = 0; x < w; x += 40) { g.moveTo(x, 0); g.lineTo(x, h); }
    for (let y = 0; y < h; y += 40) { g.moveTo(0, y); g.lineTo(w, y); }
    g.strokePath();
  }

  createParticleSystem(w, h) {
    const chars = Array.from('01アイウエオカキクケコラリルレロサシスセソ<>{}[]|/?;:#@~\\');
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(0, h);
      const char = Phaser.Utils.Array.GetRandom(chars);
      const txt = this.add.text(x, y, char, {
        fontFamily: 'monospace',
        fontSize: `${Phaser.Math.Between(9, 14)}px`,
        color: '#00ffcc'
      }).setAlpha(Phaser.Math.FloatBetween(0.02, 0.12));

      this.tweens.add({
        targets: txt,
        y: y - Phaser.Math.Between(150, 450),
        alpha: 0,
        duration: Phaser.Math.Between(5000, 9000),
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Linear',
        repeat: -1,
        onRepeat: () => {
          txt.setPosition(Phaser.Math.Between(0, w), h + 20);
          txt.setText(Phaser.Utils.Array.GetRandom(chars));
          txt.setAlpha(Phaser.Math.FloatBetween(0.02, 0.12));
        }
      });
    }
  }

  triggerGlitch() {
    const w = this.scale.width;
    const original = 'CYBERIA';
    const glitchChars = 'ⅡⅢⅣ▓░▒█▄▀■□▪▫◆◇';
    let steps = 0;
    
    const interval = setInterval(() => {
      if (steps < 4) {
        this.titleText.setText(
          original.split('').map(c =>
            Math.random() < 0.3 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : c
          ).join('')
        );
        this.titleText.setX((w / 2) + Phaser.Math.Between(-5, 5));
      } else {
        this.titleText.setText(original);
        this.titleText.setX(w / 2); // Centrado dinámico corregido para cualquier pantalla
        clearInterval(interval);
      }
      steps++;
    }, 60);
  }

  startAmbientAudio() {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return;
    this.audioCtx = new AudioContextClass();
    this.playDrone();
  }

  playDrone() {
    if (!this.audioCtx) return;
    const ac = this.audioCtx;

    [55, 110, 165].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.03 - i * 0.01;
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      if (!this._droneNodes) this._droneNodes = [];
      this._droneNodes.push(osc);
    });

    this.time.addEvent({
      delay: Phaser.Math.Between(4000, 8000),
      callback: () => this.playClickSound(440, 0.015),
      loop: true
    });
  }

  playClickSound(freq = 880, vol = 0.1) {
    if (!this.audioCtx) return;
    const ac = this.audioCtx;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.1);
  }

  shutdown() {
    if (this._droneNodes) {
      this._droneNodes.forEach(node => node?.stop());
    }
  }
}