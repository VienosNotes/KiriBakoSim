import {Vector3} from "three";


export function toRad(degree: number) : number {
    return (degree / 360) * (2 * Math.PI);
}

export function rnd(min: number, max: number)
{
    const width = max - min;
    return (Math.random() * width) - (width / 2);
}

export function rndAngle() : Vector3 {
    // 単位球のランダムな高さ
    const z = rnd(-1, 1);
    // その高さで切った断面の円の半径
    const r = Math.sqrt(1-z*z);
    // 断面円の角度
    const longitude = rnd(0, Math.PI * 2);

    return new Vector3(
        r * Math.cos(longitude),
        r * Math.sin(longitude),
        z
    );
}