import Phaser from 'phaser'

const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
	anims.create({
		key: 'monkey-idle-down',
		frames: [{ key: 'monkey', frame: 'walk-down-3.png' }]
	})

	anims.create({
		key: 'monkey-idle-up',
		frames: [{ key: 'monkey', frame: 'walk-up-3.png' }]
	})

	anims.create({
		key: 'monkey-idle-side',
		frames: [{ key: 'monkey', frame: 'walk-side-3.png' }]
	})

	anims.create({
		key: 'monkey-run-down',
		frames: anims.generateFrameNames('monkey', { start: 1, end: 8, prefix: 'run-down-', suffix: '.png' }),
		repeat: -1,  
		frameRate: 15
	})

	anims.create({
		key: 'monkey-run-up',
		frames: anims.generateFrameNames('monkey', { start: 1, end: 8, prefix: 'run-up-', suffix: '.png' }),
		repeat: -1,
		frameRate: 15
	})

	anims.create({
		key: 'monkey-run-side',
		frames: anims.generateFrameNames('monkey', { start: 1, end: 8, prefix: 'run-side-', suffix: '.png' }),
		repeat: -1,
		frameRate: 15
	})

	anims.create({
		key: 'monkey-faint',
		frames: anims.generateFrameNames('monkey', { start: 1, end: 4, prefix: 'faint-', suffix: '.png' }),
		frameRate: 15
	})
}

export {
	createCharacterAnims
}
