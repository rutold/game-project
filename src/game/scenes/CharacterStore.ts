import { Scene } from 'phaser';
import axios from 'axios';
import AuthenticationService from '../Api/AuthenticationService.js'
import {UpgradesTemplate} from "../Templates/UpgradesTemplate.ts";
import {Character} from "../character/Character.ts";
export class CharacterStore extends Scene {
    private authService: AuthenticationService;
    private characters:any;

    constructor() {
        super({ key: 'CharacterStore' });
    }

    preload() {

        
        this.load.rexAwait(this.loadUpgradesFromDatabase.bind(this));
    }
    init(data) {
        this.authService = data.auth
    }

     create() {
        this.add.text(400, 50, 'Store', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

         const goback = this.add.text(35,  70, `Go back`, { fontSize: '16px', color: '#fff' }).setOrigin(0.5).setInteractive();
        this.displayCharacters(this.characters);
        goback.on('pointerdown', async () =>{
            this.scene.stop("CharacterStore")
            this.scene.start("MainMenu")
        } )
    }
    async loadUpgradesFromDatabase(successCallback: Function, failureCallback: Function) {
        try {
            const response = await axios.get('https://rutold.onrender.com//gameData/characters');
            this.characters = response.data
            for (const character of this.characters) {
                
            }
            successCallback();
        } catch (error) {
            console.error('Error loading enemies:', error);
            failureCallback();
        }
    }

    async displayCharacters(characters) {
        const user = this.authService.getUser();
        const jwtToken = this.authService.getToken();

        for (const [index, character] of characters.entries()) {
            const x = 100 + (index % 3) * 200;
            const y = 150 + Math.floor(index / 3) * 250;
            let buyButton:Phaser.GameObjects.Text;
           const storeCharacter = this.physics.add.sprite(x, y, character.name).setScale(1);
            storeCharacter.setSize(20,20)
            let userOwnsCharacter = false;
            let characterText:Phaser.GameObjects.Text;
            try {
                const response = await axios.get(`https://rutold.onrender.com//User/character/${character.id}/user/${user.userid}`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                if (response.data) {
                    userOwnsCharacter = true
                }

            } catch (error) {
                if (error.response && error.response.status === 404) {
                    userOwnsCharacter = false;
                } else {
                    console.error(`Error couldn't find charaters`, error);
                }
            }

            characterText = this.add.text(x, y + 70, `${character.name}\nCost: ${character.cost}`, { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
            
            if (!userOwnsCharacter && character.cost != 0) {
                buyButton = this.add.text(x, y + 110, 'Buy', { fontSize: '20px', color: '#0f0' }).setOrigin(0.5).setInteractive();
                    buyButton.on('pointerdown', async () => {
                        try {
                            await axios.post(`https://rutold.onrender.com//User/${user.userid}/characters/${character.id}`, {}, {
                                headers: { 'Authorization': `Bearer ${jwtToken}` }
                            });
                                buyButton.destroy()
                            
                        } catch (error) {
                            buyButton.destroy()
                            buyButton = this.add.text(x, y + 110, 'Not enough currency', { fontSize: '20px', color: '#f00' }).setOrigin(0.5);
                        }
                    });
            } 
        }
    }
    

}


