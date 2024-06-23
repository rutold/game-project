import { GameObjects, Scene } from 'phaser';

import {CharacterTemplate} from "../character/CharacterTemplate.ts";
import AuthenticationService from "../Api/AuthenticationService";

export class MainMenu extends Scene
{
    logo: GameObjects.Image;
    title: GameObjects.Text;
    private form: Phaser.GameObjects.DOMElement;
    characters: CharacterTemplate[];
    authService: AuthenticationService;
    constructor ()
    {
        super('MainMenu');
    }
    
    preload() {
        this.load.html('mainMenu', 'HtmlAssets/mainMenu.html');
    }
    init(data) {
        this.characters = data.characters;
        this.authService = data.auth
    }
    create ()
    {
        
        this.title = this.add.text(400, 100, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        this.form = this.add.dom(400, 300).createFromCache('mainMenu').setOrigin(0.5);

        const newGameButton = this.form.node.querySelector('button.new-game') as HTMLButtonElement;
        const storeButton = this.form.node.querySelector('button.store') as HTMLButtonElement;
        const CharacterStore = this.form.node.querySelector('button.Characters') as HTMLButtonElement;
        newGameButton.addEventListener('click', async () => {
            this.scene.start('SelectCharacter', {  auth: this.authService });
        });

        storeButton.addEventListener('click', async () => {
            this.scene.start('Store', {auth: this.authService});
        });
        CharacterStore.addEventListener('click', async () => {
            this.scene.start('CharacterStore', {auth: this.authService});
        });
    }
    


    
}
