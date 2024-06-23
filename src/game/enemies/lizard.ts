import Phaser from 'phaser'
enum HealthState {
    IDLE,
    DAMAGE,
    DEAD
}

export default class Lizard extends Phaser.Physics.Arcade.Sprite {
    private target: Phaser.GameObjects.Sprite | null = null;
    private _health = 10 // initial health
    private _maxHealth = this._health // maximum health
    private healthState = HealthState.IDLE;
    private damageTime = 0;
    private _exp = 30;
    private SPEED = 50;
    private TURN_RATE = 5;
    
    
    get exp() {
        return this._exp
    }
    get health() {
        return this._health
    }

    get maxHealth() {
        return this._maxHealth
    }

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame)

        this.anims.play('lizard-idle')

        scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this)

        // Remove the random movement logic
    }

    destroy(fromScene?: boolean) {
        super.destroy(fromScene)
    }

    private handleTileCollision(go: Phaser.GameObjects.GameObject, tile: Phaser.Tilemaps.Tile) {
        if (go !== this) {
            return
        }
        // Recalculate target direction on collision if needed
    }

    preUpdate(t: number, dt: number) {
        super.preUpdate(t, dt);

        if (this.target) {
            this.moveToObject(this.target);
        }

        switch (this.healthState) {
            case HealthState.IDLE:
                break;

            case HealthState.DAMAGE:
                this.damageTime += dt;
                if (this.damageTime >= 250) {
                    this.healthState = HealthState.IDLE;
                    this.clearTint();
                    this.damageTime = 0;
                }
                break;
        }
    }

    public setTarget(target: Phaser.GameObjects.Sprite) {
        this.target = target;
    }

    private moveToObject(target: Phaser.GameObjects.Sprite) {
        const targetAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);

        if (this.rotation !== targetAngle) {
            let delta = targetAngle - this.rotation;

            if (delta > Math.PI) delta -= Math.PI * 2;
            if (delta < -Math.PI) delta += Math.PI * 2;

            if (delta > 0) {
                this.angle += this.TURN_RATE;
            } else {
         
                this.angle -= this.TURN_RATE;
            }
            
            if (Math.abs(delta) < Phaser.Math.DegToRad(this.TURN_RATE)) {
                this.rotation = targetAngle;
            }
        }

        this.setVelocity(
            Math.cos(this.rotation) * this.SPEED,
            Math.sin(this.rotation) * this.SPEED
        );
    }

    handleDamage(dir: Phaser.Math.Vector2, damage: number) {
        if (this._health <= 0 || this.healthState === HealthState.DAMAGE) {
            return;
        }
        this._health = this._health - damage;
        if (this._health > 0) {
            this.setVelocity(-dir.x, -dir.y); // Move in the opposite direction of the damage
            this.setTint(0xff0000);

            this.healthState = HealthState.DAMAGE;
            this.damageTime = 0;

            this.scene.time.delayedCall(200, () => {
                this.clearTint();
                this.healthState = HealthState.IDLE;
            });
        }
        if (this._health <= 0) {
            this.destroy()
        }
    }
}
