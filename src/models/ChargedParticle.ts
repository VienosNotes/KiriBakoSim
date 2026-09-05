import type {Vector3} from "three";

interface ChargedParticle {
    position: Vector3;
    direction: Vector3;
    kineticEnergy: number;

    sampleDroplets(localSensitivity: number, movingDistance: number) : Vector3[];
}

class Muon implements ChargedParticle {
    public direction: Vector3;
    public kineticEnergy: number;
    public position: Vector3;

    private readonly dropsPerUnitDistance = 100;
    private readonly dropsDistanceSigma = 1;

    constructor(direction: Vector3, kineticEnergy: number, position: Vector3) {
        this.direction = direction;
        this.kineticEnergy = kineticEnergy;
        this.position = position;
    }

    sampleDroplets(localSensitivity: number, movingDistance: number): Vector3[] {
        return [];
    }
}