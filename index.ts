// @ts-ignore
import * as gmspm from "gm-spm";
import SpmService from "./src/SpmService";
import App from "./App";


export async function main(context) {
    const app = new App(context, "main");
    return await app.run(async function () {

    });
}


export async function createTb(context) {
    const app = new App(context, "createTb");
    app.runNeedParams = {
        tb: "string"
    }
    return await app.run(async function () {
        if (this.ok === true) {
            app.response.data = await context.cloud.db.createCollection(this.tb);
        }
    });
}


export async function aggregate(context) {
    const app = new App(context, "aggregate");
    app.runNeedParams = {
        tb: "string",
        pipe: "array"
    }
    return await app.run(async function () {
        app.response.data = await app.db(this.tb).aggregate(this.pipe);
    });
}


export async function update(context) {
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


export async function clean(context) {
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


export async function insert(context) {
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

//行为数据查询

export async function selectBehavior(context) {
    return await gmspm.spm.selectBehavior(context);
}


export async function defaultNickSelect(context) {
    const app = new App(context, "defaultNickSelect");
    app.before.globalActivity();
    return await app.run(async function () {
        await app.getService(SpmService).defaultNickSelect({});
    });
}


export async function myNickExport(context) {
    const app = new App(context, "myNickExport");
    return await app.run(async function () {
        await app.getService(SpmService).myNickExport();
    });
}


export async function assistNickSelect(context) {
    const app = new App(context, "assistNickSelect");
    return await app.run(async function () {
        await app.getService(SpmService).assistNickSelect();
    });
}


export async function commonReissue(context) {
    const app = new App(context, "commonReissue");
    app.before.checkWhite();
    return await app.run(async function () {
        await app.getService(SpmService).commonReissue();
    });
};

export async function errorLogSelect(context) {
    const app = new App(context, "errorLogSelect");
    return await app.run(async function () {
        await app.getService(SpmService).errorLogSelect();
    });
};

export async function allUserNickExport(context) {
    const app = new App(context, "allUserNickExport");
    return await app.run(async function () {
        await app.getService(SpmService).allUserNickExport();
    });
};


export async function selectUiTitleAndType(context) {
    const app = new App(context, "selectUiTitleAndType");
    app.before.globalActivity();
    app.before.whiteList();
    return await app.run(async function () {
        app.response.data = app.getService(SpmService).baseData;
        app.response.data.isWhite = app.isWhite;
    });
}


