import App from "./src/App";
import SpmService from "./src/service/SpmService";
import PrizeService from "./src/service/PrizeService";
import BaseDao from "./src/dao/abstract/BaseDao";
import Utils from "./src/utils/Utils";
// @ts-ignore
exports.main = async (context) => {
    const app = new App(context, "main");
    return await app.run(async function () {
        // do...
    });
}

/**
 * 后期检查数据
 * @param context
 */
// @ts-ignore
exports.aggregate = async (context) => {
    const app = new App(context, "aggregate");
    app.config.needParams = {};
    let need = {tb: "", pipe: []};
    return await app.run(async function () {
        return await app.db(this.tb).aggregate(this.pipe);
    }, need);
}


/**
 * 获取配置
 * @param context
 */
// @ts-ignore
exports.selectUiTitleAndType = async (context) => {
    const app = new App(context, "selectUiTitleAndType");
    return await app.run(async function () {
        return getConfig();
    });

};


/**
 * 用户昵称查询
 * @param context
 */
// @ts-ignore
exports.selectInfoByNick = async (context) => {
    const app = new App(context, "selectInfoByNick");
    return await app.run(async function () {
        let baseDao = new BaseDao(context, this.tb);
        let rs = {
            "behaviorList": [
                {
                    "behaviorInformationArr": [],
                    "title": this.type,
                    "type": this.type
                }
            ]
        }
        let filter: any = {
            activityId: this.activityId,
            time: {
                $gte: this.startTime,
                $lte: this.endTime
            },
            type: this.type,
        }
        Utils.cleanObj(filter);
        if (this.type === "assistAll") {
            filter["data.inviter.nick"] = this.nick;
            let list = await baseDao.aggregate([
                {
                    $match: filter
                },
                {
                    $sort: {
                        time: -1
                    }
                },
                {
                    $project: {
                        _id: 0,
                        userNick: "$data.user.nick",
                        inviterNick: "$data.inviter.nick",
                        openId: "$data.user.openId",
                        msg: "$data.message",
                        time: 1
                    }
                }
            ]);
            list = list.map(v => {
                return `【${v.inviterNick}】在【${v.time}】邀请【${v.userNick}-${v.openId}】,${v.msg || "邀请成功"}`;
            });
            rs.behaviorList[0].behaviorInformationArr = list;
        }
        return rs;
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
        let baseDao = new BaseDao(context, this.tb);
        let url = "没有数据";
        return {
            outUrl: url
        }
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
        return await prizeService.exportsWinnerData(getSelectWinnersConfig());
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
        return await prizeService.selectWinnerData(getSelectWinnersConfig());
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
        return {
            outUrl: url
        }
    }, need);
}

// @ts-ignore
exports.spm = async (context) => {
    const app = new App(context, "spm");
    let need = {type: ""}
    return await app.run(async function () {
        let spmService = new SpmService(context);
        await spmService.addSpm(this.type);
    }, need);
}

// @ts-ignore
exports.spmCount = async (context) => {
    const app = new App(context, "spmCount");
    return await app.run(async function () {
        let spmService = new SpmService(context);
        let total = await spmService.spmCount();
        return {total};
    });
};
// @ts-ignore
exports.disUser = async (context) => {
    const app = new App(context, "disUser");
    return await app.run(async function () {
        let spmService = new SpmService(context);
        let total = await spmService.disUser();
        return {total};
    });
};

// @ts-ignore
exports.newUser = async (context) => {
    const app = new App(context, "newUser");
    return await app.run(async function () {
        let spmService = new SpmService(context);
        let total = await spmService.newUser();
        return {total};
    });
};

/**
 * 获取查询中奖信息配置
 */
function getSelectWinnersConfig(config = getConfig().selectWinnerTitleAndTypeArr) {
    let selConfig: any = {
        config: {},
        sort: config.sort
    };
    config.data.forEach(v => {
        //输出字段设置
        selConfig.config[v.type] = v.target;
        selConfig.config[v.type].fileId = v.type;
        selConfig.config[v.type].exportKey = v.title;
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
            type,
            exportKey: v.title,
            repeat: true
        }
        if (v.fun === "spmCount") {
            exConfig.count[v.type] = data
        } else if (v.fun === "disUser") {
            data.repeat = false;
            exConfig.noRepeat[v.type] = data
        }
    });
    return exConfig;
}

function getCustomWinnerConfig() {
    return {
        //排序
        sort: {
            "receiveStatus": -1,
        },
        "data": [  //奖品展示标题
            {
                title: "领奖状态", type: "receiveStatus", target: {
                    boolean: true,
                    field: "$receiveStatus"
                }
            },
        ]
    }
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
                            "value": "lottery"
                        },
                    ]
                }
            },
            sort: {
                "time.common": -1,
            },
            "data": [  //奖品展示标题
                {
                    title: "ID", type: "nick", target: {
                        boolean: true,
                        field: "$receiveStatus"
                    }
                },
                {
                    title: "姓名", type: "name", target: {
                        field: "$ext.name"
                    }
                },
                {
                    title: "电话", type: "tel", target: {
                        field: "$ext.tel"
                    }
                },
                {
                    title: "省", type: "province", target: {
                        field: "$ext.province"
                    }
                },
                {
                    title: "市", type: "city", target: {
                        field: "$ext.city"
                    }
                },
                {
                    title: "区", type: "district", target: {
                        field: "$ext.district"
                    }
                },
                {
                    title: "详细地址", type: "desc", target: {
                        field: "$ext.desc"
                    }
                },
                {
                    title: "领奖状态", type: "receiveStatus", target: {
                        boolean: true,
                        field: "$receiveStatus"
                    }
                },
            ]
        },
        //中奖数据导出
        "winnerTitleAndTypeArr": [
            {
                "title": "中奖数据",
                "export": {
                    "title": "类型", //标题
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
                                    "title": "抽奖",
                                    "value": "lottery"
                                },
                                {
                                    "title": "排行榜",
                                    "value": "rank"
                                },
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
                            "options": []
                        }
                    }
                }
            }
        ],
        //用户ID查询
        "behaviorTitleAndTypeArr": [
            {
                "title": "行为数据",
                "export": {
                    "title": "类型", //标题
                    "showTime": true,//是否需要时间查询
                    "fun": "selectInfoByNick",//云函数方法名，自定义
                    "fixParameter": {
                        tb: "spms"
                    },//固定参数，查询接口时候会默认带上内部所有参数
                    "parameter": {  //动态参数，比如 type:'type值1'
                        "type": {
                            "type": "radio", //单选框
                            "title": "类型标题",
                            "options": [
                                {
                                    "title": "邀请明细",
                                    "value": "assistAll"
                                }
                            ]
                        }
                    }
                }
            }
        ]
    }
}