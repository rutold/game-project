export class Ability {
    constructor(public name: string, public imageUrl: string, public atlasJsonUrl: string,public character: number, public id: number, public damage: number, public walkSpeed: number, public cooldown: number, public projectileCount: number, public multiHit: boolean, public multiHitCount: number) {}

    activateAbility(character: Phaser.Physics.Arcade.Sprite, fireballs: Phaser.Physics.Arcade.Group, animationKey: string, velocity: Phaser.Math.Vector2) {
        if (!fireballs) {
            return;
        }

        const projectile = fireballs.get(character.x, character.y, this.name) as Phaser.Physics.Arcade.Sprite;
        if (!projectile) {
            return;
        }
        // @ts-ignore
        projectile.anims.load(animationKey);
        projectile.anims.play(animationKey);
        const angle = velocity.angle();
        projectile.setActive(true);
        projectile.setVisible(true);
        projectile.setRotation(angle);
        projectile.x += velocity.x * 16;
        projectile.y += velocity.y * 16;
        projectile.setVelocity(velocity.x * this.walkSpeed, velocity.y * this.walkSpeed);
    }
}
