export function initDev() {
    if (!import.meta.env.DEV) {
        return;
    }

    //以降はデバッグ時の設定

    document.getElementById('dev-tag')?.classList.remove("invisible");


}