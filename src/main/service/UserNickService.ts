import BaseService from "./abstract/BaseService";
import BaseDao from "../dao/abstract/BaseDao";
import Utils from "../utils/Utils";
import Time from "../utils/Time";

export default class UserNickService extends BaseService<BaseDao, {}> {
    constructor(context, tb) {
        super(new BaseDao(context, tb));
    }

    async exportUserNick() {
        let target = this.data.type;
        let {startTime, endTime} = this.data;
        let {filed, timeField, groupField} = this.data.target;
        let filter: any = {
            [filed]: target
        };
        //初始化时间查询
        if (startTime || endTime) {
            filter[timeField] = {};
            !startTime || (filter[timeField].$gte = startTime);
            !endTime || (filter[timeField].$lte = endTime);
        }
        let pipe = [
            {
                $sort: {
                    [timeField]: -1
                }
            },
            {
                $match: filter
            },
            {
                $group: {
                    _id: `$${groupField}`,
                    nick: {
                        $first: filed
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    [`$${filed}`]: 1
                }
            }
        ]
        let rs = await this.aggregate(pipe);
        if (rs.length > 0) {
            let buffer = Utils.jsonToExcelBuffer(rs);
            return await this.uploadFile(buffer, `nick/${(new Time()).x}.xlsx`);
        }
        return {};
    }
}