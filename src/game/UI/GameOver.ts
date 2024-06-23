import Phaser from 'phaser';
import { sceneEvents } from '../../events/EventsCenter';
import axios from 'axios';
// @ts-ignore
import AuthenticationService from '../Api/AuthenticationService.js';

export default class GameOver extends Phaser.Scene {
    private finalScore: number;
    private game:string;
    constructor() {
        super({ key: 'GameOver' });
    }

    init(data: any) {
        this.finalScore = data.finalScore;
        this.game = data.game
    }

    create() {
        this.scene.pause('Game');
        sceneEvents.emit('pause-timer');
        this.add.text(400, 500, 'GameOver')
            .setOrigin(0.5)
            .setAlign('center')
            .setStyle({ fontSize: '36px', fill: '#fff' });
        

        const authenticationService = new AuthenticationService();
        authenticationService.init().then(() => {
            const user = authenticationService.getUser();
            const token = authenticationService.getToken();
            if (user && token) {
                this.storeScore(this.finalScore, user.userid, token);
                this.storeGameScore(this.finalScore, user.userid, token);
            }
        });
    }
    async storeGameScore(finalScore :number, userId: number, token: string) {
        try {
            console.log(this.game)
           await axios.post('https://rutold.onrender.com/:10000/gameData/saveScores', {
                game: this.game,
                userid: userId,
                score: finalScore
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error storing score:', error);
        }
    }

    async storeScore(finalScore :number, userId: number, token: string) {
        try {
            const response = await axios.post('https://rutold.onrender.com/:10000/User/addCurrency', {
                user_id: userId,
                score: finalScore
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Score stored successfully:', response.data);
        } catch (error) {
            console.error('Error storing score:', error);
        }
    }
}