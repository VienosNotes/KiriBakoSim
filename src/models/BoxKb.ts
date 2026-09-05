import {Vector3} from "three";
import {smoothstep} from "three/src/math/MathUtils.js";

export class BoxKb {
    public width: number;
    public height: number;
    public depth: number;
    public norm: number;

    constructor(width: number, height: number, depth: number) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.norm = new Vector3(width, height, depth).length();
    }

    public getLocalSensitivity(position: Vector3): number {
        if (!this.contains(position)) {
            return 0;
        }

        const y = (position.y + (this.height /2)) / this.height;
        return this.sensitivityCurve(y);
    }

    private sensitivityCurve(y: number): number {
        const lower = smoothstep(y, 0.1, 0.3);
        const upper = 1 - smoothstep(y, 0.4, 0.6);
        return lower * upper;
    }

    /**
     * 与えられた座標がこの霧箱の内側にあるかどうかを判定します、
     * @param position
     */
    public contains(position: Vector3): boolean {
        return !(Math.abs(position.x) >= this.width / 2 ||
            Math.abs(position.y) >= this.height / 2 ||
            Math.abs(position.z) >= this.depth / 2);
    }


}