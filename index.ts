import App from "./src/main/App";
import SpmService from "./src/main/service/SpmService";
import BaseResult from "./src/main/dto/BaseResult";
// @ts-ignore
import * as gmtaobao from "gmtaobao";
import ErrorLogService from "./src/main/service/ErrorLogService";
import ErrorLog from "./src/main/entity/ErrorLog";
//请求成功是否返回参数
App.config.returnParams = true;
//每次请求都必须要的参数
App.config.needParams = {};
//发生异常后的处理
App.errorDo = async function (rs) {
    let errorLogService = new ErrorLogService(this.context);
    let errorLog = new ErrorLog(rs);
    await errorLogService.add(errorLog);
}
// @ts-ignore
exports.main = async (context) => {
    const app = new App(context, "main");
    return await app.run(async function () {
        // do...
    });
}
/**
 * 统计
 * @param context
 */
// @ts-ignore
exports.spm = async (context) => {
    const app = new App(context, "spm");
    let need = {type: ""}
    return await app.run(async function () {
        let spmService = new SpmService(context);
        await spmService.add(this.type);
        return BaseResult.success();
    }, need);
}
// @ts-ignore
exports.spmCount = async (context) => {
    return await gmtaobao.spm.spmCount(context);
};
// @ts-ignore
exports.disUser = async (context) => {
    return await gmtaobao.spm.disUser(context);
};

// @ts-ignore
exports.selectUiTitleAndType = async (context) => {
    const app = new App(context, "selectUiTitleAndType");
    return await app.run(async function () {
        let data = {
            "statisticsTitleAndTypeArr": [
                {
                    "title": "总独立访问次数",
                    "type": "PV",
                    "parameter": {"type": "view"},
                    "fun": "spmCount"
                },
                {
                    "title": "总独立访客人数",
                    "type": "UV",
                    "parameter": {"type": "view"},
                    "fun": "disUser"
                }
            ]
        }
        return BaseResult.success("成功", data);
    });
};