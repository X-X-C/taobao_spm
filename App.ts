import XApp, {XBefore} from "./base/App";

export default class App extends XApp {
    constructor(context, apiName: string) {
        super(context, apiName);
        this.before = new Before(this);
    }

    before: Before;
    isWhite: boolean = false;
}

export class Before extends XBefore {
    whiteList() {
        this.addBefore = async (app: App) => {
            let isWhite = await app.db("whiteList").count({
                list: app.context.userNick
            });
            app.isWhite = isWhite > 0 && !!app.context.userNick;
        }
    }

    checkWhite() {
        this.whiteList();
        this.addBefore = async (app: App) => {
            if (!app.isWhite) {
                app.status = 0;
                app.response.success = false;
                app.response.message = "不在白名单内";
            }
        }
    }
}
