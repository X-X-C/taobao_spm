import BaseDao from "../../base/dao/abstract/BaseDao";

export default class SpmDao<T extends object> extends BaseDao<T> {
    constructor(context) {
        super(context, "spms");
    }
}