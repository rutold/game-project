import { Scene } from 'phaser';
import axios from 'axios';
import {CharacterTemplate} from "../character/CharacterTemplate.ts";
import AuthenticationService from "../Api/AuthenticationService";


export class Preloader extends Scene {
    characters: CharacterTemplate[] = [];
    authService: AuthenticationService;
    constructor() {
        super('Preloader');
        this.authService = new AuthenticationService();
    }

    preload() {
        this.load.image('tiles', 'assets/map.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');
        this.authService.init();
        this.load.image('left-cap', 'ui/barHorizontal_blue_left.png')
        this.load.image('middle', 'ui/barHorizontal_blue_mid.png')
        this.load.image('right-cap', 'ui/barHorizontal_blue_right.png')

        this.load.image('left-cap-shadow', 'ui/barHorizontal_shadow_left.png')
        this.load.image('middle-shadow', 'ui/barHorizontal_shadow_mid.png')
        this.load.image('right-cap-shadow', 'ui/barHorizontal_shadow_right.png')
        this.load.image('ui-health-bar-6', 'ui/health-ui-6.png');
        this.load.image('ui-health-bar-5', 'ui/health-ui-5.png');
        this.load.image('ui-health-bar-4', 'ui/health-ui-4.png');
        this.load.image('ui-health-bar-3', 'ui/health-ui-3.png');
        this.load.image('ui-health-bar-2', 'ui/health-ui-2.png');
        this.load.image('ui-health-bar-1', 'ui/health-ui-1.png');
        this.load.image('upgrade1', 'ui/health-ui-6.png');
        this.load.image('upgrade2', 'ui/health-ui-6.png');
        this.load.image('upgrade3', 'ui/health-ui-6.png');
        this.load.image('health-upgrade', 'ui/heart.png');
        this.load.image('walkspeed-upgrade', 'ui/speed.png');
        this.load.image('damage-upgrade', 'ui/damage.png');
        this.load.image('cooldown-upgrade', 'ui/hourglass.png');
        this.load.image('button', 'ui/health-ui-6.png');
        this.load.image('tiles', 'ui/assets/map.png')
        this.load.tilemapTiledJSON('map', 'assets/map.json')
        this.load.atlas('exp', 'ui/exp.png', 'ui/exp.json')
        this.load.atlas('lizard', 'enemies/lizard.png', 'enemies/lizard.json')
        this.load.rexAwait(this.loadCharactersFromDatabase.bind(this));
        this.load.rexAwait(this.loadAbilitiesFromDatabase.bind(this));
    }

    async loadCharactersFromDatabase(successCallback: Function, failureCallback: Function) {
        try {
            const response = await axios.get('https://rutold.onrender.com/:10000/gameData/characters', {
                headers: { 'Authorization': `Bearer ${this.authService.getToken()}` }
            });
            const charactersData: CharacterTemplate[] = response.data;

            for (const characterData of charactersData) {
                this.load.atlas(characterData.name, characterData.imageUrl, characterData.atlasJsonUrl);
                
                this.characters.push(characterData);
            }

            successCallback();
        } catch (error) {
            failureCallback(error);
        }
    }



    async loadEnemiesFromDatabase(successCallback: Function, failureCallback: Function) {
        try {
            const response = await axios.get('https://rutold.onrender.com/:10000/gameData/enemies', {
                headers: { 'Authorization': `Bearer ${this.authService.getToken()}` }
            });
            const enemies = response.data;
            for (const enemy of enemies) {
                this.load.atlas(enemy.name, enemy.imageUrl, enemy.atlasJsonUrl);
            }
            successCallback();
        } catch (error) {
            console.error('Error loading enemies:', error);
            failureCallback();
        }
    }

    async loadAbilitiesFromDatabase(successCallback: Function, failureCallback: Function) {
        try {
            const response = await axios.get('https://rutold.onrender.com/:10000/gameData/abilities', {
                headers: { 'Authorization': `Bearer ${this.authService.getToken()}` }
            });
            const abilities = response.data;
            for (const ability of abilities) {
                this.load.atlas(ability.name, ability.imageUrl, ability.atlasJsonUrl);
            }
            successCallback();
        } catch (error) {
            console.error('Error loading abilities:', error);
            failureCallback();
        }
    }

    async loadGameUIFromDatabase(successCallback: Function, failureCallback: Function) {
        try {
            const response = await axios.get('https://rutold.onrender.com/:10000/gameData/game-ui', {
                headers: { 'Authorization': `Bearer ${this.authService.getToken()}` }
            });
            const gameUI = response.data;
            for (const uiElement of gameUI) {
                this.load.image(uiElement.name, uiElement.imageUrl);
            }
            successCallback();
        } catch (error) {
            console.error('Error loading game UI:', error);
            failureCallback();
        }
    }

    create() {
        const token =  this.authService.getToken()
        if(token === null){
            console.log("token is null")
            this.authService.init();
        }
        if (!token) {
            this.scene.start('Login');
            return;
        }
        this.scene.start('MainMenu', { characters: this.characters, auth: this.authService });
    }
}
