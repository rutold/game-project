import Phaser from 'phaser'

const createNecromancerCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
	anims.create({
		key: 'necromancer-idle-down',
		frames: [{ key: 'necromancer', frame: 'necromancer-idle-7.png' }]
	})

	anims.create({
		key: 'necromancer-idle-up',
		frames: [{ key: 'necromancer', frame: 'necromancer-idle-7.png' }]
	})

	anims.create({
		key: 'necromancer-idle-side',
		frames: [{ key: 'necromancer', frame: 'necromancer-idle-7.png' }]
	})

	anims.create({
		key: 'necromancer-run-down',
		frames: anims.generateFrameNames('necromancer', { start: 1, end: 8, prefix: 'necromancer-running-left-', suffix: '.png' }),
		repeat: -1,  
		frameRate: 15
	})

	anims.create({
		key: 'necromancer-run-up',
		frames: anims.generateFrameNames('necromancer', { start: 1, end: 8, prefix: 'necromancer-running-left-', suffix: '.png' }),
		repeat: -1,
		frameRate: 15
	})

	anims.create({
		key: 'necromancer-running-left',
		frames: anims.generateFrameNames('necromancer', { start: 1, end: 8, prefix: 'necromancer-running-left-', suffix: '.png' }),
		repeat: -1,
		frameRate: 15
	})

    anims.create({
        key: 'necromancer-running-right',
        frames: anims.generateFrameNames('necromancer', { start: 1, end: 8, prefix: 'necromancer-running-right-', suffix: '.png' }),
        repeat: -1,
        frameRate: 15
    })

	anims.create({
		key: 'necromancer-faint',
		frames: anims.generateFrameNames('necromancer', { start: 1, end: 8, prefix: 'necromancer-dying-', suffix: '.png' }),
		frameRate: 15
	})
}

export {
    createNecromancerCharacterAnims
}
