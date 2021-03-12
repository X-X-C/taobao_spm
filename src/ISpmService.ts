import BaseService from "../base/service/abstract/BaseService";
import Spm from "../base/entity/Spm";
import App from "../base/App";
import Utils from "../base/utils/Utils";
import TopService from "../base/service/TopService";
import BaseDao from "../base/dao/BaseDao";


type generateParameterType = { key: string, type?: string, title: string }

export default class ISpmService extends BaseService<Spm> {
    constructor(app: App) {
        super("spm", app);
    }

    get baseData() {
        let {spmFun} = this;
        this.spmConfig = [
            {title: "", type: "", fun: spmFun.A}
        ]
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
            this.generateOptions("排行榜", "rank"),
            this.generateOptions("抽奖", "lottery"),
        ]
        // this.prizeExtFilter = {};
        // this.prizeSort = {};
        this.addWinnerExport("中奖数据");
        this.addAllSpmUserNickExport();
        this.addAllSpmUserNickSelect()
        this.addAssistUserNickSelect();

        return {
            "statisticsTitleAndTypeArr": this.spmConfig,
            "exportStatistics": this.spmExportConfig,
            "selectWinnerTitleAndTypeArr": this.winnerSelectConfig,
            "winnerTitleAndTypeArr": this.exportWinnerConfig,
            "userNicksExportsArr": this.userNickExportConfig,
            "behaviorTitleAndTypeArr": this.userNickSelectConfig,
            "reissueArr": this.reissueConfig
        }
    }

    spmFun = {
        A: "selectSpm",
        B: "selectSpmDis",
        C: "selectSpmDisTotal"
    };

    _: any = {
        prizeOptions: [],
        prizeConfig: [],
        spmConfig: [
            {
                "title": "PV",
                "type": "PV",
                "parameter": {"type": "view"},
                "fun": this.spmFun.A
            },
            {
                "title": "UV",
                "type": "UV",
                "parameter": {"type": "view"},
                "fun": this.spmFun.B
            },
            {
                "title": "newUV",
                "type": "newUV",
                "parameter": {"type": "view"},
                "fun": this.spmFun.C
            }
        ],
        prizeFixParameter: {},
        exportWinnerConfig: [],
        userNicksExportConfig: [],
        userNickSelectConfig: [],
        reissueConfig: []
    }

    get spmConfig() {
        return this._.spmConfig;
    }

    get prizeOptions() {
        return this._.prizeOptions;
    }

    get prizeConfig() {
        return this._.prizeConfig;
    }

    get prizeParameter() {
        return this._.prizeFixParameter;
    }

    get exportWinnerConfig() {
        return this._.exportWinnerConfig;
    }

    get userNickSelectConfig() {
        return this._.userNickSelectConfig;
    }

    get userNickExportConfig() {
        return this._.userNicksExportConfig;
    }

    get reissueConfig() {
        return this._.reissueConfig;
    }

    set prizeParameter(v) {
        this._.prizeFixParameter = v;
    }

    set prizeOptions(v) {
        this._.prizeOptions = v;
    }

    set prizeConfig(v) {
        this._.prizeConfig = v;
    }

    set prizeSort(v) {
        this._.prizeFixParameter.sort = v;
    }

    set prizeExtFilter(v) {
        this._.prizeFixParameter.filter = v;
    }

    set spmConfig(config: any[]) {
        this._.spmConfig.push(...this.generateSpm(config));
    }

    set exportWinnerConfig(v) {
        this._.exportWinnerConfig.push(v);
    }

    set userNickExportConfig(v) {
        this._.userNicksExportConfig.push(v);
    }

    set userNickSelectConfig(v) {
        this._.userNickSelectConfig.push(v);
    }

    set reissueConfig(v) {
        this._.reissueConfig.push(v);
    }

    get spmExportConfig() {
        return {
            "fixParameter": {},//固定参数，调用接口会默认传入内部所有参数
            "fun": "exportStatistics",//接口名称
            "title": "导出"
        }
    }

    get winnerSelectConfig() {
        return {
            "title": "中奖数据查询", //标题
            "showTime": true,//是否需要时间查询
            "fun": "selectPrize",//云函数方法名，自定义
            "fixParameter": {
                // sort: {},
                // filter: {},
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

    generateSpm(config: any[]) {
        let {spmFun} = this;

        function baseSpm(title, type, funName) {
            return {
                title: title,
                type: (() => {
                    if (funName === spmFun.B) {
                        return type + "Count";
                    } else if (funName === spmFun.C) {
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

    generateOptions(title, value) {
        return {
            title,
            value
        }
    }

    generateParameter(parameterArr: generateParameterType[]) {
        let o = {};
        for (const p of parameterArr) {
            o[p.key] = {
                type: p.type || "input",
                title: p.title
            }
        }
        return o;
    }

    addWinnerExport(title, {
        prizeConfig = this.prizeConfig,
        prizeOptions = this.prizeOptions,
        parameter = this.prizeParameter,
        fun = ""
    } = {}) {
        let p = {
            "title": title,
            "export": {
                "title": "类型", //标题
                "showTime": true,//是否需要时间查询
                "fun": fun || "exportsPrize",//云函数方法名，自定义
                "fixParameter": {
                    winnerTitleAndTypeArr: prizeConfig,
                    ...parameter
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
        this.exportWinnerConfig = p;
        return p;
    }

    addUserNickExport(title, {
        parameter = {},
        options = [],
        fun = ""
    } = {}) {
        let e = {
            "title": title,
            "export": {
                "title": title, //标题
                "showTime": true,//是否需要时间查询
                "fun": fun || "exportsNick",//云函数方法名，自定义
                "fixParameter": {
                    // filter: {
                    //     //额外查询
                    // }
                    ...parameter
                },//固定参数，查询接口时候会默认带上内部所有参数
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
        this.userNickExportConfig = e;
        return e;
    }

    addUserNickSelect(title, {
        parameter = {},
        options = [],
        fun = <"defaultNickSelect" | "assistNickSelect">""
    } = {}) {
        let u = {
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
        this.userNickSelectConfig = u;
        return u;
    }

    addReissueConfig(title, {
        fixParameter = {},
        parameter = <generateParameterType[]>[],
        fun
    }) {
        let r = {
            "title": title,
            "export": {
                "showTime": true,
                "fixParameter": fixParameter,
                "parameter": this.generateParameter(parameter),
                "title": "补发类型",
                "fun": fun
            }
        }
        this.reissueConfig = r;
        return r;
    }

    addAllSpmUserNickSelect() {
        let options = this.spmConfig.map(v => this.generateOptions(v.title, v.parameter.type));
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

    addAllSpmUserNickExport() {
        let options = this.spmConfig.map(v => this.generateOptions(v.title, v.parameter.type));
        return this.addUserNickExport("行为数据", {
            options
        });
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

    async defaultNickSelect({customExtMatch = <any>{}, customTitle = ""}) {
        let {activityId, type, nick, startTime, endTime, page, size, extMatch} = this.data;
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
            }
        })
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
                await this.defaultNickSelect({})
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
                r = await topService.opentradeSpecialUsersMark(skuId, itemId, {
                    open_user_ids: user.openId
                })
                break;
            case "benefit":
                let {ename} = this.data;
                r = await topService.sendBenefit(ename, user.openId);
                break;
            case "point":
                let {point} = this.data;
                r = await topService.taobaoCrmPointChange(Number(point), user.openId);
                break
        }
        if (r.code !== 1) {
            this.response.message = Utils.toJson(r.data);
        }
    }
}
