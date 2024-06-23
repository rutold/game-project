import Phaser from 'phaser'

const createExpAnims = (anims: Phaser.Animations.AnimationManager) => {
	anims.create({
		key: 'exp-0',
		frames: [{ key: 'exp', frame: 'exp-0.png' }]
	})
    anims.create({
        key: 'exp-1',
        frames: [{ key: 'exp', frame: 'exp-1.png' }]
    })
    anims.create({
        key: 'exp-2',
        frames: [{ key: 'exp', frame: 'exp-2.png' }]
    })
    anims.create({
        key: 'exp-3',
        frames: [{ key: 'exp', frame: 'exp-3.png' }]
    })
    anims.create({
        key: 'exp-4',
        frames: [{ key: 'exp', frame: 'exp-4.png' }]
    })
}

export {
    createExpAnims
}
