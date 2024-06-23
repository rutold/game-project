// @ts-ignore
import {AbilityTemplate} from "../Templates/CharacterTemplate.ts";

export interface CharacterTemplate {
    name: string;
    health: number;
    walkSpeed: number;
    damageMultiplier: number;
    cooldownReduction: number;
    x: number;
    y: number;
    abilities: AbilityTemplate[];
    imageUrl: string;
    atlasJsonUrl: string;
    update: (cursors: Phaser.Types.Input.Keyboard.CursorKeys) => void;
}
