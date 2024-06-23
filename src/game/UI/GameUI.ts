import Phaser from 'phaser'

import { sceneEvents } from '../../events/EventsCenter'

export default class GameUI extends Phaser.Scene
{
    private hearts!

    constructor()
    {
        super({ key: 'game-ui' })
    }
    init()
    {
        this.fullWidth = 300
    }
    create() {
        const y = 300
        const x = 200

        // background shadow
        this.leftCap = this.add.image(x, y, 'left-cap-shadow')
            .setOrigin(0, 0.5);

        this.middle = this.add.image(x, y, 'middle-shadow')
            .setOrigin(0, 0.5);
        this.middle.displayWidth = this.fullWidth;

        this.rightCap = this.add.image(x + this.fullWidth, y, 'right-cap-shadow')
            .setOrigin(0, 0.5);

        this.leftCap = this.add.image(x, y, 'left-cap')
            .setOrigin(0, 0.5);

        this.middle = this.add.image(x, y, 'middle')
            .setOrigin(0, 0.5);

        this.rightCap = this.add.image(x + this.fullWidth, y, 'right-cap')
            .setOrigin(0, 0.5);
        this.setMeterPercentage(0);
        
        sceneEvents.on('update-meter', this.updateMeter, this);

        this.hearts = this.add.image(100, 500   , 'ui-health-bar-6');

        sceneEvents.on('player-health-changed', this.handlePlayerHealthChanged, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            sceneEvents.off('player-health-changed', this.handlePlayerHealthChanged, this);
        });
    }
    updateMeter(currentExp: number, requiredExpForLvlUp: number) {
        this.setMeterPercentageAnimated(currentExp / requiredExpForLvlUp);
    }
    setMeterPercentageAnimated(percent = 1, duration = 1000) {
        const width = this.fullWidth * percent;

        this.tweens.add({
            targets: this.middle,
            displayWidth: width,
            duration,
            ease: Phaser.Math.Easing.Sine.Out,
            onUpdate: () => {
                this.rightCap.x = this.middle.x + this.middle.displayWidth;
                this.leftCap.visible = this.middle.displayWidth > 0;
                this.middle.visible = this.middle.displayWidth > 0;
                this.rightCap.visible = this.middle.displayWidth > 0;
            },
        });
    }

    setMeterPercentage(percent = 1) {
        const width = this.fullWidth * percent;

        this.middle.displayWidth = width;
        this.rightCap.x = this.middle.x + this.middle.displayWidth;
    }


    private handlePlayerHealthChanged(health: number, maxHealth: number) {
        const sectionSize = maxHealth / 4;
        const currentSection = Math.ceil((maxHealth - health) / sectionSize);
        switch (currentSection) {
            case 1:
                this.hearts.setTexture('ui-health-bar-5');
                break;
            case 2:
                this.hearts.setTexture('ui-health-bar-4');
                break;
            case 3:
                this.hearts.setTexture('ui-health-bar-3');
                break;
            case 4:
                this.hearts.setTexture('ui-health-bar-2');
                break;
            
                
        }
        if (health <= 0)
        {
            this.hearts.setTexture('ui-health-bar-1');
        }
    }



}