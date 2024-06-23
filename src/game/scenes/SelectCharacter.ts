import { GameObjects, Scene } from 'phaser';
import { CharacterTemplate } from "../character/CharacterTemplate";
import axios from "axios";
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export class SelectCharacter extends Scene {
    private logo: GameObjects.Image;
    private title: GameObjects.Text;
    private form: Phaser.GameObjects.DOMElement;
    private characters: CharacterTemplate[];
   private user:any
    private token:any
    private auth:any;
    private details: Phaser.GameObjects.DOMElement;
    private isMakingNewGame:boolean;
    private  isUsingExistingGame:boolean;
    private NewGameInput: HTMLInputElement;
    private ExistingGameInput: HTMLInputElement;
    private selectedDifficulty;
    constructor() {
        super('SelectCharacter');
    }

    init(data) {
        this.auth = data.auth
        this.user = this.auth.getUser()
        this.token = this.auth.getToken()
    }

    preload() {
        this.load.html('characterCard', 'HtmlAssets/characterCard.html');
        this.load.html('details', 'HtmlAssets/GameDetailElements.html');
        
    }
    
    async create() {
        await this.loadOwnedAndFreeCharacters();
        this.title = this.add.text(400, 100, 'Select Character', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.form = this.add.dom(400, 300).createFromCache('characterCard').setOrigin(0.5);
        this.details = this.add.dom(400, 450).createFromCache('details').setOrigin(0.5);
        const characterSelect = this.form.getChildByID('characterSelect');

        this.characters.forEach((character, index) => {
            const optionHTML = `<option value="${index}">${character.name}</option>`;
            characterSelect.innerHTML += optionHTML;
            
        });

        const button = this.add.text(400, 650, 'Start Game', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        button.setInteractive({ useHandCursor: true });
        button.on('pointerdown', () => {
            const characterIndex = parseInt(characterSelect.value);
            const selectedCharacter = this.characters[characterIndex];
            this.beginGame(selectedCharacter)
        });
        const checkIfCanCreateButton = this.details.node.querySelector('.checkIfCanCreate') as HTMLButtonElement;
        checkIfCanCreateButton.addEventListener('click', async () => {
            this.createNewGame()
        });
        const checkExistingButton = this.details.node.querySelector('.checkExisting') as HTMLButtonElement;
        checkExistingButton.addEventListener('click', async () => {
            this.selectGame()
        });
        this.input.on('pointerdown', this.logMouseClick, this);
    }
    logMouseClick(pointer) {
        const x = pointer.x;
        const y = pointer.y;
        console.log(`Mouse clicked at: (${x}, ${y})`);
    }
    async beginGame(selectedCharacter:CharacterTemplate){
        this.selectedDifficulty = document.querySelector(`[name="difficulty"]:checked`);
        if(this.selectedDifficulty.value){
           if(this.isMakingNewGame){
               try {
                   const response = await axios.post(`https://rutold.onrender.com/:10000/gameData/createGame`,{
                       game: this.NewGameInput.value,
                       difficulty:this.selectedDifficulty.value
                   } ,{
                           headers: { 'Authorization': `Bearer ${this.token}` }
                   });
               } catch (error) {
                  
               }
               this.scene.stop('TimerScene')
               this.scene.start('Game', { character: selectedCharacter, characters: this.characters , gameData:{game:this.NewGameInput.value, difficulty:this.selectedDifficulty.value}});
           }
           else if(this.isUsingExistingGame){
               this.scene.stop('TimerScene')
               this.scene.start('Game', { character: selectedCharacter, characters: this.characters , gameData:{game:this.ExistingGameInput.value, difficulty:this.selectedDifficulty.value}});
           }
        }
    }
    async selectGame() {
        const errorMessage = document.querySelector('.error_message_2');
        try {
             this.ExistingGameInput = this.details.getChildByName('madeseed') as HTMLInputElement;
            if ( this.ExistingGameInput.value == "") {
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'An error occurred. Please try again.';
            } else {
                const response = await axios.get(`https://rutold.onrender.com/:10000/gameData/game/${ this.ExistingGameInput.value}`, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                if (response.data) {
                    errorMessage.style.display = 'none';
                    this.isMakingNewGame = false;
                    this.isUsingExistingGame = true;
                    // Set the radio button value based on the response data
                    const difficulty = response.data.difficulty;
                    const radioButton = document.querySelector(`input[name="difficulty"][value="${difficulty}"]`);
                    if (radioButton) {
                        radioButton.checked = true;
                    } else {
                        console.error(`No radio button found for difficulty: ${difficulty}`);
                    }

                } else {
                    console.log(response.data);
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = 'Such game exists, try another name.';
                }
            }
        } catch (error) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'An error occurred. Please try again.';
        }
    }

    async createNewGame(){
        const errorMessage = document.querySelector('.error_message');
        try {
             this.NewGameInput = this.details.getChildByName('seed') as HTMLInputElement;
            if(this.NewGameInput.value == ""){

                errorMessage.style.display = 'block';
                errorMessage.textContent = 'An error occurred. Please try again.';
            }
            else{
                const response = await axios.get(`https://rutold.onrender.com/:10000/gameData/game/${this.NewGameInput.value}`, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                if(response.data){
                    console.log(response.data)
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = 'such game exists, try another name';
                }
                else{
                    errorMessage.style.display = 'none';
                    this.isMakingNewGame = true
                    this.isUsingExistingGame = false;
                }
            }

        } catch (error) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'An error occurred. Please try again.';
        }
    }
    async loadOwnedAndFreeCharacters() {
        try {
            const response = await axios.get(`https://rutold.onrender.com/:10000/User/userRelatedCharacters/${this.user.userid}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (response.data) {
                this.characters = response.data
            }

        } catch (error) {
                console.error(`Error couldn't find charaters`, error);
        }
    }
}
