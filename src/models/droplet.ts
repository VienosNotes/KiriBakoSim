import type {Vector3} from "three";

export class Droplet {
    public position: Vector3;
    public radius: number;
    public bufferIndex: number;
    public createdAt: number;
    public expiredAt: number;
    public fallSpeed: number;

    constructor(position: Vector3, bufferIndex: number, radius: number, createdAt: number, expiredAt: number) {
        this.position = position;
        this.bufferIndex = bufferIndex;
        this.radius = radius;
        this.createdAt = createdAt;
        this.expiredAt = expiredAt;
        this.fallSpeed = 1.21 * 100000000 * radius * radius;
    }
}
