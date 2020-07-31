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
    async exportStatistics() {
        let {activityId, startTime, endTime} = this.data;
    }
}