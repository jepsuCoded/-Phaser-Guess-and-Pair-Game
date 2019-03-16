class SceneMain extends Phaser.Scene {
  constructor() {
    super('SceneMain');
  }
  
  preload() {
    console.log('test');
  }
  
  create() {
    this.align = new AlignGrid({
      scene: this,
      cols: 11,
      rows: 11
    });
    //this.align.showNumbers();
    
    game.current = this;
    
    this.score = this.add.text(0, 0, 'text', {
      color: '#00000',
      fontSize: 24
    })
      .setOrigin(0.5, 0.5);
    
    this.align.placeAtIndex(5, this.score);
    
    this.cards = this.createCards();
  }
  
  createCards() {
    this.faceUp_card = [];
    this.haveFaceUp_card = false;
    this.scale =  game.config.width*0.4/100;
    this.arr = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11];
    let n = 10;
    
    let card = [];
    
    for (let i = 0; i < n*2; i++) {
      card[i] = {img: this.add.sprite(0, 0, 'cards', this.arr[i%n]), number: i%n};
    }
    
    //card.forEach((el, i) => card.push({img: this.add.sprite(0, 0, 'cards', this.arr[i]), number: i}));
    
    let shuffled_card = [];
    let tempCard = [...card];
    
    for (let i = 0; i < n*2; i++) {
      let r = Math.floor(Math.random()*tempCard.length);
      shuffled_card[i] = tempCard[r];
      tempCard.splice(r, 1);
    }
    
    let count = 0;
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        this.align.placeAtIndex(index2Dto1D(row*2, col*2, 11)+23, shuffled_card[count].obj);
        shuffled_card[count].obj.setFrame(11);
        shuffled_card[count].currentNumber = 11;
        shuffled_card[count].obj.setInteractive().on('pointerup', this.checkCarshuffled_cardard[count]);
        shuffled_card[count].yshuffled_cardard[count].obj.y;
       // shuffled_card[count].obj.setScale(this.scale, this.scale);
        count++;
      }
    }
    
    return 
  }
  
  checkCard() {
    let _this = game.current;
    if (this.currentNumber === 11 && _this.faceUp_card.length <= 1 && !_this.haveFaceUp_card) {
      _this.animateCard(_this, this, 10, _this.flipCard, [{_this: _this, card: this, number: this.number}], false);

      if (_this.faceUp_card.length >= 1) {
        _this.haveFaceUp_card = true;
        let timer = _this.time.addEvent({
          delay: 500,
          callback: _this.pairCard,
          callbackScope: this,
          loop: false
        });
      }
      _this.faceUp_card.push(this);
    }
  }
  
  animateCard(_this, card, delay, callback, callbackArg, check) {
    _this.tweens.timeline({
      ease: 'Cubic',
      repeat: 0,
      yoyo: false,
      tweens: [
        {
          targets: card.obj,
          delay: delay,
          y: '-=10',
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 85,
        },
        {
          targets: card.obj,
          scaleX: 0,
          duration: 70,
          onComplete: callback,
          onCompleteParams: callbackArg,
        },
        {
          targets: card.obj,
          scaleX: 1,
          duration: 70,
        },
        {
          targets: card.obj,
          duration: 85,
          scaleX: 1,
          scaleY: 1,
          y: card.y,
          onComplete: (tween, targets, arg) => arg._this.haveFaceUp_card = check,
          onCompleteParams: [{_this: _this}]
        }
      ],
    });
  }
  
  
  flipCard(tween, targets, custom) {
    let card = custom.card, _this = custom._this, number = custom.number;
    card.obj.setFrame(_this.arr[number]);
    card.currentNumber = _this.arr[number];
  }
  
  pairCard() {
    let _this = game.current;
    if (_this.faceUp_card.length == 2) {
      if (this.number === _this.faceUp_card[0].number) {
        /*_this.faceUp_card[0].obj.setVisible(false);
        _this.faceUp_card[0].obj.setActive(false);
        this.obj.setVisible(false);
        this.obj.setActive(false);*/
        
        _this.tweens.timeline({
          targets: [this.obj, _this.faceUp_card[0].obj],
          duration: 200,
          ease: 'Cubic',
          tweens: [
            {
              y: '-=10',
              scaleX: 1.1,
              scaleY: 1.1,
            },
            {
              y: '+=10',
              scaleX: 1,
              rotation: Math.PI/2,
              scaleY: 1,
            }
          ]
        });
        
        this.obj.setInteractive(false);
        _this.faceUp_card = [];
        _this.haveFaceUp_card = false;
      } else {
        _this.animateCard(_this, this, 300, _this.flipCard, [{_this: _this, card: this, number: 10}], true);
        _this.animateCard(_this, _this.faceUp_card[0], 300, _this.flipCard, [{_this: _this, card: _thifaceUp_cardrd[0], number: 10}], false);
        _this.faceUp_card = [];
      }
    }
  }
}