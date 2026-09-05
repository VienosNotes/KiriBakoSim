import {Vector3} from "three";

export class KbRand {

    /**
     * 既定のコンストラクタ。
     * @param seed このインスタンスで使用するシード値。既定値は0です。
     * @param unibuf_len 正規乱数のキャッシュに使うバッファ長。既定値は65536です。
     */
    constructor(seed: number = 0, unibuf_len: number = 65536) {
        this.unibuf = [];
        this.init_unibuf(unibuf_len);
    }

    /**
     * 正規分布バッファを初期化します。
     * @param unibuf_len 生成するバッファ長。
     */
    private init_unibuf(unibuf_len: number) {

        const pad = unibuf_len % 2 == 0 ? 0 : 1;
        this.unibuf_len = unibuf_len;

        for (let i = 0; i < ((unibuf_len + pad)/2); i++) {
            const r1 = this.uniform();
            const r2 = this.uniform();

            const p = Math.sqrt(-2 * Math.log(r1))

            this.unibuf.push(p * Math.sin(2 * Math.PI * r2));
            this.unibuf.push(p * Math.cos(2 * Math.PI * r2));
        }

        if (pad == 1) {
            this.unibuf.pop();
        }
    }

    /**
     * 一様乱数をひとつ取得します。
     */
    public uniform() : number {
        return Math.random();
    }

    /**
     * 指定された範囲から一様乱数をひとつ取得します。
     * @param min 乱数の最小値。
     * @param max 乱数の最大値。
     */
    public uniformIn(min: number, max: number) {
        const width = max - min;
        return (this.uniform() * width) - (width / 2);
    }

    private unibuf_len: number = 0;
    private readonly unibuf: number[];
    private cursor : number = 0;

    /**
     * 正規乱数をひとつ取得します。
     */
    public normal() : number {
        if (this.cursor == this.unibuf_len) {
            this.cursor = 0;
        }

        return this.unibuf[this.cursor++];
    }

    /**
     * 指定された範囲にだいたい収まる正規乱数をひとつ取得します。
     * @param min 乱数の最小値。
     * @param max 乱数の最大値。
     */
    public normalIn(min: number, max: number) {
        const mean = (min + max) / 2;
        const sigma = (max - min) / 6;
        return mean + this.normal() * sigma;
    }

    /**
     * ポアソン分布から発生回数を返します。
     * @param lambda 平均発生回数。
     */
    public poisson(lambda: number): number {
        const l = Math.exp(-lambda);
        let p = 1;
        let k = 0;

        do {
            k++;
            p *= this.uniform();
        } while(p > l);

        return k -1;
    }

    public randomDirection() : Vector3 {
        // 単位球のランダムな高さ
        const z = this.uniformIn(-1, 1);
        // その高さで切った断面の円の半径
        const r = Math.sqrt(1-z*z);
        // 断面円の角度
        const longitude = this.uniformIn(0, Math.PI * 2);

        return new Vector3(
            r * Math.cos(longitude),
            r * Math.sin(longitude),
            z
        );
    }

    public logNormal(median: number, sigma: number = 0.05) {
        const mu = Math.log(median);
        return Math.exp(mu + sigma * this.normal());
    }
}