import {Vector3} from "three";

/**
 * 360度の値からラジアンに変換して返します。
 * @param degree 360度での角度。
 */
export function toRad(degree: number) : number {
    return (degree / 360) * (2 * Math.PI);
}
