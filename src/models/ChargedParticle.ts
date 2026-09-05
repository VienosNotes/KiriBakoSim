import type {Vector3} from "three";
import type {KbRand} from "../utils/KbRand.ts";

interface ChargedParticle {
    position: Vector3;
    direction: Vector3;
    kineticEnergy: number;

    sampleDroplets(localSensitivity: number, movingDistance: number) : Vector3[];
}

export class Muon implements ChargedParticle {
    public direction: Vector3;
    public kineticEnergy: number;
    public position: Vector3;
    private rand: KbRand;

    private readonly dropsPerUnitDistance = 1000;
    private readonly dropsDistanceSigma = 0.01;

    constructor(direction: Vector3, kineticEnergy: number, position: Vector3, rand: KbRand) {
        this.direction = direction;
        this.kineticEnergy = kineticEnergy;
        this.position = position;
        this.rand = rand;
    }

    sampleDroplets(localSensitivity: number, movingDistance: number): Vector3[] {
        const samples = this.rand.poisson(this.dropsPerUnitDistance * localSensitivity * movingDistance);
        const ret : Vector3[] = [];

        for (let i = 0; i < samples; i++) {
            const dir = this.rand.randomDirection();
            const distance = this.rand.uniformIn(0, this.dropsDistanceSigma);
            const pos = this.position.clone().addScaledVector(dir, distance);
            ret.push(pos);
        }

        return ret;
    }
}