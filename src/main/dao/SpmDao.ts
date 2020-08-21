import BaseDao from "./abstract/BaseDao";
// @ts-ignore
import * as gm from "gmtaobao";

export default class SpmDao extends BaseDao {
    constructor(context) {
        super(context, "spms");
    }
}