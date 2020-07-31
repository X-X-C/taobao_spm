import SpmDao from "../dao/SpmDao";
import BaseService from "./abstract/BaseService";

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
            !endTime || (filter.timestr.lte = startTime);
        }

        /**
         * 创建对应查询条件
         * @param v
         * @param k
         */
        function creat(v, k) {
            return {
                $sum: {
                    $cond: {
                        if: {
                            $eq: ["$type", k]
                        },
                        then: 1,
                        else: 0
                    }
                }
            }
        }

        let count = spmMapping(config.count, creat)
        let noRepeat = spmMapping(config.noRepeat, creat);
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
                                _id: {
                                    date: "$date",
                                    type: "$type"
                                },
                                ...count
                            }
                        },
                        {
                            $sort: {
                                "_id.date": 1
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
                                ...noRepeat
                            }
                        },
                        {
                            $sort: {
                                "_id.date": 1
                            }
                        }
                    ]
                }
            }
        ]);
        return rs;
    }
}


/**
 * 映射出相同的配置
 * @param origin    源
 * @param callback  操作
 */
function spmMapping(origin: any, callback: Function) {
    let o = {};
    for (let k in origin) {
        let v = origin[k];
        o[v] = callback(v, k);
    }
    return o;
}

