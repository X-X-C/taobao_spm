import App from "./base/App";
// @ts-ignore
import * as gmspm from "gm-spm";
import SpmService from "./src/SpmService";
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
    app.runNeedParams = {
        tb: "string",
        pipe: "array"
    }
    return await app.run(async function () {
        app.response.data = await app.db(this.tb).aggregate(this.pipe);
    });
}

// @ts-ignore
exports.update = async (context) => {
    const app = new App(context, "update");
    app.runNeedParams = {
        tb: "string",
        filter: "object",
        options: "object"
    }
    return await app.run(async function () {
        if (this.ok === true) {
            app.response.data = await app.db(this.tb).updateMany(this.filter, this.options);
        }
    });
}

// @ts-ignore
exports.clean = async (context) => {
    const app = new App(context, "clean");
    app.runNeedParams = {
        tb: "string"
    }
    return await app.run(async function () {
        if (this.ok === true) {
            app.response.data = await app.db(this.tb).deleteMany({
                _id: {
                    $ne: 0
                }
            });
        }
    });
}


// @ts-ignore
exports.insert = async (context) => {
    const app = new App(context, "clean");
    app.runNeedParams = {
        tb: "string",
        data: "array"
    }
    return await app.run(async function () {
        if (this.ok === true) {
            app.response.data = await app.db(this.tb).insertMany(this.data);
        }
    });
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
        await app.getService(SpmService).defaultNickSelect({});
    });
}

// @ts-ignore
exports.assistNickSelect = async (context) => {
    const app = new App(context, "assistNickSelect");
    return await app.run(async function () {
        await app.getService(SpmService).assistNickSelect();
    });
};

// @ts-ignore
exports.commonReissue = async (context) => {
    const app = new App(context, "commonReissue");
    return await app.run(async function () {
        await app.getService(SpmService).commonReissue();
    });
};

// @ts-ignore
exports.selectUiTitleAndType = async (context) => {
    const app = new App(context, "selectUiTitleAndType");
    app.set.globalActivity;
    return await app.run(async function () {
        app.response.data = app.getService(SpmService).baseData;
        app.response.data.isWhite = !!app.db("whiteList").count({
            list: context.userNick
        });
    });
}


