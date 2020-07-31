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
 * 配置
 * @param context
 * @doc https://www.yuque.com/ggikb6/towlr0/qpy01t
 */
// @ts-ignore
exports.selectUiTitleAndType = async (context) => {
    let data = {
        //统计数据配置
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
        ],
        //统计数据导出配置
        "exportStatistics": {
            // "fixParameter": {},//固定参数，调用接口会默认传入内部所有参数
            // "fun": "exportStatistics",//接口名称
            // "title": "导出"
        },
        //中奖数据查询配置
        "selectWinnerTitleAndTypeArr": {
            // "title": "标题", //标题
            // "showTime": true,//是否需要时间查询
            // "fun": "selectWinnerData",//云函数方法名，自定义
            // "fixParameter": {},//固定参数，查询接口时候会默认带上内部所有参数
            // "parameter": {  //动态参数，比如 type:'type值1'
            //     "type": {
            //         "type": "radio", //单选框
            //         "title": "类型标题",
            //         "options": [
            //             {
            //                 "title": "标题1",
            //                 "value": "type值1"
            //             },
            //         ]
            //     }
            // },
            // "data": [  //奖品展示标题
            //     {title: "用户昵称", type: "nick"}
            // ]
        },
        //中奖数据导出
        "winnerTitleAndTypeArr": [
            // {
            //     "title": "标题",
            //     "export": {
            //         "title": "标题", //标题
            //         "showTime": true,//是否需要时间查询
            //         "fun": "exportWinnerData",//云函数方法名，自定义
            //         "fixParameter": {},//固定参数，查询接口时候会默认带上内部所有参数
            //         "parameter": {  //动态参数，比如 type:'type值1'
            //             "type": {
            //                 "type": "radio", //单选框
            //                 "title": "类型标题",
            //                 "options": [
            //                     {
            //                         "title": "标题1",
            //                         "value": "type值1"
            //                     }
            //                 ]
            //             }
            //         }
            //     }
            // }
        ],
        //用户昵称导出
        "userNicksExportsArr": [
            // {
            //     "title": "标题",
            //     "export": {
            //         "title": "标题", //标题
            //         "showTime": true,//是否需要时间查询
            //         "fun": "exportUserNick",//云函数方法名，自定义
            //         "fixParameter": {},//固定参数，查询接口时候会默认带上内部所有参数
            //         "parameter": {  //动态参数，比如 type:'type值1'
            //             "type": {
            //                 "type": "radio", //单选框
            //                 "title": "类型标题",
            //                 "options": [
            //                     {
            //                         "title": "标题1",
            //                         "value": "type值1"
            //                     }
            //                 ]
            //             }
            //         }
            //     }
            // }
        ],
        //用户ID查询
        "behaviorTitleAndTypeArr": [
            //     {
            //         "title": "标题",
            //         "export": {
            //             "title": "标题", //标题
            //             "showTime": true,//是否需要时间查询
            //             "fun": "selectInfoByNick",//云函数方法名，自定义
            //             "fixParameter": {},//固定参数，查询接口时候会默认带上内部所有参数
            //             "parameter": {  //动态参数，比如 type:'type值1'
            //                 "type": {
            //                     "type": "radio", //单选框
            //                     "title": "类型标题",
            //                     "options": [
            //                         {
            //                             "title": "标题1",
            //                             "value": "type值1"
            //                         }
            //                     ]
            //                 }
            //             }
            //         }
            //     }
        ]
    }
    return BaseResult.success("成功", data);
};



/**
 * 用户昵称查询
 * @param context
 */
// @ts-ignore
exports.selectInfoByNick = async (context) => {
    const app = new App(context, "selectInfoByNick");
    return await app.run(async function () {
        // do...
    });
}

/**
 * 导出用户昵称
 * @param context
 */
// @ts-ignore
exports.exportUserNick = async (context) => {
    const app = new App(context, "exportUserNick");
    return await app.run(async function () {
        // do...
    });
}

/**
 * 导出中奖数据
 * @param context
 */
// @ts-ignore
exports.exportWinnerData = async (context) => {
    const app = new App(context, "exportWinnerData");
    return await app.run(async function () {
        // do...
    });
}

/**
 * 查询中奖数据
 * @param context
 */
// @ts-ignore
exports.selectWinnerData = async (context) => {
    const app = new App(context, "selectWinnerData");
    return await app.run(async function () {
        // do...
    });
}
/**
 * 导出统计数据
 * @param context
 */
// @ts-ignore
exports.exportStatistics = async (context) => {
    const app = new App(context, "exportStatistics");
    return await app.run(async function () {
        // do...
    });
}

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