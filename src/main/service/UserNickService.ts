import BaseService from "./abstract/BaseService";
import BaseDao from "../dao/abstract/BaseDao";

export default class UserNickService extends BaseService<BaseDao, {}> {
    constructor(context, tb) {
        super(new BaseDao(context, tb));
    }

    /**
     * 用户昵称导出
     */
    async exportUserNick() {
    }
}