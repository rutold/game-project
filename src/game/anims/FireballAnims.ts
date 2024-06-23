import Phaser from 'phaser'

const createfireballanims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create({
        key: 'fireballAnimation',
        frames: anims.generateFrameNames('fireball', {
            prefix: 'fireball-0',
            start: 1,
            end: 13,
            suffix: '.png'
        }),
        repeat: 0, 
        frameRate: 10 
    });
}

export {
    createfireballanims
}
