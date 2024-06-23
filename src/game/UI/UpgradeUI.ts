import Phaser from 'phaser'
import { sceneEvents } from '../../events/EventsCenter'


export default class UpgradeUI extends Phaser.Scene {
    private upgrades!: Phaser.GameObjects.Container;
    private checkUpgrade!: boolean;

    constructor() {
        super({ key: 'upgrade-ui' })

        
    }

    init() {
        this.checkUpgrade = false;
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    }

    create() {
        this.scene.pause('Game')
        sceneEvents.emit('pause-timer')
       this.add.text(400, 500, 'Select Upgrade')
       this.createUpgrades()
    }
    
    private generateUpgrades() {
        const upgradeTypes = ['damage', 'walkspeed', 'health', 'cooldown'] as const;
        const upgradeTierValues = [1, 2, 5, 10] as const;
        const upgradeTierProbabilities = [10, 25, 50, 100];

        function randomIntFromInterval(min: number, max: number) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        function pickTier() {
            const maxProbability = upgradeTierProbabilities.reduce((a, b) => a + b, 0);
            const scaledProbabilities = upgradeTierProbabilities.map((prob) => Math.round(prob + (maxProbability - prob)));
            const tierProbabilitySum = scaledProbabilities.slice(0, -1).reduce((a, b) => a + b, 0);
            let randomPoint = randomIntFromInterval(1, tierProbabilitySum);
            let tierIndex = 0;

            while (randomPoint > scaledProbabilities[tierIndex]) {
                randomPoint -= scaledProbabilities[tierIndex];
                tierIndex++;
            }

            return upgradeTierValues[tierIndex];
        }

        function pickUpgradeType() {
            return upgradeTypes[randomIntFromInterval(0, upgradeTypes.length - 1)];
        }

        const upgrades: { type: string; tier: number }[] = [];
        for (let i = 0; i < 2; i++) {
            const upgradeType = pickUpgradeType();
            const tier = pickTier();
            upgrades.push({ type: upgradeType, tier });
        }

        return upgrades;
    }

    private createUpgrades() {
        let counter = 'ONE';
        let event = 'keydown-';
        let concat = event+counter;
        const retrievedUpgrades: { type: string; tier: number }[] = this.generateUpgrades();
        this.upgrades = this.add.container(0, 0);

        const fixedWidth = 100;  
        const fixedHeight = 100; 

        retrievedUpgrades.forEach((upgrade, index) => {
            const xPosition = 200 + index * 200;

            const upgradeDescription = this.add.text(0, -80, `Upgrade: ${upgrade.type}\nTier: ${upgrade.tier}\nIncrease: +${upgrade.tier}`)
                .setOrigin(0.5)
                .setAlign('center')
                .setStyle({ fontSize: '16px', fill: '#fff' });

            const upgradeImage = this.add.image(0, 0, `${upgrade.type}-upgrade`)
                .setDisplaySize(fixedWidth, fixedHeight);

            const upgradeButton = this.add.image(0, 150, 'button')
                .setDisplaySize(fixedWidth, fixedHeight)
                .setInteractive();
            this.input.keyboard.on(concat, () => {
                sceneEvents.emit('upgrade-done', null);


                this.scene.stop("upgrade-ui");
                this.scene.resume("Game");
                sceneEvents.emit('unpause-timer')
                sceneEvents.emit('upgrade-chosen', upgrade.type, upgrade.tier);
            });
            counter = 'TWO';
            concat = event+counter;
            upgradeButton.on('pointerdown', () => {
                sceneEvents.emit('upgrade-done', null);
                
              
                this.scene.stop("upgrade-ui");
                this.scene.resume("Game");
                sceneEvents.emit('unpause-timer')
                sceneEvents.emit('upgrade-chosen', upgrade.type, upgrade.tier);
            });

            const upgradeContainer = this.add.container(xPosition, 0, [upgradeDescription, upgradeImage, upgradeButton]);
            this.upgrades.add(upgradeContainer);
        });

        this.centerUpgrades();
    }

    private centerUpgrades() {
        const { width, height } = this.scale;
        const upgradesBounds = this.upgrades.getBounds();
        const upgradesWidth = upgradesBounds.width;
        const upgradesHeight = upgradesBounds.height;

        this.upgrades.setPosition(
            (width - upgradesWidth) / 2,
            (height - upgradesHeight) / 2
        );
    }
}