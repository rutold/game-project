import Phaser from 'phaser';
import { Ability } from '../abilities/Ability';
import { CharacterTemplate } from './CharacterTemplate';
import {sceneEvents} from "../../events/EventsCenter.ts";

export enum HealthState {
    IDLE,
    DAMAGE,
    DEAD,
}

export interface AnimationMap {
    up: string;
    down: string;
    left: string;
    right: string;
}

export class Character extends Phaser.Physics.Arcade.Sprite {
    private healthState = HealthState.IDLE;
    private damageTime = 0;
    private attributes: CharacterTemplate;
    public animations: AnimationMap;
    currentlevel = 1;
    currentExp = 0;
    requiredExpforLvlUp = 20;
    private updateQueue: Queue<{ type: string, args: any[] }> = new Queue();
    private updateMeterInProgress: boolean = false;
    public fireballsGroup: Phaser.Physics.Arcade.Group;
    private canCast:boolean = true;
    isLevelingUp: boolean;
    setFireballs(fireballsGroup: Phaser.Physics.Arcade.Group)
    {
        this.fireballsGroup = fireballsGroup
    }
    get health() {
        return this.attributes.health;
    }
    get damageMultiplier(){
        return this.attributes.damageMultiplier
    }
    get abilities(){
        return this.attributes.abilities
    }

    private _maxHealth;
    get maxHealth()
    {
        return this._maxHealth
    }
    get walkSpeed() {
        return this.attributes.walkSpeed;
    }
    
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame?: string | number,
        // @ts-ignore
        attributes: CharacterTemplate,
        animations: AnimationMap,
    ) {
        super(scene, x, y, texture, frame);

        this.attributes = attributes;
        this.animations = animations;
        this._maxHealth = attributes.health;
        this.anims.play(attributes.name+'-idle-down');
    }
    loadUpgrade(upgrades:any){
    upgrades.forEach(upgrade =>{
        console.log(upgrade)
        switch (true){
            case upgrade.upgradeName.includes("damage"):
                this.attributes.damageMultiplier = this.attributes.damageMultiplier * Math.pow(upgrade.upgradeMultiplier, upgrade.tier);
                break;
            case upgrade.upgradeName.includes("cooldown"):
                if(this.attributes.cooldownReduction > 0.5){
                upgrade.upgradeMultiplier = upgrade.upgradeMultiplier/20
                }
                else if (this.attributes.cooldownReduction > 0.75){
                    upgrade.upgradeMultiplier = upgrade.upgradeMultiplier/50
                }
                if(this.attributes.cooldownReduction >= 1){
                    this.attributes.cooldownReduction = 1
                }
                else{
                    this.attributes.cooldownReduction = this.attributes.cooldownReduction + Math.pow(upgrade.upgradeMultiplier, upgrade.tier);
                }
                break;
            case upgrade.upgradeName.includes("walkspeed"):
                this.attributes.walkSpeed = this.attributes.walkSpeed * Math.pow(upgrade.upgradeMultiplier, upgrade.tier);
                break;
            case upgrade.upgradeName.includes("health"):
                this.attributes.health = this.attributes.health * Math.pow(upgrade.upgradeMultiplier, upgrade.tier);
                this._maxHealth = this._maxHealth * Math.pow(upgrade.upgradeMultiplier, upgrade.tier);
                break;
        }
    })
    }

    collectExp(expAmount: number) {
        this.currentExp += expAmount;
        let initialLevel = this.currentlevel;
        let excessExp = 0;
        while (this.currentExp >= this.requiredExpforLvlUp) {
            excessExp = this.currentExp - this.requiredExpforLvlUp;
            this.currentlevel++;
            this.currentExp = excessExp;
            this.requiredExpforLvlUp = this.requiredExpforLvlUp * 1.5;
        }
        this.updateQueue.enqueue({ type: 'updateMeter', args: [excessExp, initialLevel] });
        this.processUpdateQueue();
    }

    private async processUpdateQueue() {
        if (this.updateQueue.isEmpty() || this.updateMeterInProgress) return;

        const update = this.updateQueue.dequeue();
        if (!update) return;

        switch (update.type) {
            case 'updateMeter':
                this.updateMeterInProgress = true;
                // @ts-ignore
                await this.updateMeter(...update.args);
                this.updateMeterInProgress = false;
                this.processUpdateQueue();
                break;
            default:
                console.error(`Unknown update type: ${update.type}`);
        }
    }
    private async waitForUpgrade(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.isLevelingUp) {
                resolve();
                return;
            }

            const checkUpgrade = () => {
                if (this.isLevelingUp) {
                    console.log("check")
                    sceneEvents.once('upgrade-chosen', this.handleUpgrade, this);
                    resolve();

                }
            };
            this.scene.scene.launch('upgrade-ui')
            sceneEvents.emit("upgrade-request-sent")
            sceneEvents.once('upgrade-done', checkUpgrade);
        });
    }
    private handleUpgrade(type: String, tier:number){
        switch (true){
            case type === "damage":
                console.log(this.attributes.damageMultiplier)
                this.attributes.damageMultiplier = this.attributes.damageMultiplier + (tier/20)
                break;
            case type === "cooldown":
                if(this.attributes.cooldownReduction > 0.5){
                    tier = tier/20
                }
                else if (this.attributes.cooldownReduction > 0.75){
                    tier = tier/50
                }
                if(this.attributes.cooldownReduction >= 1){
                    this.attributes.cooldownReduction = 1
                }
                else{
                    this.attributes.cooldownReduction = this.attributes.cooldownReduction + (tier/20)     
                }
                console.log("this:"+this.attributes.cooldownReduction)
                break;
            case type === "walkspeed":
                console.log("this:" + this.attributes.walkSpeed)
                this.attributes.walkSpeed = this.attributes.walkSpeed + tier*10
                break;
            case type === "health":
                console.log("this: "+ this.attributes.damageMultiplier)
                this.attributes.health = this.attributes.health + tier;
                this._maxHealth = this._maxHealth + tier;
                break;
        }
    }
    private async updateMeter(excessExp: number, initialLevel: number) {
        return new Promise<void>(async (resolve) => {
            const staticDelay = 750;

            const executeUpdate = (delay: number, callback: () => void) => {
                return new Promise<void>((resolve) => {
                    setTimeout(() => {
                        callback();
                        resolve();
                    }, delay);
                });
            };

            if (initialLevel + 1 < this.currentlevel) {
                sceneEvents.emit('update-meter', 1, 1);
                this.isLevelingUp = true;
                await executeUpdate(800, () => {
                    sceneEvents.emit('update-meter', 0, 1);
                    if (this.currentExp > 0 && excessExp > 0 && initialLevel == this.currentlevel - 1) {
                        sceneEvents.emit('update-meter', this.currentExp, this.requiredExpforLvlUp);
                    }
                });
                await this.waitForUpgrade();

                for (let i = initialLevel + 1; i < this.currentlevel; i++) {
                    await executeUpdate(staticDelay, () => {
                        sceneEvents.emit('update-meter', 1, 1);
                        this.isLevelingUp = true;
                    });
                    await executeUpdate(800, () => {
                        sceneEvents.emit('update-meter', 0, 1);
                        if (this.currentExp > 0 && excessExp > 0 && i == this.currentlevel - 1) {
                            sceneEvents.emit('update-meter', this.currentExp, this.requiredExpforLvlUp);
                        }
                    });

                    // Wait for the player to choose an upgrade
                    await this.waitForUpgrade();
                }
            } else if (excessExp === 0 && this.currentExp === 0) {
                sceneEvents.emit('update-meter', 1, 1);
                this.isLevelingUp = true;
                await executeUpdate(800, () => {
                    sceneEvents.emit('update-meter', 0, 1);
                });
                await this.waitForUpgrade();
            } else if (this.currentExp > 0 && excessExp > 0) {
                sceneEvents.emit('update-meter', 1, 1);
                this.isLevelingUp = true;
                await executeUpdate(800, () => {
                    sceneEvents.emit('update-meter', this.currentExp, this.requiredExpforLvlUp);
                });
                await this.waitForUpgrade();
            } else if (this.currentExp > 0) {
                sceneEvents.emit('update-meter', this.currentExp, this.requiredExpforLvlUp);
            }

            resolve();
        });
    }

    handleDamage(dir: Phaser.Math.Vector2) {
        if (this.attributes.health <= 0) {
            return;
        }

        if (this.healthState === HealthState.DAMAGE) {
            return;
        }

        this.attributes.health--;

        if (this.attributes.health <= 0) {
            this.healthState = HealthState.DEAD;
            this.anims.play(this.attributes.name+'-faint');
            this.setVelocity(0, 0);
            sceneEvents.emit("character-dead")
        } else {
            this.setVelocity(dir.x, dir.y)

            this.setTint(0xff0000)

            this.healthState = HealthState.DAMAGE
            this.damageTime = 0
        }
    }

    preUpdate(t: number, dt: number) {
        super.preUpdate(t, dt);

        switch (this.healthState)
        {
            case HealthState.IDLE:
                break

            case HealthState.DAMAGE:
                this.damageTime += dt
                if (this.damageTime >= 250)
                {
                    this.healthState = HealthState.IDLE
                    this.setTint(0xffffff)
                    this.damageTime = 0
                }
                break
        }
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (this.healthState === HealthState.DAMAGE || this.healthState === HealthState.DEAD) {
            return;
        }

        if (!cursors) {
            return;
        }

        const speed = this.walkSpeed;

        let velocity = new Phaser.Math.Vector2(0, 0);
        const leftDown = cursors.left?.isDown;
        const rightDown = cursors.right?.isDown;
        const upDown = cursors.up?.isDown;
        const downDown = cursors.down?.isDown;
        
        if (leftDown) {
            this.anims.play(this.animations.left, true);
            this.setVelocity(-speed, 0);
            this.scaleX = -1;
            this.body.offset.x = 24;
            velocity.set(-1, 0);
        } else if (rightDown) {
            this.anims.play(this.animations.right, true);
            this.setVelocity(speed, 0);
            this.scaleX = 1;
            this.body.offset.x = 8;
            velocity.set(1, 0);
        } else if (upDown) {
            this.anims.play(this.animations.up, true);
            this.setVelocity(0, -speed);
            velocity.set(0, -1);
        } else if (downDown) {
            this.anims.play(this.animations.down, true);
            this.setVelocity(0, speed);
            velocity.set(0, 1);
        } else {
            const parts = this.anims.currentAnim ? this.anims.currentAnim.key.split('-') : [];
            parts[1] = 'idle';
            this.anims.play(parts.join('-'));
            this.setVelocity(0, 0);
            velocity.set(0, 0);
        }

        const parts = this.anims.currentAnim ? this.anims.currentAnim.key.split('-') : [];
        const direction = parts[2];
        let vec = new Phaser.Math.Vector2(0, 0);
        switch (direction) {
            case 'up':
                vec.y = -1;
                break;

            case 'down':
                vec.y = 1;
                break;

            default:
            case 'side':
                if (this.scaleX < 0) {
                    vec.x = -1;
                } else {
                    vec.x = 1;
                }
                break;
        }

        velocity.copy(vec);

        // added cooldown to the ability, that can be decreased with upgrades into the stat cooldownReduction
        if ( this.canCast) {
            this.useAbility(velocity);
            this.canCast = false;
            const cooldownTime = 1000 * (1 - this.attributes.cooldownReduction);
            const adjustedCooldownTime = Math.max(0, cooldownTime);
            this.scene.time.delayedCall(adjustedCooldownTime, () => {
                this.canCast = true;
            });
        }

    }
    // when the player uses activates ability it should activate all his abilities
    useAbility(velocity: Phaser.Math.Vector2) {
        for (const abilityData of this.abilities) {
            const ability = new Ability(abilityData.name, abilityData.imageUrl, abilityData.atlasJsonUrl, abilityData.character, abilityData.id, abilityData.damage, abilityData.walkSpeed, abilityData.cooldown, abilityData.projectileCount, abilityData.multiHit, abilityData.multiHitCount);
            const animationKey = `${ability.name}Animation`;
            ability.activateAbility(this, this.fireballsGroup, animationKey, velocity);
            break;
        }
    }
    
}
class Queue<T> {
    private items: T[] = [];

    enqueue(item: T): void {
        this.items.push(item);
    }

    dequeue(): T | undefined {
        return this.items.shift();
    }

    peek(): T | undefined {
        return this.items[0];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }
}