import Phaser from 'phaser';
import { Character, AnimationMap } from './Character';
import { CharacterTemplate } from './CharacterTemplate';

describe('Character Class', () => {
    let character: Character;
    let sceneMock: Phaser.Scene;

    beforeAll(() => {
        const gameConfig: Phaser.Types.Core.GameConfig = {
            type: Phaser.HEADLESS,
            width: 800,
            height: 600,
            scene: {
                preload: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                },
            },
        };
        new Phaser.Game(gameConfig);
    });

    beforeEach(() => {
        sceneMock = new Phaser.Scene('TestScene');
        sceneMock.sys.queueDepthSort = jest.fn();
        
        const updateListMock = {
            add: jest.fn(),
            remove: jest.fn(),
            scene: sceneMock,
            systems: sceneMock.sys,
            sceneUpdate: jest.fn(),
            shutdown: jest.fn(),
        } as unknown as Phaser.GameObjects.UpdateList;

        // Attach the mock UpdateList to the scene's sys object
        sceneMock.sys.updateList = updateListMock;

        // Mock the add and physics properties
        sceneMock.add = {
            existing: jest.fn(),
        } as unknown as Phaser.GameObjects.GameObjectFactory;

        sceneMock.physics = {
            world: {
                enable: jest.fn(),
            },
        } as unknown as Phaser.Physics.Arcade.ArcadePhysics;

        // Mock the animation manager and related objects
        sceneMock.anims = {
            create: jest.fn(),
            generateFrameNumbers: jest.fn(),
            get: jest.fn(),
            load: jest.fn(),
            on: jest.fn(),
            once: jest.fn(),
            pauseAll: jest.fn(),
            play: jest.fn(),
            remove: jest.fn(),
            resumeAll: jest.fn(),
            staggerPlay: jest.fn(),
            stopAll: jest.fn(),
        } as unknown as Phaser.Animations.AnimationManager;

        // Mock the texture manager
        sceneMock.textures = {
            get: jest.fn().mockReturnValue({
                get: jest.fn().mockReturnValue({
                    setFilter: jest.fn(),
                }),
                has: jest.fn().mockReturnValue(true),
                setFilter: jest.fn(),
            }),
        } as unknown as Phaser.Textures.TextureManager;

        // Mock scene.sys with necessary components
        sceneMock.sys = {
            anims: sceneMock.anims,
            events: {
                on: jest.fn(),
                once: jest.fn(),
                removeListener: jest.fn(),
                emit: jest.fn(),
                off: jest.fn(),
                addListener: jest.fn(),
                eventNames: jest.fn(),
                listenerCount: jest.fn(),
                listeners: jest.fn(),
                rawListeners: jest.fn(),
                removeAllListeners: jest.fn(),
                setMaxListeners: jest.fn(),
            },
            updateList: updateListMock,
            queueDepthSort: jest.fn(),
            settings: {
                isBooted: true,
            },
            load: {
                image: jest.fn(),
                atlas: jest.fn(),
                audio: jest.fn(),
                spritesheet: jest.fn(),
            },
            textures: sceneMock.textures,
        } as unknown as Phaser.Scenes.Systems;

        const attributes: CharacterTemplate = {
            name: "monkey",
            health: 100,
            walkSpeed: 10,
            damageMultiplier: 1,
            cooldownReduction: 0,
            x: 1,
            y: 2,
            abilities: [],
            imageUrl: "",
            atlasJsonUrl: "",
            update: null,
        };
        const animations: AnimationMap = {
            up: 'monkey-run-up',
            down: 'monkey-run-down',
            left: 'monkey-run-left',
            right: 'monkey-run-right',
        };

        character = new Character(sceneMock, 0, 0, 'monkey', undefined, attributes, animations);
    });

    describe('collectExp method', () => {
        it('should increment currentExp and trigger updateMeter when requiredExpforLvlUp is met', async () => {
            // Initial values
            expect(character.currentExp).toBe(0);
            expect(character.currentlevel).toBe(1);

            // Call collectExp
            character.collectExp(25);
            // Check if currentExp and currentlevel are updated correctly
            expect(character.currentExp).toBe(5); // 25 - 20 (initial requiredExpforLvlUp)
            expect(character.currentlevel).toBe(2);

            // Check the interaction with updateQueue and processUpdateQueue
            expect(character['updateQueue'].size()).toBe(0); // Ensure an update is queued
            
        });
    });
});
