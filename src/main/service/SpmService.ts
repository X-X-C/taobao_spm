import SpmDao from "../dao/SpmDao";
import BaseService from "./abstract/BaseService";
import Utils from "../utils/Utils";

export default class SpmService extends BaseService<SpmDao, {}> {
    constructor(context) {
        super(new SpmDao(context));
    }

    /**
     * 新增统计
     * @param type
     */
    async add(type) {
        return await this.dao.add(type);
    }

    /**
     * 导出统计
     */
    async exportStatistics(config: any) {
        let {activityId, startTime, endTime} = this.data;
        //查询条件
        let filter: any = {
            activityId
        };
        //初始化时间查询
        if (startTime || endTime) {
            filter.timestr = {};
            !startTime || (filter.timestr.$gte = startTime);
            !endTime || (filter.timestr.$lte = endTime);
        }

        /**
         * 创建对应查询条件
         * @param v
         * @param k
         * @param addField
         */
        function creat(v, k, addField) {
            return {
                $sum: {
                    $cond: {
                        if: {
                            $eq: [addField, k]
                        },
                        then: 1,
                        else: 0
                    }
                }
            }
        }

        let exportData: any = config.exportData;
        let count: any = spmMapping(config.count, creat, "$type")
        let noRepeat: any = spmMapping(config.noRepeat, creat, "$_id.type");
        //TODO 额外统计
        let ext: any = config.ext;
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
            for (let key in exportData) {
                let target = exportData[key];
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

/**
 * 映射出相同的配置
 * @param origin    源
 * @param callback  操作
 * @param field
 */
function spmMapping(origin: any, callback: Function, field) {
    let o = {};
    for (let k in origin) {
        let v = origin[k];
        o[v] = callback(v, k, field);
    }
    return o;
}

