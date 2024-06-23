import Phaser from "phaser";
import {sceneEvents} from "../../events/EventsCenter.ts";

export default class TimerScene extends Phaser.Scene {
    private label: Phaser.GameObjects.Text;
    private timer;
    private startTime: number;
    constructor() {
        super("TimerScene");
    }

    create() {
        this.label = this.add.text(16, 16, "Time: 00:00", {
            font: "24px Roboto",
            fill: "#E43AA4",
            stroke: "#000",
            strokeThickness: 4,
        });
        this.startTime = this.time.now;
      this.time.paused = false
        sceneEvents.once('pause-timer', this.pauseTime, this)
        sceneEvents.once('unpause-timer',this.unpauseTime,this)
        sceneEvents.once('time-request', this.answerRequest, this)
        this.timer = this.time.addEvent({
                delay: 86400000,
                paused: false    
            });
        
    }
    private answerRequest(){
        sceneEvents.emit('time-request-answer', this.timer, this)
    }
    pauseTime(){
         this.timer.paused = true
    }
    unpauseTime(){
        this.timer.paused = false
    }
    update(time: number) {
        if(!this.time.paused){
            const elapsed = this.timer.getElapsedSeconds().toFixed(1)
            const minutes = Math.floor(elapsed / 60);
            const seconds = Math.floor((elapsed % 60));
            this.label.text = `Time: ${padZero(minutes)}:${padZero(seconds)}`;
        }

    }
}

function padZero(value: number): string {
    return (value < 10 ? '0' : '') + value;
}