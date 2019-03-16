class SceneMain extends Phaser.Scene {
  constructor() {
    super('SceneMain');
  }
  
  preload() {
    console.log('test');
  }
  
  create() {
    
    // Create an alignment for proper placement of the cards
    this.align = new AlignGrid({
      scene: this,
      cols: 11,
      rows: 12
    });
    
    this.clock = [0, 1000, this.add.text(0, 0, '00:00', {
      fontFamily: 'Courier New',
      color: '#efe7ce',
      fontSize: 24,
      align: 'right',
    }).setOrigin(1, 0.5), {sec: 0, min: 0}];
    
    this.align.placeAtIndex(10, this.clock[2]);
    
    // Set the current scene globally so that we can access it anywhere in the code
    game.current = this;
    
    game.model.score = 0;
    
    this.score = this.add.text(0, 0, game.model.score, {
      fontFamily: 'Courier New',
      color: '#efe7ce',
      fontSize: 24,
      align: 'left'
    })
      .setOrigin(0, 0.5);
    
    this.score_streak = 1;
    this.score_bonus = false;
    this.score_elapse = 0;
    
    this.align.placeAtIndex(0, this.score);
    this.score_interval = 10000;
    this.score_timer = 0;
    
    // Create all our cards and store it in this variable
    this.cards = this.createCards();
  }
  
  update(time, delta) {
    if (this.score_streak > 1 && this.score_bonus) {
      this.score_timer = time+this.score_interval;
      this.score_bonus = false;
    }
    if (this.score_timer < time && !this.score_bonus) {
      this.score_streak = 1;
    }
    
    if (this.clock[0] >= this.clock[1] && this.took_cards) {
      if (this.took_cards.length >= 20) return;
      
      this.clock[0] = 0;
      this.clock[3].sec++;
      
      this.score_elapse++;
      if (this.clock[3].sec >=  60) {
        this.clock[3].sec = 0;
        this.clock[3].min++;
      }
      this.clock[2].setText(
        (this.clock[3].min<10?'0'+this.clock[3].min:this.clock[3].min) +
        ':' +
        (this.clock[3].sec<10?'0'+this.clock[3].sec:this.clock[3].sec));
    }
    this.clock[0] += delta;
  }
  
  addPoints(val) {
    let scene = game.current;
    if (scene.score_streak == 1) {
      scene.score_bonus = true;
      game.model.score += val;
    } else
      game.model.score += val*scene.score_streak;
    
    scene.score_elapse = scene.score_elapse >= 100 ? 0 : (100-scene.score_elapse)/100;
    
    game.model.score += val*scene.score_elapse;
    
    scene.score_elapse = 0;
    
    scene.score_streak++;
    
    game.model.score = Math.round(game.model.score);
    
    scene.score.setText(game.model.score);
    
    if (scene.took_cards.length>=20) scene.gameOver();

  }
  
  createCards() {
    this.faceUp_card = undefined;
    this.haveFaceUp_card = 0;
    this.frame_card = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11];
    this.case_card = this.add.sprite(0, 0, 'cards', 5);
    this.case_card.setDepth(20).setScale(1.15);
    game.current.align.placeAtIndex(111, this.case_card);
    
    this.case_card.y += 20;
    let n = 10;
    
    let card = [];
    
    for (let i = 0; i < n*2; i++) {
      card[i] = {obj: this.add.sprite(this.case_card.x, this.case_card.y, 'cards', this.frame_card[i%n]), number: i%n, id: i};
    }
    
    let shuffled_card = Phaser.Utils.Array.Shuffle(card);
    
    let count = 0, offset = 11;
    
    let timer = game.current.time.addEvent({
      delay: 200,
      repeat: n*2-1,
      callback: function() {
        offset = count % 5 === 0 ? offset+12: offset;
        let pos = this.align.placeAtIndex(count*2+offset, shuffled_card[count].obj, true);
        
        shuffled_card[count].obj.setDepth(count);
        game.current.tweens.timeline({
          tweens: [
            {
              targets: game.current.case_card,
              y: '+=0.2'
            },
            {
              targets: shuffled_card[count].obj,
              y: '-=30'
            },
            {
              targets: shuffled_card[count].obj,
              x: pos.x,
              y: pos.y,
              rotation: Math.PI*2,
              offset: 1000,
              onComplete: function(tween, target, _) {
                _.card.y = _.card.obj.y;
                
                game.current.animateCard(
                  game.current,
                  _.card,
                  0,
                  game.current.flipCard,
                  [{
                    scene: game.current,
                    card: _.card,
                    number: 10,
                    count: _.count
                  }],
                  0
                );
                
                game.current.tweens.timeline({
                  tweens: [
                    {
                      targets: game.current.case_card,
                      delay: 4000,
                      scaleX: 1.2,
                      scaleY: 1.2,
                      duration: 100
                    },
                    {
                      targets: game.current.case_card,
                      rotation: Math.PI/2,
                      x: game.config.width*0.7,
                      y: game.config.height+game.current.case_card.height,
                      duration: 300
                    }]
                });
              },
              onCompleteParams: [{card: shuffled_card[count], count: count}]
            }
          ],
          ease: 'Cubic.in',
          delay: 200,
          duration: 200,
        });
        
        count++;
      },
      callbackScope: this
    });
    
    return shuffled_card;
  }
  
  checkCard() {
    let scene = game.current, card = this;
    
    if (scene.took_cards.length >= 20) {
      console.log("dhe");
      scene.scene.restart();
    }
    
    if (card.currentNumber === 11 && scene.haveFaceUp_card <= 1) {
      
      if (scene.faceUp_card) {
        if (scene.faceUp_card.id == card.id)
          return;
      }

      scene.haveFaceUp_card++;
      scene.animateCard(scene, card, 10, scene.flipCard, [{scene: scene, card: card, number: card.number}], scene.haveFaceUp_card);
      
      if (scene.faceUp_card && scene.haveFaceUp_card == 2) {
        let timer = scene.time.addEvent({
          delay: 500,
          callback: scene.pairCard,
          callbackScope: card,
          loop: false
        });
      } else
        scene.faceUp_card = card;
    }
    
  }
  
  animateCard(scene, card, delay, callback, callbackArg, counts) {
    scene.tweens.timeline({
      ease: 'Linear.in',
      repeat: 0,
      tweens: [
        {
          targets: card.obj,
          delay: delay,
          y: '-=10',
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 75,
        },
        {
          targets: card.obj,
          scaleX: 0,
          duration: 60,
          onComplete: callback,
          onCompleteParams: callbackArg,
        },
        {
          targets: card.obj,
          scaleX: 1,
          duration: 60,
        },
        {
          targets: card.obj,
          duration: 75,
          scaleX: 1,
          scaleY: 1,
          y: card.y,
        }
      ],
    });
    scene.haveFaceUp_card = counts;
  }
  
  
  flipCard(tween, targets, custom) {
    let card = custom.card, scene = custom.scene, number = custom.number;
    
    if (custom.count && custom.count == 19) {
      scene.cards.forEach(el => {
        el.obj.setInteractive().on('pointerup', scene.checkCard, el);
        el.obj.setDepth(0);
      });
      
      scene.took_cards = [];
    }
    
    card.obj.setFrame(scene.frame_card[number]);
    card.currentNumber = scene.frame_card[number];
  }
  
  pairCard() {
    let scene = game.current, card = this;
    if (scene.faceUp_card) {
      if (card.number === scene.faceUp_card.number) {
        card.obj.setDepth(1);
        scene.faceUp_card.obj.setDepth(1);
        
        scene.takeCards([card, scene.faceUp_card]);
        
        scene.addPoints((1+card.number)*scene.took_cards.length);
        
        scene.haveFaceUp_card = 0;
      } else {
        scene.animateCard(scene, card, 200, scene.flipCard, [{scene: scene, card: card, number: 10}], scene.haveFaceUp_card);
        scene.animateCard(scene, scene.faceUp_card, 200, scene.flipCard, [{scene: scene, card: scene.faceUp_card, number: 10}], 0);
      }
      
      scene.faceUp_card = undefined;
    }
  }
  
  takeCards(card) {
    let scene = game.current;
    let xOffset = game.config.width*0.08;
    let area = scene.align.placeAtIndex(111, card[0].obj, true);
    let sortedCards = [];
    
    area.x -= xOffset/4;
    
    if (!this.took_cards) this.took_cards = [];
    this.took_cards.push(card[0]);
    this.took_cards.push(card[1]);
    
    sortedCards[0] = [];
    this.took_cards.forEach((el, i) => {
      sortedCards[0][i] = el.number;
      sortedCards[0].sort();
    });
    
    
    let temp = [...this.took_cards];
    while (temp.length>0) {
      sortedCards[1] = [];
      sortedCards[0].forEach((el, i) => {
        temp.forEach((element ,index) => {
          if (element.number == sortedCards[0][i]) {
            sortedCards[1][i] = element;
            temp.splice(index, 1);
          }
        });
      });
    }
    
    for (let i = 0; i < sortedCards[1].length;i++) {
      let _card = sortedCards[1][i];
      _card.obj.setDepth(i);
      if (_card === scene.took_cards[scene.took_cards.length-1] || _card === scene.took_cards[scene.took_cards.length-2]) {
        scene.tweens.timeline({
          targets: _card.obj,
          duration: 200,
          ease: 'Quad',
          tweens: [
            {
              y: '-=10',
              scaleX: 1.1,
              scaleY: 1.1
            },
            {
              x: area.x+((xOffset/2)*i),//+(_card.id>9?xOffset/2:0),
              y: area.y-30,
              scaleX: 1,
              scaleY: 1
            },
            {
              y: '+=30'
            }
          ]
        });
      } else {
        scene.tweens.add({
          targets: _card.obj,
          ease: 'Cubic',
          duration: 100,
          x: area.x+((xOffset/2)*i),
          y: area.y
        });
      }
    }
  }
  
  gameOver() {
    let scene = game.current;
    let score = game.model.score;
    let showScore = scene.add.text(game.config.width/2, game.config.height/2, 'YOU\'VE GOT\n'+score+'\n POINTS!', {
      fontSize: 32,
      fontFamily: 'Courier New',
      color: '#efe7ce',
      align: 'center'
    }).setOrigin(0.5, 0.5);
  }
}