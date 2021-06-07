// @ts-ignore
import * as gmspm from "gm-spm";
import SpmService from "./src/SpmService";
import App from "./App";
import {XApp} from "./base/App";

export async function spm(context) {
    return await gmspm.spm.spm(context);
}

export async function selectSpm(context) {
    return await gmspm.spm.selectSpm(context);
}

export async function selectSpmDis(context) {
    return await gmspm.spm.selectSpmDis(context);
}

export async function selectSpmDisTotal(context) {
    return await gmspm.spm.selectSpmDisTotal(context);
}

export async function selectSpmSum(context) {
    return await gmspm.spm.selectSpmSum(context);
}

export async function exportStatistics(context) {
    return await gmspm.spm.exportStatistics(context);
}

export async function selectPrize(context) {
    return await gmspm.spm.selectPrize(context);
}

export async function exportsPrize(context) {
    return await gmspm.spm.exportsPrize(context);
}

export async function exportsNick(context) {
    return await gmspm.spm.exportsNick(context);
}

export async function selectBehavior(context) {
    return await gmspm.spm.selectBehavior(context);
}

const modules = [SpmService];
for (let entry of Object.entries(XApp.exports)) {
    // @ts-ignore
    exports[entry[0]] = async (context) => {
        const app = new App(context, entry[0]);
        app.runNeedParams = entry[1].params || {};
        if (!entry[1].needGlobalParam) {
            app.globalNeedParams = {};
        }
        entry[1].before.forEach(v => v.call(app.before))
        return await app.run(async function () {
            await app.getService(entry[1].constructor)[entry[0]]();
        });
    }
}
