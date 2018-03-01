/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />

var player: Phaser.Sprite
var platforms: Phaser.Group
var cursors: Phaser.CursorKeys

var stars: Phaser.Group
var score: number = 0
var scoreText: Phaser.Text

class SimpleGame
{
  game: Phaser.Game

  constructor () {
    this.game = new Phaser.Game(
      800,
      600,
      Phaser.AUTO,
      '',
      {
        preload: this.preload.bind(this),
        create: this.create.bind(this),
        update: this.update.bind(this)
      }
    )
  }

  preload () {
    this.game.load.image('sky', 'assets/sky.png')
    this.game.load.image('ground', 'assets/platform.png')
    this.game.load.image('star', 'assets/star.png')
    this.game.load.image('wave', 'assets/wave.jpg')
    this.game.load.spritesheet('dude', 'assets/dude.png', 32, 48)
  }

  create() {
    //  We're going to be using physics, so enable the Arcade Physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    //  A simple background for our game
    this.game.add.sprite(0, 0, 'sky')
    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.game.add.group()
    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true

    // Here we create the ground.
    var ground = platforms.create(0, this.game.world.height - 32, 'ground')
    var wave = platforms.create(this.game.world.width / 2, this.game.world.height - 32, 'wave')
    wave.scale.setTo(0.1, 0.1)
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 1)

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground')
    ledge.body.immovable = true

    ledge = platforms.create(-150, 250, 'ground')
    ledge.body.immovable = true

    // The player and its settings
    player = this.game.add.sprite(32, this.game.world.height - 150, 'dude')

    //  We need to enable physics on the player
    this.game.physics.arcade.enable(player)

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0
    player.body.gravity.y = 1000
    player.body.collideWorldBounds = 1

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true)
    player.animations.add('right', [5, 6, 7, 8], 10, true)

    //  Finally some : Phaser.Group to collect
    stars = this.game.add.group()

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 100; ++i) {
      //  Create a star inside of the 'stars' group
      var star = stars.create((this.game.world.width / 15) * i + 25, 0, 'star')
      star.body.gravity.y = 300
      star.body.bounce.y = 0.7 + Math.random() * 0.2
    }

    //  The score
    var scoreFont: Phaser.PhaserTextStyle = { fontSize: 32, fill: 'white' }
    scoreText = this.game.add.text(16, 16, 'score: 0', scoreFont)
    //  Our controls.
    cursors = this.game.input.keyboard.createCursorKeys()
  }

  update () {
    //  Collide the player and the stars with the platforms
    var hitPlatform = this.game.physics.arcade.collide(player, platforms)
    this.game.physics.arcade.collide(stars, platforms)

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.game.physics.arcade.overlap(player, stars, this.collectStar.bind(this))

    //  Reset the players velocity
    player.body.velocity.x = 0
    if (cursors.left.isDown) {
      //  Move to the left
      player.body.velocity.x = -400
      player.animations.play('left')
    } else if (cursors.right.isDown) {
      //  Move to the right
      player.body.velocity.x = 400
      player.animations.play('right')
    } else {
      //  Stand still
      player.animations.stop()
      player.frame = 4
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
      player.body.velocity.y = -700
    }
  }

  collectStar (player: Phaser.Sprite, star: Phaser.Sprite) {
    // debugger
    // Removes the star from the screen
    // star.kill()
    if (player.x > star.x) {
      // pushing left
      star.x = player.x - star.width
    } else {
      star.x = player.x + player.width
    }
    //  Add and update the score
    score += 10
    scoreText.text = 'Score: ' + score
  }
}

var game = new SimpleGame()
