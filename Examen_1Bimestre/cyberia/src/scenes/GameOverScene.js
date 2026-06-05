import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.reason = data.reason || 'CONEXIÓN PERDIDA';
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.rectangle(w / 2, h / 2, w, h, 0x000000);

    // Glitch lines
    for (let i = 0; i < 8; i++) {
      const y = Phaser.Math.Between(0, h);
      const rect = this.add.rectangle(w / 2, y, w, Phaser.Math.Between(1, 4), 0xff0000, 0.3);
      this.tweens.add({
        targets: rect,
        x: Phaser.Math.Between(-200, 200),
        duration: Phaser.Math.Between(100, 400),
        yoyo: true,
        repeat: -1
      });
    }

    // Static noise effect
    this.createStaticNoise(w, h);

    // Main text
    this.add.text(w / 2, h / 2 - 100, this.reason, {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ff0000',
      letterSpacing: 8,
      shadow: { blur: 20, color: '#ff0000', fill: true }
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 - 40, 'SEÑAL TERMINADA', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#882222',
      letterSpacing: 6
    }).setOrigin(0.5);

    // Score
    this.add.text(w / 2, h / 2 + 20, 'PUNTUACIÓN FINAL', {
      fontFamily: 'monospace', fontSize: '12px', color: '#446666', letterSpacing: 4
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 + 50, String(this.finalScore).padStart(6, '0'), {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#00ffcc',
      shadow: { blur: 12, color: '#00ffcc', fill: true }
    }).setOrigin(0.5);

    // Quote
    this.add.text(w / 2, h / 2 + 110, '"Lain, vamos a Cyberia."', {
      fontFamily: 'monospace', fontSize: '11px', color: '#334455', letterSpacing: 2
    }).setOrigin(0.5);

    const restartGame = () => {
      this.scene.stop('HUDScene');
      this.scene.start('GameScene');
      this.scene.launch('HUDScene');
    };

    // Buttons
    this.createButton(w / 2 - 100, h - 90, 'REINTENTAR', restartGame);

    this.createButton(w / 2 + 100, h - 90, 'MENÚ PRINCIPAL', () => {
      this.scene.start('MenuScene');
    });

    // Audio
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (AudioContextClass) {
      const ac = new AudioContextClass();
      [110, 82.5, 55].forEach((f, i) => {
        setTimeout(() => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = 'sawtooth';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.1, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5);
          o.connect(g); g.connect(ac.destination);
          o.start(); o.stop(ac.currentTime + 0.5);
        }, i * 200);
      });
    }

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  createStaticNoise(w, h) {
    const g = this.add.graphics();
    g.setAlpha(0.05);
    for (let i = 0; i < 300; i++) {
      g.fillStyle(0xffffff, 1);
      g.fillRect(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h),
        Phaser.Math.Between(1, 4),
        Phaser.Math.Between(1, 2)
      );
    }
    this.tweens.add({
      targets: g,
      alpha: 0.12,
      duration: 200,
      yoyo: true,
      repeat: -1
    });
  }

  createButton(x, y, label, callback) {
    const btn = this.add.rectangle(x, y, 160, 36, 0xff0000, 0.08)
      .setStrokeStyle(1, 0xff0000, 0.6)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '12px', color: '#ff4444', letterSpacing: 2
    }).setOrigin(0.5);

    btn.on('pointerover', () => { btn.setFillStyle(0xff0000, 0.2); txt.setColor('#ffffff'); });
    btn.on('pointerout', () => { btn.setFillStyle(0xff0000, 0.08); txt.setColor('#ff4444'); });
    btn.on('pointerdown', callback);
  }
}
