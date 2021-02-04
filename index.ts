import App from "./base/App";
// @ts-ignore
import * as gmspm from "gm-spm";
import ISpmService from "./src/ISpmService";
// @ts-ignore
exports.main = async (context) => {
    const app = new App(context, "main");
    return await app.run(async function () {
        // do...
    });
}
// @ts-ignore
exports.aggregate = async (context) => {
    const app = new App(context, "aggregate");
    let need = ["tb", "pipe"];
    return await app.run(async function () {
        app.response.data = await app.db(this.tb).aggregate(this.pipe);
    }, need);
}

// @ts-ignore
exports.update = async (context) => {
    const app = new App(context, "update");
    let need = ["tb", "filter", "options"];
    return await app.run(async function () {
        if (this.ok === true) {
            app.response.data = await app.db(this.tb).updateMany(this.filter, this.options);
        }
    }, need);
}

// @ts-ignore
exports.clean = async (context) => {
    const app = new App(context, "clean");
    return await app.run(async function () {
        if (this.ok === true) {
            app.response.data = await app.db(this.tb).deleteMany({
                _id: {
                    $ne: 0
                }
            });
        }
    }, ["tb"]);
}
// @ts-ignore
exports.spm = async (context) => {
    return await gmspm.spm.spm(context);
}

// @ts-ignore
exports.selectSpm = async (context) => {
    return await gmspm.spm.selectSpm(context);
}

// @ts-ignore
exports.selectSpmDis = async (context) => {
    return await gmspm.spm.selectSpmDis(context);
}

// @ts-ignore
exports.selectSpmDisTotal = async (context) => {
    return await gmspm.spm.selectSpmDisTotal(context);
}

// @ts-ignore
exports.selectSpmSum = async (context) => {
    return await gmspm.spm.selectSpmSum(context);
}

// @ts-ignore
exports.exportStatistics = async (context) => {
    return await gmspm.spm.exportStatistics(context);
}

// @ts-ignore
exports.selectPrize = async (context) => {
    return await gmspm.spm.selectPrize(context);
}

// @ts-ignore
exports.exportsPrize = async (context) => {
    return await gmspm.spm.exportsPrize(context);
}

// @ts-ignore
exports.exportsNick = async (context) => {
    return await gmspm.spm.exportsNick(context);
}

//行为数据查询
// @ts-ignore
exports.selectBehavior = async (context) => {
    return await gmspm.spm.selectBehavior(context);
}

// @ts-ignore
exports.defaultNickSelect = async (context) => {
    const app = new App(context, "defaultNickSelect");
    return await app.run(async function () {
        await app.getService(ISpmService).defaultNickSelect({});
    });
}

// @ts-ignore
exports.assistNickSelect = async (context) => {
    const app = new App(context, "assistNickSelect");
    return await app.run(async function () {
        await app.getService(ISpmService).assistNickSelect();
    });
};

// @ts-ignore
exports.selectUiTitleAndType = async (context) => {
    const app = new App(context, "selectUiTitleAndType");
    app.config.globalActivity = false;
    return await app.run(async function () {
        app.response.data = app.getService(ISpmService).baseData;
    });
}


