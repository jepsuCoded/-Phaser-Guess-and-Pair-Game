class SceneLoad extends Phaser.Scene {
  constructor() {
    super('SceneLoad');
  }
  
  preload() {
    this.load.spritesheet('cards', 'img/cards.png', {frameWidth: 32, frameHeight: 40});
  }
  
  create() {
    this.scene.start('SceneMain');
  }
}