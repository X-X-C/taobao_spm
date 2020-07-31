import BaseService from "./abstract/BaseService";
import PrizeDao from "../dao/PrizeDao";

export default class PrizeService extends BaseService<PrizeDao, {}> {
    constructor(context) {
        super(new PrizeDao(context));
    }

    /**
     * 查询中奖数据
     * @param config
     */
    async selectWinnerData(config) {
        let {activityId, currentPage, size, startTime, endTime, type, nick} = this.data;
        let rs = {
            currentPage,
            list: [],
            pageTotal: 0,
            searchCount: true,
            size,
            total: 0
        }
        let filter: any = {
            "user.activityId": activityId,
        }
        !type || (filter.type = type);
        !nick || (filter["user.nick"] = nick);
        //初始化时间查询
        if (startTime || endTime) {
            filter["time.base"] = {};
            !startTime || (filter["time.base"].$gte = startTime);
            !endTime || (filter["time.base"].lte = startTime);
        }
        let pipe: any = [
            {
                $match: filter
            }
        ]
        //分页
        if (currentPage && size) {
            pipe.push(
                {
                    $skip: (currentPage - 1) * size
                },
                {
                    $limit: size
                }
            );
        }
        //取字段
        let project = {
            _id: 0
        };
        //排除额外操作字段
        for (let key in config) {
            let v = config[key];
            if (v.boolean === true) {
                project[key] = {
                    $cond: {
                        if: {
                            $eq: [v.filed, true],
                        },
                        then: "是",
                        else: "否"
                    }
                }
            } else {
                project[key] = v;
            }
        }
        pipe.push({
            $project: project
        });
        rs.list = await this.aggregate(pipe);
        //总数
        rs.total = await this.count(filter);
        rs.pageTotal = Math.ceil(rs.total / size);
        return rs;
    }
}