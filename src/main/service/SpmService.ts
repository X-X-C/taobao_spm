import SpmDao from "../dao/SpmDao";
import BaseService from "./abstract/BaseService";
import Utils from "../utils/Utils";
import Spm from "../entity/Spm";

export default class SpmService extends BaseService<SpmDao, {}> {
    constructor(context) {
        super(new SpmDao(context));
    }

    /**
     * 获取spm bean
     * @param type
     * @param data
     */
    bean(type, data: any = false): Spm {
        let spm = new Spm();
        spm.activityId = this.activityId;
        spm.date = this.time.format("YYYY-MM-DD");
        spm.nick = this.nick;
        spm.type = type;
        spm.data = data || this.data;
        spm.openId = this.openId;
        spm.time = this.time.base;
        spm.timestamp = this.time.x;
        return spm;
    }

    /**
     * 新增统计
     * @param type
     * @param data
     */
    async addSpm(type: string, data: any = false) {
        let spm = this.bean(type, data);
        await super.add(spm);
    }

    async spmCount() {
        let filter = {
            type: this.data.type,
            activityId: this.data.activityId,
            time: {
                $gte: this.data.startTime,
                $lte: this.data.endTime
            },
            ...this.data.selectExtMatch
        }
        Utils.cleanObj(filter, true);
        return await this.count(filter);
    }

    async disUser() {
        let filter = {
            type: this.data.type,
            activityId: this.data.activityId,
            time: {
                $gte: this.data.startTime,
                $lte: this.data.endTime
            },
            ...this.data.selectExtMatch
        }
        Utils.cleanObj(filter, true);
        let total = await this.aggregate([
            {
                $match: filter
            },
            {
                $group: {
                    _id: {
                        openId: "$openId",
                    }
                }
            },
            {
                $count: "count"
            }
        ]);
        return total[0].count;
    }

    /**
     * 导出统计
     */
    async exportStatistics(config: any) {
        let {activityId, startTime, endTime} = this.data;
        //查询条件
        let filter: any = {
            activityId,
            filter: {
                time: {
                    $gte: startTime,
                    $lte: endTime
                }
            }
        };
        Utils.cleanObj(filter, true);
        let exportMapping: any = config.exportMapping;
        let count: any = spmMapping(config.count)
        let noRepeat: any = spmMapping(config.noRepeat);
        //获取结果
        let rs = await this.aggregate([
            {
                $match: filter
            },
            {
                $facet: {
                    count: [
                        {
                            $group: {
                                _id: "$date",
                                ...count
                            }
                        },
                        {
                            $sort: {
                                _id: 1
                            }
                        }
                    ],
                    noRepeat: [
                        {
                            $group: {
                                _id: {
                                    date: "$date",
                                    type: "$type",
                                    openId: "$openId"
                                },
                            }
                        },
                        {
                            $group: {
                                _id: "$_id.date",
                                ...noRepeat
                            }
                        },
                        {
                            $sort: {
                                _id: 1
                            }
                        }
                    ]
                }
            }
        ]);
        rs = rs[0];
        count = rs.count;
        noRepeat = rs.noRepeat;
        count = count.map(v => {
            let r = noRepeat.find((v1) => v1._id === v._id);
            v = {...v, ...r};
            let o = {
                "日期": v._id
            }
            for (let key in exportMapping) {
                let target = exportMapping[key];
                o[target] = v[key];
            }
            return o;
        });
        noRepeat = null;
        rs = count;
        count = null;
        if (rs.length <= 0) {
            return false;
        }
        //拿到表格buffer
        let buffer = Utils.jsonToExcelBuffer(rs);
        return await this.uploadFile(buffer, `day/${this.time.YYYYMMDD}.xlsx`)
    }
}


function spmMapping(config) {
    let matches = {};
    for (let key in config) {
        let v = config[key];
        matches[v.type] = {
            $sum: {
                $cond: {
                    if: {},
                    then: 1,
                    else: 0
                }
            }
        };
        //如果是从新定义匹配条件
        // if (v.reMatch !== false) {
        //     //自己定义匹配条件
        //     matches[v.type].$sum = v.reMatch;
        // } else {
        let matchKey;
        //如果统计数量
        if (v.repeat === true) {
            matchKey = "$type";
        }
        //如果是去重
        else {
            matchKey = "$_id.type";
        }
        matches[v.type].$sum.$cond.if = {
            $eq: [matchKey, key]
        }
        //如果有额外的匹配需求
        if (v.extMatch) {
            matches[v.type].$sum.$cond.if = {
                $and: [
                    matches[v.type].$sum.$cond.if,
                    ...v.extMatch
                ]
            }
        }
        // }
    }
    return matches;
}
