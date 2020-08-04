import App from "./src/main/App";
import SpmService from "./src/main/service/SpmService";
import BaseResult from "./src/main/dto/BaseResult";
// @ts-ignore
import * as gm from "gmtaobao";
import ErrorLogService from "./src/main/service/ErrorLogService";
import ErrorLog from "./src/main/entity/ErrorLog";
import PrizeService from "./src/main/service/PrizeService";
import UserNickService from "./src/main/service/UserNickService";
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
 * 获取配置
 * @param context
 */
// @ts-ignore
exports.selectUiTitleAndType = async (context) => {
    let data = getConfig();
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
        let userNickService = new UserNickService(context, this.tb);
        let url = await userNickService.exportUserNick();
        return BaseResult.success("成功", {
            outUrl: url
        })
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
        let prizeService = new PrizeService(context);
        let url = await prizeService.exportsWinnerData(getSelectWinnersConfig());
        return BaseResult.success("成功", {
            outUrl: url
        })
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
        let prizeService = new PrizeService(context);
        let rs = await prizeService.selectWinnerData(getSelectWinnersConfig());
        return BaseResult.success("成功", rs);
    });
}
/**
 * 导出统计数据
 * @param context
 */
// @ts-ignore
exports.exportStatistics = async (context) => {
    const app = new App(context, "exportStatistics");
    let need = {
        activityId: "",
    }
    return await app.run(async function () {
        let spmService = new SpmService(context);
        let url = await spmService.exportStatistics(getExportStatisticsConfig())
        return BaseResult.success("成功", {
            outUrl: url
        })
    }, need);
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
    return await gm.spm.spmCount(context);
};
// @ts-ignore
exports.disUser = async (context) => {
    return await gm.spm.disUser(context);
};


/**
 * 获取查询中奖信息配置
 */
function getSelectWinnersConfig() {
    let config: any = getConfig();
    config = config.selectWinnerTitleAndTypeArr.data;
    let selConfig: any = {};
    config.forEach(v => {
        //输出字段设置
        selConfig[v.type] = v.target;
    });
    return selConfig;
}


/**
 * 获取到处统计数据配置
 */
function getExportStatisticsConfig() {
    let config: any = getConfig();
    config = config.statisticsTitleAndTypeArr;
    let exConfig = {
        count: {},
        noRepeat: {},
        ext: {},
        exportData: {}
    };
    config.forEach((v) => {
        let type = v.parameter.type;
        if (v.fun === "spmCount") {
            exConfig.count[type] = v.type;
        } else if (v.fun === "disUser") {
            exConfig.noRepeat[type] = v.type;
        } else {
            exConfig.ext[type] = v.type;
        }
        exConfig.exportData[v.type] = v.title;
    });
    return exConfig;
}

/**
 * 获取配置
 * @doc https://www.yuque.com/ggikb6/towlr0/qpy01t
 */
function getConfig() {
    return {
        //统计数据配置
        "statisticsTitleAndTypeArr": [
            {
                "title": "PV",
                "type": "PV",
                "parameter": {"type": "view"},
                "fun": "spmCount"
            },
            {
                "title": "UV",
                "type": "UV",
                "parameter": {"type": "view"},
                "fun": "disUser"
            }
        ],
        //统计数据导出配置
        "exportStatistics": {
            "fixParameter": {},//固定参数，调用接口会默认传入内部所有参数
            "fun": "exportStatistics",//接口名称
            "title": "导出"
        },
        //中奖数据查询配置
        "selectWinnerTitleAndTypeArr": {
            "title": "标题", //标题
            "showTime": true,//是否需要时间查询
            "fun": "selectWinnerData",//云函数方法名，自定义
            "fixParameter": {},//固定参数，查询接口时候会默认带上内部所有参数
            "parameter": {  //动态参数，比如 type:'type值1'
                "type": {
                    "type": "radio", //单选框
                    "title": "类型标题",
                    "options": [
                        {
                            "title": "所有类型",
                            "value": ""
                        },
                    ]
                }
            },
            "data": [  //奖品展示标题
                {
                    title: "领奖状态", type: "receiveStatus", target: {
                        boolean: true,
                        field: "$receiveStatus",
                        exportKey: "领奖状态"
                    }
                },
            ]
        },
        //中奖数据导出
        "winnerTitleAndTypeArr": [
            {
                "title": "标题",
                "export": {
                    "title": "标题", //标题
                    "showTime": true,//是否需要时间查询
                    "fun": "exportWinnerData",//云函数方法名，自定义
                    "fixParameter": {},//固定参数，查询接口时候会默认带上内部所有参数
                    "parameter": {  //动态参数，比如 type:'type值1'
                        "type": {
                            "type": "radio", //单选框
                            "title": "类型标题",
                            "options": [
                                {
                                    "title": "所有类型",
                                    "value": ""
                                }
                            ]
                        }
                    }
                }
            }
        ],
        //用户昵称导出
        "userNicksExportsArr": [
            {
                "title": "标题",
                "export": {
                    "title": "标题", //标题
                    "showTime": true,//是否需要时间查询
                    "fun": "exportUserNick",//云函数方法名，自定义
                    "fixParameter": {
                        tb: "user",
                        target: {
                            field: "nick",
                            timeField: "date"
                        }
                    },//固定参数，查询接口时候会默认带上内部所有参数
                    "parameter": {  //动态参数，比如 type:'type值1'
                        "type": {
                            "type": "radio", //单选框
                            "title": "类型标题",
                            "options": [
                                {
                                    "title": "全部",
                                    "value": ""
                                }
                            ]
                        }
                    }
                }
            }
        ],
        //用户ID查询
        "behaviorTitleAndTypeArr": [
            // {
            //     "title": "标题",
            //     "export": {
            //         "title": "标题", //标题
            //         "showTime": true,//是否需要时间查询
            //         "fun": "selectInfoByNick",//云函数方法名，自定义
            //         "fixParameter": {},//固定参数，查询接口时候会默认带上内部所有参数
            //         "parameter": {  //动态参数，比如 type:'type值1'
            //             "type": {
            //                 "type": "radio", //单选框
            //                 "title": "类型标题",
            //                 "options": [
            //                     {
            //                         "title": "所有",
            //                         "value": "",
            //                         "tb": "spm"
            //                     }
            //                 ]
            //             }
            //         }
            //     }
            // }
        ]
    }
}