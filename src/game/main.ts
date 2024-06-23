import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Game as MainGame } from './scenes/Game';
import GameUI from "./UI/GameUI.ts";
import { Login } from './scenes/Login';
import { Register } from './scenes/Register';
import { MainMenu } from './scenes/MainMenu.ts';
import { SelectCharacter } from './scenes/SelectCharacter.ts';
import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';
import UpgradeUI from "./UI/UpgradeUI.ts";
import TimerScene from "./UI/TimerController.ts";
import GameOver from "./UI/GameOver.ts";
import { Store } from "./scenes/Store.ts";
import { CharacterStore } from "./scenes/CharacterStore.ts";
import ChatUI from "./UI/ChatUI.ts";

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 800,
    height: 824,
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Login,
        Preloader,
        Register,
        MainMenu,
        MainGame,
        SelectCharacter,
        GameUI,
        TimerScene,
        GameOver,
        UpgradeUI,
        Store,
        CharacterStore,
        ChatUI
    ],
    scale: {
        zoom: 2
    },
    plugins: {
        global: [
            {
                key: 'rexAwaitLoader',
                plugin: AwaitLoaderPlugin,
                start: true,
            },
        ],
    }
};

const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });
    window.game = game; 
    return game;
}

export default StartGame;
