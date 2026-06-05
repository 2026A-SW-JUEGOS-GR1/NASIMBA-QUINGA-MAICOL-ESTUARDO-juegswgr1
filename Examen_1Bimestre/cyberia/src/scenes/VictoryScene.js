import Phaser from 'phaser';

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.rectangle(w / 2, h / 2, w, h, 0x000810);

    // Particle rain of data
    this.createDataRain(w, h);

    // CRT grid
    const g = this.add.graphics();
    g.lineStyle(1, 0x00ffcc, 0.05);
    for (let x = 0; x < w; x += 40) { g.moveTo(x, 0); g.lineTo(x, h); }
    for (let y = 0; y < h; y += 40) { g.moveTo(0, y); g.lineTo(w, y); }
    g.strokePath();

    // Title
    const title = this.add.text(w / 2, h / 2 - 140, 'CONNECTION\nESTABLISHED', {
      fontFamily: 'monospace',
      fontSize: '42px',
      color: '#00ffcc',
      align: 'center',
      lineSpacing: 4,
      shadow: { blur: 24, color: '#00ffcc', fill: true }
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: title, alpha: 1, duration: 1200, ease: 'Power2' });

    // Sub
    this.add.text(w / 2, h / 2 - 40, 'Lain ha llegado al núcleo del WIRED.', {
      fontFamily: 'monospace', fontSize: '13px', color: '#8899bb', letterSpacing: 2
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 - 18, '"No importa a dónde vayas, todos están conectados."', {
      fontFamily: 'monospace', fontSize: '11px', color: '#446666', letterSpacing: 1
    }).setOrigin(0.5);

    // Score
    this.add.text(w / 2, h / 2 + 30, 'PUNTUACIÓN FINAL', {
      fontFamily: 'monospace', fontSize: '11px', color: '#446666', letterSpacing: 6
    }).setOrigin(0.5);

    const scoreText = this.add.text(w / 2, h / 2 + 60, '000000', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#00ffcc',
      shadow: { blur: 16, color: '#00ffcc', fill: true }
    }).setOrigin(0.5);

    // Count up score
    const target = this.finalScore;
    let current = 0;
    const step = Math.ceil(target / 60);
    this.time.addEvent({
      delay: 20,
      repeat: 60,
      callback: () => {
        current = Math.min(current + step, target);
        scoreText.setText(String(current).padStart(6, '0'));
      }
    });

    // Bonus label
    if (this.finalScore >= 1000) {
      this.add.text(w / 2, h / 2 + 110, '★ TIME BONUS INCLUDED ★', {
        fontFamily: 'monospace', fontSize: '11px', color: '#ff00aa', letterSpacing: 4
      }).setOrigin(0.5);
    }

    // Buttons
    this.time.delayedCall(1500, () => {
      const restartGame = () => {
        this.scene.stop('HUDScene');
        this.scene.start('GameScene');
        this.scene.launch('HUDScene');
      };

      this.createButton(w / 2 - 100, h - 90, 'JUGAR OTRA VEZ', restartGame);
      this.createButton(w / 2 + 100, h - 90, 'MENÚ PRINCIPAL', () => {
        this.scene.start('MenuScene');
      });
    });

    // Victory audio
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (AudioContextClass) {
      const ac = new AudioContextClass();
      const chord = [523, 659, 784, 1047, 1319];
      chord.forEach((f, i) => {
        setTimeout(() => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.08, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.5);
          o.connect(g); g.connect(ac.destination);
          o.start(); o.stop(ac.currentTime + 1.6);
        }, i * 120);
      });
    }

    this.cameras.main.fadeIn(600, 0, 8, 16);
  }

  createDataRain(w, h) {
    const chars = '01アイウエオカキ'.split('');
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(-h, 0);
      const txt = this.add.text(x, y,
        Phaser.Utils.Array.GetRandom(chars), {
          fontFamily: 'monospace',
          fontSize: `${Phaser.Math.Between(10, 18)}px`,
          color: '#00ffcc',
          alpha: Phaser.Math.FloatBetween(0.05, 0.2)
        });
      this.tweens.add({
        targets: txt,
        y: h + 20,
        duration: Phaser.Math.Between(3000, 8000),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
        onRepeat: () => {
          txt.setX(Phaser.Math.Between(0, w));
          txt.setY(-20);
          txt.setText(Phaser.Utils.Array.GetRandom(chars));
        }
      });
    }
  }

  createButton(x, y, label, callback) {
    const btn = this.add.rectangle(x, y, 160, 36, 0x00ffcc, 0.08)
      .setStrokeStyle(1, 0x00ffcc, 0.6)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontFamily: 'monospace', fontSize: '12px', color: '#00ffcc', letterSpacing: 2
    }).setOrigin(0.5);

    btn.on('pointerover', () => { btn.setFillStyle(0x00ffcc, 0.2); txt.setColor('#ffffff'); });
    btn.on('pointerout', () => { btn.setFillStyle(0x00ffcc, 0.08); txt.setColor('#00ffcc'); });
    btn.on('pointerdown', callback);
  }
}
