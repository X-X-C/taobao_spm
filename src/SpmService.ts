import XSpmService from "../base/service/XSpmService";
import Utils from "../base/utils/Utils";
import BaseDao from "../base/dao/BaseDao";
import TopService from "../base/service/TopService";
import BaseService from "../base/service/abstract/BaseService";
import XErrorLogService from "../base/service/XErrorLogService";
import XMsgGenerate from "../base/utils/XMsgGenerate";
import BaseEntity from "../base/entity/abstract/BaseEntity";
import {before, exp} from "../base/utils/Annotation";
import {Before} from "./config/Before";
import App from "../App";

const {uuid: {v4}, formatNum, isBlank, cleanObj} = Utils;

export default class SpmService extends XSpmService<App> {
    constructor(app: App) {
        super(app)
    }

    get baseData() {
        let {spmFun} = this;
        this.spmConfig = [
            {title: "PV", type: "PV", fun: spmFun.A},
            {title: "UV", type: "PV", fun: spmFun.A},
            {title: "newUV", type: "PV", fun: spmFun.A},
        ];
        this.prizeConfig = [
            {title: "ID", type: v4(), targetField: "nick"},
            {title: "奖品名", type: v4(), targetField: "prizeName"},
            {title: "获得时间", type: v4(), targetField: "time"},
            {title: "姓名", type: v4(), targetField: "info.name"},
            {title: "电话", type: v4(), targetField: "info.tel"},
            {title: "省", type: v4(), targetField: "info.province"},
            {title: "市", type: v4(), targetField: "info.city"},
            {title: "区", type: v4(), targetField: "info.district"},
            {title: "详细地址", type: v4(), targetField: "info.desc"}
        ]
        this.prizeOptions = [
            // this.generateOptions("排行榜", "rank"),
            // this.generateOptions("抽奖", "lottery"),
        ]
        this.prizeParameter = {
            sort: {
                time: -1
            }
        }
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
                // this.generateOptions("领奖信息", "_receivePrize"),
            ],
            fun: "defaultNickSelect"
        });

        // this.addUserNickExport("所有用户ID导出", {
        //     options: [
        //         this.generateOptions("用户ID", "")
        //     ],
        //     fun: "allUserNickExport"
        // })

        this.addUserNickSelect("日志", {
            fun: "errorLogSelect",
            options: [
                this.generateOptions("错误", "error"),
                this.generateOptions("警告", "logic"),
            ]
        })

        return {
            statisticsTitleAndTypeArr: this.statisticsTitleAndTypeArr,
            exportStatistics: this.exportStatistics,
            selectWinnerTitleAndTypeArr: this.selectWinnerTitleAndTypeArr(),
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
        C: "selectSpmDisTotal",
        D: "selectSpmSum"
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

    get prizeParameter(): { sort?: any; filter?: any; [key: string]: any } {
        return this._prizeParameter;
    }

    set prizeParameter(value: { sort?: any; filter?: any; [key: string]: any }) {
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

    selectWinnerTitleAndTypeArr(
        {
            showTime = true,
            fun = ""
        } = {}
    ) {
        return {
            "title": "中奖数据查询", //标题
            "showTime": showTime,//是否需要时间查询
            "fun": fun || "selectPrize",//云函数方法名，自定义
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
        fun = <"myWinnerExport" | string>"",
        showTime = true
    } = {}) {
        this._winnerTitleAndTypeArr.push({
            title: title,
            export: {
                title: "类型", //标题
                showTime,//是否需要时间查询
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
        parameter = {} as any,
        options = [],
        fun = "",
        showTime = true
    } = {}) {
        parameter.options = options;
        this.userNicksExportsArr.push({
            title: title,
            export: {
                title: "类型", //标题
                showTime,//是否需要时间查询
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
        parameter = {} as any,
        options = [],
        fun = <"defaultNickSelect" | "assistNickSelect" | "errorLogSelect" | string>"",
        showTime = true
    } = {}) {
        parameter.options = options;
        this.behaviorTitleAndTypeArr.push({
                "title": title,
                "export": {
                    "title": "类型", //标题
                    "showTime": showTime,//是否需要时间查询
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
                "title": "类型",
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

        function baseSpm(title, type, funName, ext?) {
            title = title.replace(/[.]/g, "·");
            return {
                title: title,
                type: (() => {
                    if (["PV", "UV", "newUV"].indexOf(title) !== -1) {
                        return title;
                    } else {
                        if (funName === spmFun.B) {
                            return type + "Count";
                        } else if (funName === spmFun.C) {
                            return type + "NewCount";
                        } else if (funName === spmFun.D) {
                            return type + "Sum";
                        } else {
                            return type;
                        }
                    }
                })(),
                parameter: {"type": type, ...ext},
                fun: funName
            }
        }

        let finalData = [];
        for (let c of config) {
            finalData.push(baseSpm(c.title, c.type, c.fun, c.ext));
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
                reissueType: "point",
                showTitle: "积分补发"
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
                reissueType: "benefit",
                showTitle: "权益补发"
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
                reissueType: "mark",
                showTitle: "打标补发"
            },
            parameter: [
                {key: "nick", title: "用户昵称"},
                {key: "itemId", title: "商品ID"},
                {key: "skuId", title: "商品SKU"},
            ]
        });
    }

    addUserReissue(title, field) {
        this.addReissueConfig(title, {
            fun: "userReissue",
            fixParameter: {
                field,
                title
            },
            parameter: [
                {key: "nick", title: "用户昵称"},
                {key: "num", title: "变更数量"},
            ]
        });
    }

    /*EXPORT*/
    @before(Before.prototype.globalActivity)
    @exp()
    async defaultNickSelect({customExtMatch = <any>{}, customTitle = ""} = {}) {
        let {activityId, type, nick, startTime, endTime, page, size, extMatch, sort, options} = this.data;
        let title: string = customTitle || options.find(v => v.value === type)?.title?.replace(/(次数)|(人数)/g, "") || "未知埋点";
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
        if (nick && isBlank(customExtMatch)) {
            let userService = this.getService(BaseService);
            userService.dao.initTb("users");
            let user = await userService.get({
                activityId,
                nick
            })
            if (user) {
                filter.nick = "";
                filter.openId = user.openId;
            }
        }
        cleanObj(filter);
        if (type === "PV") {
            this.dao.initTb("spm_pv");
        }
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
                timestamp: -1,
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

    @exp()
    async errorLogSelect() {
        let {activityId, type, nick, startTime, endTime, page, size, extMatch, sort} = this.data;
        let filter = {
            activityId,
            level: type,
            nick,
            time: {
                $gte: startTime,
                $lte: endTime
            },
            ...extMatch
        }
        Utils.cleanObj(filter);
        let errorLogService = this.getService(XErrorLogService);
        let rs: any = await errorLogService.pageList(filter, {
            page,
            size,
            sort: {
                time: -1,
                ...sort
            }
        })
        this.response.data.total = rs.total;
        this.response.data.behaviorList = [
            {
                "behaviorInformationArr": [
                    ...rs.data.map(v => `异常API: 【${v.api}】，时间：【${v.time}】，用户：【${v.nick} - ${v.openId}】信息：${v.message || Utils.toJson(v.desc)}`)
                ],
                "title": `共${rs.total}条`,
                "type": type
            }
        ]
    }

    @exp()
    async assistNickSelect() {
        let {type, nick, activityId} = this.data, trulyType = "assistAll";
        let title = this.addAssistUserNickSelect().find(v => v.value === type)?.title;
        let targetOpenId;
        if (nick) {
            let userService = this.getService(BaseService);
            userService.dao.initTb("users");
            let user = await userService.get({
                activityId,
                nick
            })
            if (user) {
                targetOpenId = user.openId;
                nick = "";
            }
        }
        switch (type) {
            case "all":
                await this.defaultNickSelect({
                    customExtMatch: {
                        nick: "",
                        "data.inviter.nick": nick,
                        "data.inviter.openId": targetOpenId,
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
                        "data.inviter.openId": targetOpenId,
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
                        "data.inviter.openId": targetOpenId,
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
                        type: trulyType,
                        nick,
                        openId: targetOpenId,
                    },
                    customTitle: title
                })
                break;
            case "successInvite":
                await this.defaultNickSelect({
                    customExtMatch: {
                        type: trulyType,
                        nick,
                        openId: targetOpenId,
                        "data.code": 200,
                    },
                    customTitle: title
                })
                break;
            case "failInvite":
                await this.defaultNickSelect({
                    customExtMatch: {
                        type: trulyType,
                        nick,
                        openId: targetOpenId,
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

    @exp()
    async commonReissue() {
        let {reissueType, nick, showTitle} = this.data;
        let dao = new BaseDao<any>(this.context);
        dao.initTb("users");
        let user: any = await dao.aggregate([
            {
                $match: {
                    activityId: this.activityId,
                    nick,
                    //已授权用户
                    avatar: {
                        $ne: false
                    }
                }
            }
        ]);
        user = user[0];
        if (!user) {
            this.response.set222("查无此人");
            return;
        }
        let topService = this.getService(TopService);
        let r;
        switch (reissueType) {
            case "mark":
                let {itemId, skuId} = this.data;
                r = await topService.opentradeSpecialUsersMark({
                    skuId,
                    itemId
                }).opentradeSpecialUsersMarkInvoke();
                break;
            case "benefit":
                let {ename} = this.data;
                r = await topService.sendBenefit({
                    ename,
                    receiverOpenId: user.openId
                }).sendBenefitInvoke();
                break;
            case "point":
                let {point} = this.data;
                r = await topService.taobaoCrmPointChange({
                    num: Number(point),
                    openId: user.openId
                }).taobaoCrmPointChangeInvoke();
                break
        }
        if (r.code !== 1) {
            this.response.message = Utils.toJson(r.data);
        }
        await this.simpleSpm("_reissue").extData({
            reissueResult: r,
            desc: XMsgGenerate.baseInfo(nick, `补发：${showTitle}`, this.response.message, Utils.toJson(r.data))
        }).cover({
            openId: user.openId,
            nick: user.nick,
            mixNick: user.mixNick
        });
    }


    @exp()
    async myNickExport() {
        let {exportIndex, startTime, endTime, type, activityId, exportSize, sort, filter} = this.data;
        exportIndex = exportIndex || 0;
        exportSize = exportSize || 10000;
        let match = {
            activityId,
            time: {
                $gte: startTime,
                $lte: endTime
            },
            type,
            ...filter
        }
        Utils.cleanObj(match);
        let openIds = await this.aggregate([
            {
                $match: match
            },
            {
                $sort: {
                    timestamp: -1,
                    ...sort
                }
            },
            {
                $group: {
                    _id: "$openId"
                }
            },
            {
                $skip: exportIndex * exportSize
            },
            {
                $limit: exportSize
            }
        ])
        let total = await this.aggregate([
            {
                $match: match
            },
            {
                $group: {
                    _id: "$openId"
                }
            },
            {
                $count: "count"
            }
        ])
        total = total[0]?.count || 0;
        let userDao = new BaseDao<any>(this.context);
        userDao.initTb("users");
        let nicks = await userDao.aggregate([
            {
                $match: {
                    openId: {
                        $in: openIds.map(v => v._id)
                    },
                    avatar: {
                        $ne: false
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    "淘宝ID": "$nick"
                }
            }
        ])
        let url = "暂无数据";
        if (nicks.length > 0) {
            let buffer = Utils.jsonToExcelBuffer(nicks);
            url = await this.uploadFile(buffer, this.time().common.x + ".xlsx");
        }
        this.response.data = {
            exportEnd: ((exportIndex * exportSize) + exportSize) >= total,
            outUrl: url
        }
    }


    @exp()
    async allUserNickExport() {
        let {exportIndex, startTime, endTime, activityId, exportSize} = this.data;
        exportIndex = exportIndex || 0;
        exportSize = exportSize || 20000;
        let match = {
            activityId,
            createTime: {
                $gte: startTime,
                $lte: endTime
            },
            avatar: {
                $ne: false
            }
        }
        Utils.cleanObj(match);
        this.dao.initTb("users");
        let nicks = await this.aggregate([
            {
                $match: match
            },
            {
                $sort: {
                    createTime: -1
                }
            },
            {
                $skip: exportIndex * exportSize
            },
            {
                $limit: exportSize
            },
            {
                $project: {
                    _id: 0,
                    "用户ID": "$nick"
                }
            }
        ])
        let total = await this.aggregate([
            {
                $match: match
            },
            {
                $count: "count"
            }
        ])
        total = total[0]?.count || 0;
        let url = "暂无数据";
        if (nicks.length > 0) {
            let buffer = Utils.jsonToExcelBuffer(nicks);
            url = await this.uploadFile(buffer, this.time().common.x + ".xlsx");
        }
        this.response.data = {
            exportEnd: ((exportIndex * exportSize) + exportSize) >= total,
            outUrl: url
        }
    }


    @exp()
    async userReissue() {
        let {activityId, nick, num, field, title} = this.data;
        if (!nick || !num) {
            this.response.set222("请输入正确的参数");
            return;
        }
        num = Number(num);
        if (isNaN(num)) {
            this.response.set222("请输入正确的数字");
            return;
        }
        let db = this.app.db("users");
        let filter = {
            nick,
            activityId
        }
        let user: BaseEntity & other = await db.find(filter)
        user = user[0];
        if (!user) {
            this.response.set222("用户不存在");
            return;
        }
        user = new BaseEntity().init(user);
        //目标字段不是数字
        if (!Utils.isNumber(user.getValueFromKey(field))) {
            this.response.set222("配置错误");
            return;
        }
        let line = await db.updateMany(filter, {
            $inc: {
                [field]: num
            }
        });
        if (line > 0) {
            this.simpleSpm("_" + field)
                .extData({
                    desc: XMsgGenerate.baseInfo(user.nick, "补发" + title, title + formatNum(num), "剩余" + title + (user.getValueFromKey(field) + num)),
                    line,
                    reissue: true
                })
                .cover({
                    openId: user.openId,
                    nick: user.nick,
                    mixNick: user.mixNick
                })
            if (line !== 1) {
                await this.getService(XErrorLogService).add({
                    message: `补发影响行数超过一条，请检查。实际补发行数${line}行`
                });
            }
        }
        this.response.message = `补发成功，影响了${line}条数据`;
    }


    @exp()
    async myWinnerExport() {
        let {type, exportIndex, winnerTitleAndTypeArr, sort, filter, startTime, endTime, size} = this.data;
        let match = {
            activityId: this.activityId,
            type,
            time: {
                $gte: startTime,
                $lte: endTime
            },
            ...filter
        }
        Utils.cleanObj(match);
        let project = {
            _id: 0
        };
        winnerTitleAndTypeArr.map(v => project[v.title] = "$" + v.targetField);
        let count = await this.app.db("prizes").count(match);
        let list = await this.app.db("prizes").aggregate([
            {
                $match: match
            },
            {
                $sort: {
                    time: -1,
                    ...sort
                }
            },
            {
                $skip: exportIndex * size
            },
            {
                $limit: size
            },
            {
                $project: project
            }
        ]);
        let url = "暂无数据";
        if (list.length > 0) {
            let buffer = Utils.jsonToExcelBuffer(list);
            url = await this.uploadFile(buffer, this.time().common.x + ".xlsx");
        }
        this.response.data = {
            exportEnd: ((exportIndex * size) + size) >= count,
            outUrl: url
        }
    }

    @before(
        Before.prototype.globalActivity
    )
    @exp()
    async selectUiTitleAndType() {
        this.response.data = this.baseData;
    }

    @exp({tb: "string"})
    async createTb() {
        let {ok, tb} = this.data;
        if (ok === true) {
            this.response.data = await this.context.cloud.db.createCollection(tb)
        }
    }

    @exp({tb: "string", pipe: "array"})
    async select(): Promise<any> {
        let {pipe, tb} = this.data;
        this.response.data = await this.app.db(tb).aggregate(pipe);
    }

    @exp({tb: "string", filter: "object", options: "object"})
    async update() {
        let {ok, tb, filter, options} = this.data;
        if (ok === true) {
            this.response.data = await this.app.db(tb).updateMany(filter, options);
        }
    }

    @exp({tb: "string"})
    async clean() {
        let {tb, ok} = this.data;
        if (ok === true) {
            this.response.data = await this.app.db(tb).deleteMany({
                _id: {
                    $ne: 0
                }
            });
        }
    }

    @exp({tb: "string", data: "array"})
    async insert() {
        let {ok, tb, data} = this.data;
        if (ok === true) {
            this.response.data = await this.app.db(tb).insertMany(data);
        }
    }

}
