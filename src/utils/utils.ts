/**
 * 360度の値からラジアンに変換して返します。
 * @param degree 360度での角度。
 */
export function toRad(degree: number) : number {
    return (degree / 360) * (2 * Math.PI);
}


export const boltzmann: number = 1.380649 * 10e-23;