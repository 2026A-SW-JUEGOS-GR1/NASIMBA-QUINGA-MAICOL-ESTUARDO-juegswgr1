import Phaser from 'phaser';

export default class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HUDScene' });
  }

  create() {
    const w = 800;

    // ---- Background bar ----
    this.add.rectangle(w / 2, 16, w, 32, 0x000000, 0.7);
    this.add.rectangle(w / 2, 31, w, 1, 0x00ffcc, 0.4);

    // ---- Score ----
    this.add.text(20, 8, 'PUNTUACIÓN', {
      fontFamily: 'monospace', fontSize: '9px', color: '#446666'
    });
    this.scoreText = this.add.text(20, 18, '000000', {
      fontFamily: 'monospace', fontSize: '14px', color: '#00ffcc',
      shadow: { blur: 6, color: '#00ffcc', fill: true }
    });

    // ---- Timer ----
    this.add.text(w / 2 - 30, 8, 'TIEMPO', {
      fontFamily: 'monospace', fontSize: '9px', color: '#446666'
    });
    this.timerText = this.add.text(w / 2 + 12, 16, '90', {
      fontFamily: 'monospace', fontSize: '16px', color: '#00ffcc',
      shadow: { blur: 6, color: '#00ffcc', fill: true }
    }).setOrigin(0.5, 0);

    // ---- Lives ----
    this.add.text(w - 100, 8, 'VIDAS', {
      fontFamily: 'monospace', fontSize: '9px', color: '#446666'
    });
    this.livesContainer = this.add.container(w - 90, 20);
    this.drawLives(3);

    // ---- Title strip ----
    this.add.text(w / 2, 8, '— CYBERIA —', {
      fontFamily: 'monospace', fontSize: '9px', color: '#223333', letterSpacing: 4
    }).setOrigin(0.5, 0);

    // ---- Listen for registry changes ----
    this.registry.events.on('changedata', this.onDataChange, this);
  }

  drawLives(count) {
    this.livesContainer.removeAll(true);
    for (let i = 0; i < 3; i++) {
      const color = i < count ? '#00ffcc' : '#113333';
      this.livesContainer.add(
        this.add.text(i * 20, 0, '◆', {
          fontFamily: 'monospace', fontSize: '14px', color,
          shadow: i < count ? { blur: 6, color: '#00ffcc', fill: true } : undefined
        })
      );
    }
  }

  onDataChange(parent, key, value) {
    if (key === 'score') {
      this.scoreText.setText(String(value).padStart(6, '0'));
    }
    if (key === 'lives') {
      this.drawLives(value);
    }
    if (key === 'time') {
      this.timerText.setText(String(value).padStart(2, '0'));
      if (value <= 20) {
        this.timerText.setColor('#ff3300');
        this.timerText.setShadow(0, 0, '#ff3300', 8, false, true);
        // Flicker
        this.tweens.add({
          targets: this.timerText,
          alpha: 0.5,
          duration: 200,
          yoyo: true
        });
      } else {
        this.timerText.setColor('#00ffcc');
      }
    }
  }

  shutdown() {
    this.registry.events.off('changedata', this.onDataChange, this);
  }
}
