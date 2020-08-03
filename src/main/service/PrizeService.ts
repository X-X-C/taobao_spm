import BaseService from "./abstract/BaseService";
import PrizeDao from "../dao/PrizeDao";
import Utils from "../utils/Utils";

export default class PrizeService extends BaseService<PrizeDao, {}> {
    constructor(context) {
        super(new PrizeDao(context));
    }

    /**
     * 导出中奖数据
     * @param config
     */
    async exportsWinnerData(config) {
        //配置
        let options: any = {
            all: true,
            pureReturn: true,
            exportKey: true, //是否使用倒出数据的键
        }
        //获取中奖列表
        let data: any = await this.selectWinnerData(config, options);
        if (data.length <= 0) {
            return "没有相关数据";
        }
        //将数据转换为excel buffer
        let buffer = Utils.jsonToExcelBuffer(data);
        //上传文件,返回Url
        return await this.uploadFile(buffer, "winners/" + this.time.x + ".xlsx");
    }

    /**
     * 查询中奖数据
     * @param config    查询基础配置
     * @param ext   额外查询配置
     */
    async selectWinnerData(config, ext = {}) {
        //配置
        let options = {
            all: false, //是否返回所有匹配数据
            pureReturn: false,  //是否只返回纯净的数据数组
            exportKey: false, //是否使用倒出数据的键
            ...ext
        }
        //获取参数
        let {activityId, currentPage, size, startTime, endTime, type, nick} = this.data;
        //初始化返回值
        let rs = {
            currentPage,
            list: [],
            pageTotal: 0,
            searchCount: true,
            size,
            total: 0
        }
        //构建查询条件
        let filter: any = {
            "user.activityId": activityId,
        }
        //匹配对应的中奖类型
        !type || (filter.type = type);
        //匹配对应的用户
        !nick || (filter["user.nick"] = nick);
        //初始化时间查询
        if (startTime || endTime) {
            filter["time.base"] = {};
            !startTime || (filter["time.base"].$gte = startTime);
            !endTime || (filter["time.base"].$lte = endTime);
        }
        let pipe: any = [
            {
                $match: filter
            }
        ]
        //分页
        if (currentPage && size && options.all === false) {
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
        //获取字段
        for (let key in config) {
            let v = config[key];
            //如果配置使用导出的key
            if (options.exportKey === true) {
                key = v.exportKey;
            }
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
                project[key] = v.filed;
            }
        }
        pipe.push({
            $project: project
        });
        rs.list = await this.aggregate(pipe);
        //如果只想返回数组
        if (options.pureReturn === true) {
            return rs.list;
        }
        //总数
        rs.total = await this.count(filter);
        rs.pageTotal = Math.ceil(rs.total / size);
        return rs;
    }
}