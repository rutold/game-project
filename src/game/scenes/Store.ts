import { Scene } from 'phaser';
import axios from 'axios';
import AuthenticationService from '../Api/AuthenticationService.js'
import {UpgradesTemplate} from "../Templates/UpgradesTemplate.ts";
export class Store extends Scene {
    private authService: AuthenticationService;
    private upgrades:UpgradesTemplate[];

    constructor() {
        super({ key: 'Store' });
    }
    init(data) {
        this.authService = data.auth
    }
    preload() {
        this.load.rexAwait(this.loadUpgradesFromDatabase.bind(this));
    }

     create() {
        this.add.text(400, 50, 'Store', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

         const goback = this.add.text(35,  70, `Go back`, { fontSize: '16px', color: '#fff' }).setOrigin(0.5).setInteractive();
        this.displayUpgrades(this.upgrades);
        goback.on('pointerdown', async () =>{
            this.scene.stop("Store")
            this.scene.start("MainMenu")
        } )
         this.input.on('pointerdown', (pointer) => {
             if (pointer.leftButtonDown()) {
                 console.log(`Mouse position on left click - X: ${pointer.x}, Y: ${pointer.y}`);
             }
         });
    }
    async loadUpgradesFromDatabase(successCallback: Function, failureCallback: Function) {
        try {
            const response = await axios.get('https://rutold.onrender.com//gameData/upgrades');
            this.upgrades = response.data
            const upgrades = response.data;
            for (const upgrade of upgrades) {
                this.load.image(upgrade.name, upgrade.imageUrl);
            }
            successCallback();
        } catch (error) {
            console.error('Error loading upgrades:', error);
            failureCallback();
        }
    }

    async displayUpgrades(upgrades) {
        const user = this.authService.getUser();
        const jwtToken = this.authService.getToken();

        for (const [index, upgrade] of upgrades.entries()) {
            const x = 100 + (index % 3) * 200;
            const y = 150 + Math.floor(index / 3) * 250;
            let buyButton:Phaser.GameObjects.Text;
            this.add.image(x, y, upgrade.name).setScale(0.5);
            let userOwnsCharacter = false;
            let upgradeText:Phaser.GameObjects.Text;
            let currentTier = 0; 
            let counter:number;

            try {
                const response = await axios.get(`https://rutold.onrender.com//User/upgrades/${user.userid}/${upgrade.id}`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });

                if (response.data && response.data.tier >= 0) {
                    currentTier = response.data.tier;
                    if(currentTier ){
                        counter = response.data.tier
                    }
                    userOwnsCharacter = currentTier >= upgrade.numberOfTiers;
                }

            } catch (error) {
                counter = 0
            }

            upgradeText = this.add.text(x, y + 70, `${upgrade.name}\nCost: ${upgrade.baseCost}\nMax Tier: ${upgrade.numberOfTiers}\nCurrent Tier: ${currentTier}`, { fontSize: '16px', color: '#fff' }).setOrigin(0.5);

            if (!userOwnsCharacter) {
                buyButton = this.add.text(x, y + 110, 'Buy', { fontSize: '20px', color: '#0f0' }).setOrigin(0.5).setInteractive();
                ((currentTier) => {
                    buyButton.on('pointerdown', async () => {
                        try {
                            await axios.post(`https://rutold.onrender.com//User/${user.userid}/upgrades/${upgrade.id}`, {}, {
                                headers: { 'Authorization': `Bearer ${jwtToken}` }
                            });
                            upgradeText.destroy();
                            counter++
                            upgradeText = this.add.text(x, y + 70, `${upgrade.name}\nCost: ${upgrade.baseCost}\nMax Tier: ${upgrade.numberOfTiers}\nCurrent Tier: ${currentTier + counter}`, { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
                            userOwnsCharacter = true;
                            if(counter >= upgrade.numberOfTiers){
                                buyButton.destroy()
                            }
                            console.log(`Upgrade ${upgrade.name} purchased successfully`);
                        } catch (error) {
                            buyButton.destroy();
                            buyButton = this.add.text(x, y + 110, 'Not enough currency or max tier reached', { fontSize: '20px', color: '#f00' }).setOrigin(0.5);
                            console.error(`Error purchasing upgrade ${upgrade.name}:`, error);
                        }
                    });
                })(currentTier);
            } 
        }
    }
    

}


