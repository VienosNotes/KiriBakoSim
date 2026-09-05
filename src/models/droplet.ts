import type {Vector3} from "three";

class Droplet {
    public position: Vector3;
    public bufferIndex: number;

    constructor(position: Vector3, bufferIndex: number) {
        this.position = position;
        this.bufferIndex = bufferIndex;
    }
}
