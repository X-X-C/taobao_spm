import SpmDao from "../dao/SpmDao";
import BaseService from "./abstract/BaseService";
import Utils from "../utils/Utils";
import Spm from "../entity/Spm";

export default class SpmService extends BaseService<SpmDao<Spm>, Spm> {
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
        spm.date = this.time().format("YYYY-MM-DD");
        spm.nick = this.nick;
        spm.type = type;
        spm.data = data || this.data;
        spm.openId = this.openId;
        spm.time = this.time().common.base;
        spm.timestamp = this.time().common.x;
        return spm;
    }

    /**
     * 新增统计
     * @param type
     * @param data
     */
    async addSpm(type: string, data: any = false): Promise<string> {
        let spm = this.bean(type, data);
        return await this.insertOne(spm);
    }

    async spmCount(): Promise<number> {
        let filter = {
            type: this.data.type,
            activityId: this.data.activityId,
            time: {
                $gte: this.data.startTime,
                $lte: this.data.endTime
            },
            ...this.data.extMatch
        }
        Utils.cleanObj(filter, true);
        return await this.count(filter);
    }

    async disUser(): Promise<number> {
        let filter = {
            type: this.data.type,
            activityId: this.data.activityId,
            time: {
                $gte: this.data.startTime,
                $lte: this.data.endTime
            },
            ...this.data.extMatch
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
        try {
            return total[0].count;
        } catch (e) {
            return 0;
        }

    }

    /**
     * 导出统计
     */
    async exportStatistics(config: any): Promise<string | false> {
        let {activityId, startTime, endTime} = this.data;
        //查询条件
        let filter: any = {
            activityId,
            time: {
                $gte: startTime,
                $lte: endTime
            }
        };
        Utils.cleanObj(filter, true);
        let exportMapping: any = config.exportMapping;
        let count: any = spmMapping(config.count)
        let noRepeat: any = spmMapping(config.noRepeat);
        //获取结果
        let rs: any = await this.aggregate([
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
        return await this.uploadFile(buffer, `day/${this.time().common.YYYYMMDD}.xlsx`)
    }
}


function spmMapping(config): any {
    let matches = {};
    for (let key in config) {
        let v = config[key];
        matches[key] = {
            $sum: {
                $cond: {
                    if: {},
                    then: 1,
                    else: 0
                }
            }
        };
        let prefix = v.repeat === true ? "$" : "$_id.";
        matches[key].$sum.$cond.if = {
            $eq: [prefix + "type", v.type]
        }
    }
    return matches;
}
