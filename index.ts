import App from "./base/App";
// @ts-ignore
import * as gmspm from "gm-spm";
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
    let need = ["tb", "pipe"];
    return await app.run(async function () {
        app.response.data = await app.db(this.tb).aggregate(this.pipe);
    }, need);
}

/**
 * 后期修改数据
 * @param context
 */
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

/**
 * 后期修改数据
 * @param context
 */
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

//埋点
// @ts-ignore
exports.spm = async (context) => {
    return await gmspm.spm.spm(context);
}

//查询次数统计
// @ts-ignore
exports.selectSpm = async (context) => {
    return await gmspm.spm.selectSpm(context);
}

//查询人数统计
// @ts-ignore
exports.selectSpmDis = async (context) => {
    return await gmspm.spm.selectSpmDis(context);
}

//查询新增人数统计
// @ts-ignore
exports.selectSpmDisTotal = async (context) => {
    return await gmspm.spm.selectSpmDisTotal(context);
}

//查询字段总和统计
// @ts-ignore
exports.selectSpmSum = async (context) => {
    return await gmspm.spm.selectSpmSum(context);
}

//导出统计数据
// @ts-ignore
exports.exportStatistics = async (context) => {
    return await gmspm.spm.exportStatistics(context);
}

//查询奖品数据
// @ts-ignore
exports.selectPrize = async (context) => {
    return await gmspm.spm.selectPrize(context);
}

//导出奖品
// @ts-ignore
exports.exportsPrize = async (context) => {
    return await gmspm.spm.exportsPrize(context);
}

//ID导出
// @ts-ignore
exports.exportsNick = async (context) => {
    return await gmspm.spm.exportsNick(context);
}

//行为数据查询
// @ts-ignore
exports.selectBehavior = async (context) => {
    return await gmspm.spm.selectBehavior(context);
}
/**
 * 获取配置
 * @param context
 */
// @ts-ignore
exports.selectUiTitleAndType = async (context) => {
    const app = new App(context, "selectUiTitleAndType");
    app.config.globalActivity = false;
    return await app.run(async function () {
        /**
         * PrizeConfig
         * 奖品查询和展示字段
         */
        let prizeConfig = [  //奖品展示标题
            {
                title: "ID", type: "nick", targetField: "nick"
            },
            {
                title: "奖品名", type: "prizeName", targetField: "prizeName"
            },
            {
                title: "获得时间", type: "time", targetField: "time"
            },
            {
                title: "姓名", type: "name", targetField: "ext.name"
            },
            {
                title: "电话", type: "tel", targetField: "ext.tel"
            },
            {
                title: "省", type: "province", targetField: "ext.province"
            },
            {
                title: "市", type: "city", targetField: "ext.city"
            },
            {
                title: "区", type: "district", targetField: "ext.district"
            },
            {
                title: "详细地址", type: "desc", targetField: "ext.desc"
            }
        ]
        /**
         * prizeOptions
         * 奖品类型选项
         */
        let prizeOptions = [
            {
                "title": "抽奖",
                "value": "lottery"
            },
            {
                "title": "排行榜",
                "value": "rank"
            }
        ]
        /**
         * 所有配置
         */
        app.response.data = {
            //统计数据配置
            "statisticsTitleAndTypeArr": [
                {
                    "title": "PV",
                    "type": "PV",
                    "parameter": {"type": "PV"},
                    "fun": "selectSpm"
                },
                {
                    "title": "UV",
                    "type": "UV",
                    "parameter": {"type": "PV"},
                    "fun": "selectSpmDis"
                },
                {
                    "title": "newUV",
                    "type": "newUV",
                    "parameter": {"type": "PV"},
                    "fun": "selectSpmDisTotal"
                },
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
                "fun": "selectPrize",//云函数方法名，自定义
                "fixParameter": {
                    sort: {},
                    filter: {},
                    winnerTitleAndTypeArr: prizeConfig
                },//固定参数，查询接口时候会默认带上内部所有参数
                "parameter": {  //动态参数，比如 type:'type值1'
                    "type": {
                        "type": "radio", //单选框
                        "title": "类型标题",
                        "options": [
                            ...prizeOptions
                        ]
                    }
                },
                "data": prizeConfig
            },
            //中奖数据导出
            "winnerTitleAndTypeArr": [
                {
                    "title": "中奖数据",
                    "export": {
                        "title": "类型", //标题
                        "showTime": true,//是否需要时间查询
                        "fun": "exportsPrize",//云函数方法名，自定义
                        "fixParameter": {
                            sort: {
                                //排序
                                time: -1
                            },
                            filter: {
                                //额外查询
                            },
                            winnerTitleAndTypeArr: prizeConfig
                        },//固定参数，查询接口时候会默认带上内部所有参数
                        "parameter": {  //动态参数，比如 type:'type值1'
                            "type": {
                                "type": "radio", //单选框
                                "title": "类型标题",
                                "options": [
                                    ...prizeOptions
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
                        "fun": "exportsNick",//云函数方法名，自定义
                        "fixParameter": {
                            filter: {
                                //额外查询
                            }
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
                        "fun": "selectBehavior",//云函数方法名，自定义
                        "fixParameter": {},//固定参数，查询接口时候会默认带上内部所有参数
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
    });
};
