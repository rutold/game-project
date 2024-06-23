import {debugDraw} from "../utils/debug.ts";
import { Scene } from 'phaser';
import Phaser from 'phaser';
import {createCharacterAnims} from "../anims/CharacterAnims.ts";
import {createfireballanims} from "../anims/FireballAnims.ts";
import {sceneEvents} from "../../events/EventsCenter.ts";
import Lizard from "../enemies/lizard.ts";
import {createLizardAnims} from "../anims/enemyAnims.ts";
import {createNecromancerCharacterAnims} from "../anims/NecromancerCharacterAnims.ts";
import {Character} from "../character/Character.ts";
import {CharacterTemplate} from "../character/CharacterTemplate.ts";
import {AbilityTemplate} from "../Templates/AbilityTemplate.ts";
import {createExpAnims} from "../anims/ExpAnims.ts";
import TimerScene from "../UI/TimerController.ts";
import axios from "axios";
import AuthenticationService from "../Api/AuthenticationService";
import {ChatUI} from "../UI/ChatUI.ts";

export class Game extends Scene
{
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private fireballsGroup!: Phaser.Physics.Arcade.Group
    private lizards!: Phaser.Physics.Arcade.Group
    private playerLizardsCollider?: Phaser.Physics.Arcade.Collider
    private abilityGroups: Phaser.Physics.Arcade.Group[] = [];
    private abilities: AbilityTemplate[] = [];
    private timerScene:TimerScene
    private exp!: Phaser.Physics.Arcade.Group
    private killCount = 0;
    private authService: AuthenticationService;
    private difficulty: string;
    private gameseed: string;
    characters: CharacterTemplate[];
    character: CharacterTemplate;
    player: Character;

    constructor() {
        super('Game');
        this.authService = new AuthenticationService()
    }

    init(data) {
        this.character = data.character;
        this.characters = data.characters;
        this.difficulty = data.gameData.difficulty;
        this.gameseed = data.gameData.game;
    }

    preload() {
        this.cursors = this.input.keyboard.createCursorKeys()
        this.input.keyboard.removeCapture('SPACE');
        this.authService.init();
    }z

    async loadUpgrades() {
        const user = this.authService.getUser();
        const jwtToken = this.authService.getToken();
        try {
            const response = await axios.get(`https://rutold.onrender.com/:10000/User/upgrades/user/${user.userid}`, {
                headers: {'Authorization': `Bearer ${jwtToken}`}
            });
            if (response.data) {
                this.player.loadUpgrade(response.data)
            }

        } catch (error) {
            console.error(`Error couldn't find upgrades`, error);
        }
    }

    create() {

        const token = localStorage.getItem('token');
        if (!token) {
            this.scene.start('Login');
            return;
        }

        this.scene.run('TimerScene');
        this.timerScene = this.scene.get('TimerScene') as TimerScene;
        this.scene.run('game-ui')
        createNecromancerCharacterAnims(this.anims)
        createCharacterAnims(this.anims)
        createLizardAnims(this.anims)
        createfireballanims(this.anims)
        createExpAnims(this.anims)
        const newMap = this.make.tilemap({key: 'map'})
        const tileset = newMap.addTilesetImage('openworld' , 'tiles')
        newMap.createLayer('Ground', tileset)
        const wallsLayer = newMap.createLayer('Walls', tileset)
        // @ts-ignore
        wallsLayer.setCollisionByProperty({collides: true})
        this.lizards = this.physics.add.group({
            classType: Lizard,
            maxSize: 10,
            createCallback: (go) => {
                const Enemy = go as Lizard;
                Enemy.body.onCollide = true;
                Enemy.setTarget(this.player);
            }
        });
        this.characters.forEach((template: CharacterTemplate) => {
            if (template === this.character) {
                const newCharacter = new Character(
                    this,
                    template.x,
                    template.y,
                    template.name,
                    undefined,  
                    template,
                    {
                        up: `${template.name}-run-up`,
                        down: `${template.name}-run-down`,
                        left: `${template.name}-run-side`,
                        right: `${template.name}-run-side`,
                    }
                );
                this.add.existing(newCharacter);
                this.physics.add.existing(newCharacter);
                let abilityTemplate: AbilityTemplate;
                for(const ability of newCharacter.abilities){
                    abilityTemplate = ability as AbilityTemplate;
                    const abilityGroup = this.physics.add.group({
                        classType: Phaser.Physics.Arcade.Sprite
                    });
                    this.abilityGroups.push(abilityGroup);
                    this.abilities.push(abilityTemplate)
                }
              this.player= newCharacter
                newCharacter.body.setSize(newCharacter.width * 0.5, newCharacter.height * 0.8);
                for(let i = 0; i < this.abilityGroups.length; i++) {
                    const abilityGroup = this.abilityGroups[i];
                    const usedAbility = this.abilities[i];
                    newCharacter.setFireballs(abilityGroup);
                    this.physics.add.collider(abilityGroup, this.lizards, (abilityGroup: Phaser.Physics.Arcade.Sprite, lizard: Phaser.GameObjects.GameObject) => {
                        this.handleAbilityLizardCollision(abilityGroup, lizard, usedAbility, i, newCharacter);
                    }, undefined, this);
                }
                this.physics.add.collider(newCharacter, wallsLayer);
                this.physics.add.collider(this.lizards, newCharacter, this.handlePlayerLizardCollision, undefined, this);
                this.exp = this.physics.add.group({
                    classType: Phaser.Physics.Arcade.Sprite
                })
                this.cameras.main.startFollow(newCharacter, true)
                this.physics.add.collider(this.exp, newCharacter, this.handleExpCharacterCollision, undefined, this);
                this.fireballsGroup = this.physics.add.group({
                    classType: Phaser.Physics.Arcade.Sprite
                })
                newCharacter.update(this.cursors);
                this.characters.push(newCharacter);
                const spawnDelay = this.getSpawnDelay(this.difficulty);
                this.time.addEvent({
                    delay: spawnDelay,
                    callback: () => {
                        this.spawnEnemies();
                    },
                    callbackScope: this,
                    loop: true
                });
            }});
        this.physics.add.collider(this.lizards, this.lizards)
        this.physics.add.collider(this.lizards, wallsLayer)
  
        this.physics.add.collider(this.fireballsGroup, wallsLayer, this.handleFireballWallCollision, undefined, this)
        sceneEvents.once('character-dead',this.gameOver, this)
        this.loadUpgrades()
        this.scene.launch('ChatUI', {name: this.gameseed})
        
    }
   
    private gameOver(){
        const timeScore = Math.round(this.timerScene.timer.elapsed/60000)
        const finalScore = (timeScore*this.killCount)*10
        sceneEvents.emit('game-over')
        this.time.delayedCall(400, () => {
            this.scene.launch("GameOver", { finalScore: finalScore, game:this.gameseed})
        });

    }
    private spawnEnemies() {
        const character = this.player;
        const time = Math.round(this.timerScene.timer.elapsed / 1000);
        const maxEnemies = this.getMaxEnemies(time);

        for (let i = 2; time >= i; i += 5) {
            this.spawnEnemyPair(character.x, character.y, i);
            if (time === i) {
                const increaseMaxEnemiesBy = time / 5;
                this.lizards.maxSize = 10 + increaseMaxEnemiesBy;
            }
        }

        this.additionalSpawnsBasedOnTime(character, time);
    }
    getMaxEnemies(time) {
        if (time > 300) return 20;
        if (time > 200) return 15;
        if (time > 60) return 10;
        return 5;
    }
    spawnEnemyPair(x, y, i) {
        this.lizards.get(x + 300, y - i * 3, 'lizard');
        this.lizards.get(x - 300, y + i * 3, 'lizard');
    }
    additionalSpawnsBasedOnTime(character, time) {
        switch (this.difficulty) {
            case 'EASY':
                if (time > 60) this.spawnEnemyPair(character.x, character.y + 50, 1);
                break;
            case 'NORMAL':
                if (time > 60) this.spawnEnemyPair(character.x, character.y + 50, 1);
                if (time > 200) this.spawnEnemyPair(character.x, character.y, 1);
                break;
            case 'HARD':
                if (time > 60) this.spawnEnemyPair(character.x, character.y + 50, 1);
                if (time > 200) this.spawnMultipleEnemies(character, 2);
                if (time > 300) this.spawnMultipleEnemies(character, 4);
                break;
            case 'RANDOM':
                this.spawnRandomEnemies(character, time);
                break;
        }
    }
    spawnMultipleEnemies(character, count) {
        for (let i = 0; i < count; i++) {
            this.lizards.get(character.x + 300, character.y, 'lizard');
            this.lizards.get(character.x - 300, character.y, 'lizard');
        }
    }
    spawnRandomEnemies(character, time) {
        const count = Phaser.Math.Between(1, 4);
        for (let i = 0; i < count; i++) {
            const offsetX = Phaser.Math.Between(-300, 300);
            const offsetY = Phaser.Math.Between(-100, 100);
            this.lizards.get(character.x + offsetX, character.y + offsetY, 'lizard');
        }
    }
    getSpawnDelay(difficulty) {
        switch (difficulty) {
            case 'EASY':
                return 7000;
            case 'NORMAL':
                return 5000;
            case 'HARD':
                return 3000;
            case 'RANDOM':
                return Phaser.Math.Between(1000, 10000);
            default:
                return 5000;
        }
    }
    private handleFireballWallCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        this.fireballsGroup.killAndHide(obj1)
        
    }
    
    createXp(object: Phaser.Physics.Arcade.Sprite, object2: Phaser.Physics.Arcade.Sprite, amount: number) {
        this.killCount = this.killCount+1;
        const dx = object.x ;
        const dy = object.y ;
        this.exp = this.physics.add.sprite(dx, dy, 'exp')
        this.exp.setData('amount', amount);
        this.exp.setScale(0.2)
        switch (true) {
            case amount <= 10:
                this.anims.play('exp-1', this.exp)
                break;
            case amount <= 25:
                this.anims.play('exp-2', this.exp)
                break;
            case amount <= 50:
                this.anims.play('exp-3', this.exp)
                break;
            case amount <= 100:
                this.anims.play('exp-4', this.exp)
                break;
            default:
                this.anims.play('exp-0', this.exp)
                
        }
        this.physics.add.collider(this.exp, object2, this.handleExpCharacterCollision, undefined, this);

    }
    private handleExpCharacterCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject) {
        const exp = obj1 as Phaser.Physics.Arcade.Sprite;
        const character = obj2 as Character;
        const amount = exp.getData('amount');
      character.collectExp(amount);
        exp.destroy()
    }
    handleAbilityLizardCollision(abilityGroup: Phaser.Physics.Arcade.Sprite, lizard: Phaser.GameObjects.GameObject, ability: any, index:number,character : Phaser.GameObjects.GameObject) 
    {
     
        if (ability) {
            const abilitySprite = abilityGroup as Phaser.Physics.Arcade.Sprite;
            const Character = character as Phaser.Physics.Arcade.Sprite;
            const enemy = lizard as Lizard
            const dx = abilitySprite.x - enemy.x;
            const dy = abilitySprite.y - enemy.y;
            const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
            enemy.handleDamage(dir, ability.damage*this.player.damageMultiplier);
            console.log(ability.damage*this.player.damageMultiplier)
            if (enemy.health <= 0) {
                this.lizards.killAndHide(lizard);
                this.lizards.remove(lizard);
                this.createXp(enemy,Character,enemy.exp)
            }

            this.abilityGroups[index].killAndHide(abilitySprite);
            this.abilityGroups[index].remove(abilitySprite);
           abilitySprite.destroy()
        }
    }
    private handlePlayerLizardCollision(obj1: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        const lizard = obj2 as Lizard
        const character = obj1 as Character;

        const dx = character.x - lizard.x
        const dy = character.y - lizard.y

        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)

        character.handleDamage(dir)

        sceneEvents.emit('player-health-changed', character.health, character.maxHealth)

        if (character.health <= 0)
        {
            this.playerLizardsCollider?.destroy()
        }
    }
    update(t: number, dt: number)
    {
        if (this.characters){
            this.characters.forEach((character) => {
                if (character instanceof Character) {
                    character.update(this.cursors);
                }
             
               
            });
            
        }
      
        
    }
}
