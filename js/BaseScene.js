class BaseScene extends Phaser.Scene {
    /** @type {Phaser.Tilemaps.Tilemap} */
     map
    constructor(id) {
        super(id)
    }
    preload() {
        //Load assets
        this.load.image('landscape-tileset', 'assets/landscape-tileset.png')
        this.load.image('props-tileset', 'assets/props-tileset.png')
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 24, frameHeight: 24 })
        this.load.image('star', 'assets/star.png')
    }
    createBaseLayers(){
        this.landscape = this.map.addTilesetImage('landscape-tileset', 'landscape-tileset')
        this.props = this.map.addTilesetImage('props-tileset', 'props-tileset')
        // set world bounds
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        // create background and platform layers
        this.map.createLayer('background', [this.landscape, this.props], 0, 0)
        this.map.createLayer('midground', [this.landscape, this.props], 0, 0)
        this.map.createLayer('platforms', [this.landscape, this.props], 0, 0)
    }
}