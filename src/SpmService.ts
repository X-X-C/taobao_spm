import App from "../base/App";
import XSpmService from "../base/service/XSpmService";
import Utils from "../base/utils/Utils";
import BaseDao from "../base/dao/BaseDao";
import TopService from "../base/service/TopService";


export default class SpmService extends XSpmService {
    constructor(app: App) {
        super(app)
    }

    get baseData() {
        let {spmFun} = this;
        this.spmConfig = [
            {title: "PV", type: "view", fun: spmFun.A},
            {title: "UV", type: "view", fun: spmFun.A},
            {title: "newUV", type: "view", fun: spmFun.A},
        ];
        this.prizeConfig = [
            {title: "ID", type: "nick", targetField: "nick"},
            {title: "奖品名", type: "prizeName", targetField: "prizeName"},
            {title: "获得时间", type: "time", targetField: "time"},
            {title: "姓名", type: "name", targetField: "info.name"},
            {title: "电话", type: "tel", targetField: "info.tel"},
            {title: "省", type: "province", targetField: "info.province"},
            {title: "市", type: "city", targetField: "info.city"},
            {title: "区", type: "district", targetField: "info.district"},
            {title: "详细地址", type: "desc", targetField: "info.desc"}
        ]
        this.prizeOptions = [
            // this.generateOptions("排行榜", "rank"),
            // this.generateOptions("抽奖", "lottery"),
        ]
        // this.prizeParameter = {}
        this.exportStatistics = <exportStatistics>{};
        this.addWinnerExport("中奖数据");
        this.addAllSpmUserNickExport();
        this.addAllSpmUserNickSelect()
        this.addAssistUserNickSelect();
        this.addUserNickSelect("通用查询", {
            options: [
                // this.generateOptions("游戏次数变更", "_gameNum"),
                // this.generateOptions("分数变更", "_score"),
                // this.generateOptions("抽奖次数变更", "_lotteryCount"),
                // this.generateOptions("抽奖信息", "_lotteryResult"),
            ],
            fun: "defaultNickSelect"
        });

        return {
            statisticsTitleAndTypeArr: this.statisticsTitleAndTypeArr,
            exportStatistics: this.exportStatistics,
            selectWinnerTitleAndTypeArr: this.selectWinnerTitleAndTypeArr,
            winnerTitleAndTypeArr: this.winnerTitleAndTypeArr,
            userNicksExportsArr: this.userNicksExportsArr,
            behaviorTitleAndTypeArr: this.behaviorTitleAndTypeArr,
            reissueArr: this.reissueArr
        }
    }

    private _statisticsTitleAndTypeArr: statisticsTitleAndTypeArr[] = [];
    private _exportStatistics: exportStatistics;
    private _winnerTitleAndTypeArr: winnerTitleAndTypeArr[] = [];
    private _userNicksExportsArr: userNicksExportsArr[] = [];
    private _behaviorTitleAndTypeArr: behaviorTitleAndTypeArr[] = [];
    private _reissueArr: reissueArr[] = [];
    private _prizeOptions: option[] = [];
    private _prizeConfig: prizeOption[] = [];
    private _prizeParameter: {
        sort?: any
        filter?: any
    };
    private spmFun: { [key: string]: spmFun } = {
        A: "selectSpm",
        B: "selectSpmDis",
        C: "selectSpmDisTotal"
    }
    private _spmConfig: generateSpmConfig[] = [];

    get spmConfig(): generateSpmConfig[] {
        return this._spmConfig;
    }

    set spmConfig(value: generateSpmConfig[]) {
        this._spmConfig = this._spmConfig.concat(value);
        this.addStatisticsData(this._spmConfig);
    }

    get prizeOptions(): option[] {
        return this._prizeOptions;
    }

    set prizeOptions(value: option[]) {
        this._prizeOptions = value;
    }

    get prizeConfig(): prizeOption[] {
        return this._prizeConfig;
    }

    set prizeConfig(value: prizeOption[]) {
        this._prizeConfig = value;
    }

    get prizeParameter(): { sort?: any; filter?: any } {
        return this._prizeParameter;
    }

    set prizeParameter(value: { sort?: any; filter?: any }) {
        this._prizeParameter = value;
    }

    get statisticsTitleAndTypeArr(): statisticsTitleAndTypeArr[] {
        return this._statisticsTitleAndTypeArr;
    }

    addStatisticsData(value: generateSpmConfig[]) {
        this._statisticsTitleAndTypeArr = this.generateSpm(value);
    }

    get exportStatistics(): exportStatistics {
        return this._exportStatistics;
    }

    set exportStatistics(value: exportStatistics) {
        this._exportStatistics = {
            fixParameter: {},
            title: "导出统计数据",
            fun: "exportStatistics",
            ...value
        };
    }

    get selectWinnerTitleAndTypeArr() {
        return {
            "title": "中奖数据查询", //标题
            "showTime": true,//是否需要时间查询
            "fun": "selectPrize",//云函数方法名，自定义
            "fixParameter": {
                winnerTitleAndTypeArr: this.prizeConfig,
                ...this.prizeParameter
            },//固定参数，查询接口时候会默认带上内部所有参数
            "parameter": {  //动态参数，比如 type:'type值1'
                "type": {
                    "type": "radio", //单选框
                    "title": "类型标题",
                    "options": [
                        ...this.prizeOptions
                    ]
                }
            },
            "data": this.prizeConfig
        }
    }

    get winnerTitleAndTypeArr(): winnerTitleAndTypeArr[] {
        return this._winnerTitleAndTypeArr;
    }

    addWinnerExport(title, {
        prizeConfig = this.prizeConfig,
        prizeOptions = this.prizeOptions,
        parameter = this.prizeParameter,
        fun = ""
    } = {}) {
        this._winnerTitleAndTypeArr.push({
            title: title,
            export: {
                title: "类型", //标题
                showTime: true,//是否需要时间查询
                fun: fun || "exportsPrize",//云函数方法名，自定义
                fixParameter: {
                    winnerTitleAndTypeArr: prizeConfig,
                    sort: {
                        time: -1
                    },
                    ...parameter
                },//固定参数，查询接口时候会默认带上内部所有参数
                parameter: {  //动态参数，比如 type:'type值1'
                    type: {
                        type: "radio", //单选框
                        title: "类型标题",
                        options: [
                            ...prizeOptions
                        ]
                    }
                }
            }
        });
    }

    get userNicksExportsArr(): userNicksExportsArr[] {
        return this._userNicksExportsArr;
    }

    addUserNickExport(title, {
        parameter = {},
        options = [],
        fun = ""
    } = {}) {
        this.userNicksExportsArr.push({
            title: title,
            export: {
                title: title, //标题
                showTime: true,//是否需要时间查询
                fun: fun || "exportsNick",//云函数方法名，自定义
                fixParameter: {
                    ...parameter
                },//固定参数，查询接口时候会默认带上内部所有参数
                parameter: {  //动态参数，比如 type:'type值1'
                    type: {
                        type: "radio", //单选框
                        title: "类型标题",
                        options: [
                            ...options
                        ]
                    }
                }
            }
        })
    }

    get behaviorTitleAndTypeArr(): behaviorTitleAndTypeArr[] {
        return this._behaviorTitleAndTypeArr;
    }

    addUserNickSelect(title, {
        parameter = {},
        options = [],
        fun = <"defaultNickSelect" | "assistNickSelect">""
    } = {}) {
        this.behaviorTitleAndTypeArr.push({
                "title": title,
                "export": {
                    "title": title, //标题
                    "showTime": true,//是否需要时间查询
                    "fun": fun || "selectBehavior",//云函数方法名，自定义
                    "fixParameter": parameter,//固定参数，查询接口时候会默认带上内部所有参数
                    "parameter": {  //动态参数，比如 type:'type值1'
                        "type": {
                            "type": "radio", //单选框
                            "title": "类型标题",
                            "options": [
                                ...options
                            ]
                        }
                    }
                }
            }
        );
    }

    get reissueArr(): reissueArr[] {
        return this._reissueArr;
    }

    addReissueConfig(title, {
        fixParameter = {},
        parameter = <generateParameterType[]>[],
        fun
    }) {
        this.reissueArr.push({
            "title": title,
            "export": {
                "showTime": true,
                "fixParameter": fixParameter,
                "parameter": this.generateReissueParameter(parameter),
                "title": "补发类型",
                "fun": fun
            }
        })
    }

    generateOptions(title, value): option {
        return {
            title,
            value
        }
    }

    generateSpm(config: any[]) {
        let {spmFun} = this;

        function baseSpm(title, type, funName) {
            return {
                title: title,
                type: (() => {
                    if (funName === spmFun.B && title !== "UV") {
                        return type + "Count";
                    } else if (funName === spmFun.C && title !== "newUV") {
                        return type + "NewCount";
                    } else {
                        return type;
                    }
                })(),
                parameter: {"type": type},
                fun: funName
            }
        }

        let finalData = [];
        for (let c of config) {
            finalData.push(baseSpm(c.title, c.type, c.fun));
        }
        return finalData;
    }

    generateReissueParameter(parameterArr: generateParameterType[]) {
        let o = {};
        for (const p of parameterArr) {
            o[p.key] = {
                type: p.type || "input",
                title: p.title
            }
        }
        return o;
    }

    addAllSpmUserNickExport() {
        let options = this.spmConfig.map(v => this.generateOptions(v.title, v.type));
        return this.addUserNickExport("行为数据", {
            options
        });
    }

    addAllSpmUserNickSelect() {
        let options = this.spmConfig.map(v => this.generateOptions(v.title, v.type));
        return this.addUserNickSelect("行为数据", {
            options,
            fun: "defaultNickSelect"
        });
    }

    addAssistUserNickSelect() {
        let options = [
            this.generateOptions("邀请明细", "all"),
            this.generateOptions("邀请成功", "success"),
            this.generateOptions("邀请失败", "fail"),
            this.generateOptions("被邀请信息", "allInvite"),
            this.generateOptions("被邀请成功", "successInvite"),
            this.generateOptions("被邀请失败", "failInvite"),
        ]
        this.addUserNickSelect("邀请明细", {
            options,
            fun: "assistNickSelect"
        });
        return options;
    }

    addPointReissue() {
        this.addReissueConfig("积分补发", {
            fun: "commonReissue",
            fixParameter: {
                reissueType: "point"
            },
            parameter: [
                {key: "nick", title: "用户昵称"},
                {key: "point", title: "补发积分数量"},
            ]
        });
    }

    addBenefitReissue() {
        this.addReissueConfig("权益补发", {
            fun: "commonReissue",
            fixParameter: {
                reissueType: "benefit"
            },
            parameter: [
                {key: "nick", title: "用户昵称"},
                {key: "ename", title: "权益ename"},
            ]
        });
    }

    addMarkReissue() {
        this.addReissueConfig("打标补发", {
            fun: "commonReissue",
            fixParameter: {
                reissueType: "mark"
            },
            parameter: [
                {key: "nick", title: "用户昵称"},
                {key: "itemId", title: "商品ID"},
                {key: "skuId", title: "商品SKU"},
            ]
        });
    }


    async defaultNickSelect({customExtMatch = <any>{}, customTitle = ""} = {}) {
        let {activityId, type, nick, startTime, endTime, page, size, extMatch, sort} = this.data;
        let title: string = customTitle || this.baseData.statisticsTitleAndTypeArr.find(v1 => v1.parameter.type === type)?.title?.replace(/(次数)|(人数)/g, "");
        let filter = {
            activityId,
            type,
            nick,
            time: {
                $gte: startTime,
                $lte: endTime
            },
            ...extMatch,
            ...customExtMatch
        }
        Utils.cleanObj(filter);
        let rs: any = await this.pageList(filter, {
            page,
            size,
            project: {
                _id: 0,
                nick: 1,
                time: 1,
                desc: "$data.desc"
            },
            sort: {
                time: -1,
                ...sort
            }
        })
        this.response.data.total = rs.total;
        this.response.data.behaviorList = [
            {
                "behaviorInformationArr": [
                    ...rs.data.map(v => v.desc ? v.desc : `【${v.nick || "未授权用户"}】在【${v.time}】触发【${title}】`)
                ],
                "title": `${title ? `【${title}】` : ""}共${rs.total}条`,
                "type": type
            }
        ]
    }

    async assistNickSelect() {
        let {type, nick} = this.data, trulyType = "assistAll";
        let title = this.addAssistUserNickSelect().find(v => v.value === type)?.title;
        switch (type) {
            case "all":
                await this.defaultNickSelect({
                    customExtMatch: {
                        nick: "",
                        "data.inviter.nick": nick,
                        type: trulyType
                    },
                    customTitle: title
                })
                break;
            case "success":
                await this.defaultNickSelect({
                    customExtMatch: {
                        nick: "",
                        "data.inviter.nick": nick,
                        "data.code": 200,
                        type: trulyType
                    },
                    customTitle: title
                })
                break;
            case "fail":
                await this.defaultNickSelect({
                    customExtMatch: {
                        nick: "",
                        "data.inviter.nick": nick,
                        type: trulyType,
                        "data.code": {
                            $ne: 200
                        }
                    },
                    customTitle: title
                })
                break;
            case "allInvite":
                await this.defaultNickSelect({
                    customExtMatch: {
                        type: trulyType
                    },
                    customTitle: title
                })
                break;
            case "successInvite":
                await this.defaultNickSelect({
                    customExtMatch: {
                        type: trulyType,
                        "data.code": 200,
                    },
                    customTitle: title
                })
                break;
            case "failInvite":
                await this.defaultNickSelect({
                    customExtMatch: {
                        type: trulyType,
                        "data.code": {
                            $ne: 200
                        }
                    },
                    customTitle: title
                })
                break;
            default:
                await this.defaultNickSelect()
        }
    }

    async commonReissue() {
        let {type, nick} = this.data;
        let dao = new BaseDao<any>(this.context);
        dao.initTb("users");
        let user = await dao.get({
            activityId: this.activityId,
            nick,
            //已授权用户
            avatar: {
                $ne: false
            }
        });
        if (!user) {
            this.response.set222("查无此人");
            return;
        }
        let topService = this.getService(TopService);
        let r;
        switch (type) {
            case "mark":
                let {itemId, skuId} = this.data;
                r = await topService.opentradeSpecialUsersMark({
                    skuId,
                    itemId
                })
                break;
            case "benefit":
                let {ename} = this.data;
                r = await topService.sendBenefit({
                    ename,
                    receiverOpenId: user.openId
                });
                break;
            case "point":
                let {point} = this.data;
                r = await topService.taobaoCrmPointChange({
                    num: Number(point),
                    openId: user.openId
                });
                break
        }
        if (r.code !== 1) {
            this.response.message = Utils.toJson(r.data);
        }
    }
}
