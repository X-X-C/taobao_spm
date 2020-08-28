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
        //获取页数
        this.data.page = this.data.exportIndex + 1;
        let rs = {
            exportEnd: true,
            outUrl: "没有相关数据"
        }
        //配置
        let options: any = {
            pureReturn: true,
            exportKey: true, //是否使用倒出数据的键
        }
        //获取中奖列表
        let data: any = await this.selectWinnerData(config, options);
        if (data.list.length <= 0) {
            return rs;
        }
        //获取表头
        let head = [];
        for (let key in config.config) {
            head.push(config.config[key].exportKey)
        }
        //将数据转换为excel buffer
        let buffer = Utils.jsonToExcelBuffer(data.list, {header: head});
        //上传文件,返回Url
        rs.exportEnd = data.end;
        rs.outUrl = await this.uploadFile(buffer, "winners/" + this.time.x + ".xlsx");
        return rs;
    }

    /**
     * 查询中奖数据
     * @param config    查询基础配置
     * @param ext   额外查询配置
     */
    async selectWinnerData(config, ext = {}) {
        //配置
        let options = {
            pureReturn: false,  //是否只返回纯净的数据数组
            exportKey: false, //是否使用倒出数据的键
            ...ext
        }
        //获取参数
        let {activityId, currentPage, page, size, startTime, endTime, type, nick} = this.data;
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
            type,
            "user.nick": nick,
            "time.base": {
                $gte: startTime,
                $lte: endTime
            }
        }
        Utils.cleanObj(filter, true);
        let pipe: any = [
            {
                $match: filter
            },
        ]
        if (Utils.cleanObj(config.sort)) {
            pipe.push({
                $sort: config.sort
            });
        }
        //分页
        if ((currentPage || page) && size) {
            pipe.push(
                {
                    $skip: ((currentPage || page) - 1) * size
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
        let selConfig = config.config;
        //获取字段
        for (let key in selConfig) {
            let v = selConfig[key];
            //如果配置使用导出的key
            if (options.exportKey === true) {
                key = v.exportKey;
            }
            if (v.boolean === true) {
                project[key] = {
                    $cond: {
                        if: {
                            $eq: [v.field, true],
                        },
                        then: "是",
                        else: "否"
                    }
                }
            } else {
                project[key] = v.field;
            }
        }
        pipe.push(
            {
                $project: project
            }
        );
        rs.list = await this.aggregate(pipe);
        //总数
        rs.total = await this.count(filter);
        rs.pageTotal = Math.ceil(rs.total / size);
        //如果只想返回数组
        if (options.pureReturn === true) {
            return {
                list: rs.list,
                end: page >= rs.pageTotal
            }
        }
        return rs;
    }
}