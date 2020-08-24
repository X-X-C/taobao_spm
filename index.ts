import App from "./src/main/App";
import SpmService from "./src/main/service/SpmService";
import BaseResult from "./src/main/dto/BaseResult";
import PrizeService from "./src/main/service/PrizeService";
import UserNickService from "./src/main/service/UserNickService";
//请求成功是否返回参数
App.config.returnParams = true;
//每次请求都必须要的参数
App.config.needParams = {};

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
    let need = {
        tb: ""
    }
    return await app.run(async function () {
        let userNickService = new UserNickService(context, this.tb);
    }, need);
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
        let rs = await prizeService.exportsWinnerData(getSelectWinnersConfig());
        return BaseResult.success("成功", rs)
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
        await spmService.addSpm(this.type);
        return BaseResult.success();
    }, need);
}

// @ts-ignore
exports.spmCount = async (context) => {
    const app = new App(context, "spmCount");
    return await app.run(async function () {
        let spmService = new SpmService(context);
        let total = await spmService.spmCount();
        return BaseResult.success("成功", {total});
    });
};
// @ts-ignore
exports.disUser = async (context) => {
    const app = new App(context, "spmCount");
    return await app.run(async function () {
        let spmService = new SpmService(context);
        let total = await spmService.disUser();
        return BaseResult.success("成功", {total});
    });
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
        selConfig[v.type].exportKey = v.title;
        selConfig[v.type].fileId = v.type;
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
        exportMapping: {}
    };
    config.forEach((v) => {
        let type = v.parameter.type;
        exConfig.exportMapping[v.type] = v.title;
        let data = {
            type: v.type,
            exportKey: v.title,
            extMatch: v.parameter.exportExtMatch || false,
            // reMatch: v.parameter.exportConfig.reMatch || false,
            repeat: true
        }
        if (v.fun === "spmCount") {
            exConfig.count[type] = data
        } else if (v.fun === "disUser") {
            data.repeat = false;
            exConfig.noRepeat[type] = data
        }
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
                "parameter": {
                    "type": "view",
                    exportExtMatch: [],
                    selectExtMatch: {}
                },
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
            "title": "中奖数据查询", //标题
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
                    title: "领奖状态", type: "$receiveStatus", target: {
                        boolean: true
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
                    "fixParameter": {
                        size: 20000
                    },//固定参数，查询接口时候会默认带上内部所有参数
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
                        size: 20000
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