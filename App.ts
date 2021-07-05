import XApp from "./base/App";
import {Before} from "./src/config/Before";

export default class App extends XApp {
    isWhite: boolean = false;
    before: Before = new Before(this);
}
