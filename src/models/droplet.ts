import type {Vector3} from "three";

export class Droplet {
    public position: Vector3;
    public bufferIndex: number;
    public createdAt: number;
    public expiredAt: number;

    constructor(position: Vector3, bufferIndex: number, createdAt: number, expiredAt: number) {
        this.position = position;
        this.bufferIndex = bufferIndex;
        this.createdAt = createdAt;
        this.expiredAt = expiredAt;
    }
}
