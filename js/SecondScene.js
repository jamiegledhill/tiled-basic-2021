class SecondScene extends BaseScene {
    /** @type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {CustomSprite} */
    player
    /** @type  {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors
    /** @type  {Phaser.Cameras.Scene2D.Camera} */
    camera
    /** @type {Phaser.Physics.Arcade.Group} */
    stars
    /** @type {Phaser.GameObjects.Text} */
    scoreText
    /** @type {Phaser.GameObjects.Text} */
    starText
    /** @type {number} */
    score
    /** @type {number} */
    maxStars = 5
    /** @type {object } */
    sceneData
    constructor() {
        super('Scene2')
    }
    /**
     * 
     * @param {object} data 
     */
    init(data){
        this.score = data.score || 0
        this.sceneData = data    
    }
    preload() {
        super.preload()
        // load tile JSON
        this.load.tilemapTiledJSON('level2', 'assets/level2.json')
    }
    create() {
        // Create tilemap and attach the tiles
        this.map = this.make.tilemap({ key: 'level2' })
        this.createBaseLayers()
        //Create player
        this.player = new CustomSprite(this, 24, 24, 'player')
        this.player.jumpMax = this.sceneData.jumpMax || this.player.jumpMax
        this.player.setSize(14, 24);
        // set up collision with platforms
        const collisionLayer = this.map.getLayer('platforms').tilemapLayer
        collisionLayer.setCollisionBetween(0, 10000)
        this.physics.add.collider(this.player, collisionLayer)
        // add foreground layer
        this.foregroundLayer = this.map.createLayer('foreground', [this.landscape, this.props], 0, 0)
        this.foregroundLayer.setTileIndexCallback(170, this.collectMushroom, this)
        this.foregroundLayer.setTileIndexCallback(140, this.enableDoubleJump, this)
        this.physics.add.overlap(this.player, this.foregroundLayer)
        // this.physics.add.overlap(this.player, this.foregroundLayer, this.getOverlapTileIndex, null, this)
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 10 }),
            frameRate: 15,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { frames: [1, 4] }),
            frameRate: 3,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: [{ key: 'player', frame: 3 }],
            frameRate: 15
        });
        this.anims.create({
            key: 'fall',
            frames: [{ key: 'player', frame: 2 }],
            frameRate: 15
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 11, end: 12 }),
            frameRate: 3,
            repeat: -1
        });
        this.player.setCollideWorldBounds(true)
        this.camera = this.cameras.getCamera("")
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.camera.startFollow(this.player)
        //Enable cursors
        this.cursors = this.input.keyboard.createCursorKeys()
        this.stars = this.physics.add.group({
            key: 'star',
            collideWorldBounds: true,
            repeat: 5,
            setXY: {
                x: 50,
                y: 0,
                stepX: 50
            }
        })
        this.physics.add.collider(this.stars, collisionLayer)
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)
        this.scoreText = this.add.text(16, 16, 'Score: '+this.score, {
            fontSize: '16px',
            color: '#FFF'
        }).setScrollFactor(0)
        this.starText = this.add.text(16, 36, 'Stars left: ' + this.maxStars, {
            fontSize: '16px',
            color: '#FFF'
        }).setScrollFactor(0)
    }
    update() {
        //Check arrow keys
        if (this.cursors.right.isDown) {
            this.player.setVelocityX(100)
            this.player.anims.play('walk', true)
            this.player.flipX = false
            this.player.setOffset(7, 0);
        } else if (this.cursors.left.isDown) {
            this.player.setVelocityX(-100)
            this.player.anims.play('walk', true)
            this.player.flipX = true
            this.player.setOffset(3, 0);
        } else {
            this.player.setVelocityX(0)
            this.player.anims.play('idle', true)
        }
        //Check for space bar press
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && this.player.jumpCount < this.player.jumpMax) {
            this.player.jumpCount++;
            this.player.setVelocityY(-200);
        }
        //Reset jumpCount. Important for double jumping.
        if (this.player.body.velocity.y == 0 && (this.player.body.touching.down || this.player.body.blocked.down)) {
            this.player.jumpCount = 0
        }
        //Display jumping or falling animations
        if (this.player.body.velocity.y < 0) {
            this.player.anims.play('jump', true);
        } else if (this.player.body.velocity.y > 0) {
            this.player.anims.play('fall', true);
        }
    }
    collectStar(player, star) {
        star.disableBody(true, true)
        this.score += 10
        this.scoreText.setText('Score: ' + this.score)
        this.starText.setText('Stars left: ' + this.stars.countActive(true))
    }
    getOverlapTileIndex(player, tile){
        console.log(tile.index)
    }
    collectMushroom(player, tile){
        this.foregroundLayer.removeTileAt(tile.x, tile.y)
        this.score += 50
        this.scoreText.setText('Score: '+this.score)
    }
    restartScene(){
        this.scene.restart()
    }
    enableDoubleJump(player, tile){
        this.player.jumpMax = 2
        this.foregroundLayer.removeTileAt(tile.x, tile.y)
    }
}