import ErrorLogDao from "../dao/ErrorLogDao";
import ErrorLog from "../entity/ErrorLog";
import BaseService from "./abstract/BaseService";
import BaseResult from "../dto/BaseResult";

export default class ErrorLogService extends BaseService<ErrorLogDao<ErrorLog>, ErrorLog> {
    constructor(context) {
        super(new ErrorLogDao(context));
    }

    async add(response: BaseResult): Promise<string> {
        let errorLog = new ErrorLog();
        errorLog.nick = this.nick;
        errorLog.api = response.api;
        errorLog.message = response.message;
        errorLog.openId = this.openId;
        errorLog.time = this.time().common.base;
        errorLog.params = response.params;
        errorLog.desc = response.data;
        return await super.insertOne(errorLog);
    }
}