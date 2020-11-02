// "../util/commonUtils" works in node when the working dir is the same as the .js file,
// but when launching nw.js:
// - In node context, the default current dir is the one from the .js file
// - In browser context (ie: when using <script src=...>, the current dir is the one from the html file
// it sucks that there is no easy way for TS to convert this path so that Node.js can understand it
// https://www.reddit.com/r/typescript/comments/6nl2m2/project_and_relative_path_hell/

import * as commonUtils from "../manager/commonUtils";
import {AbstractController} from "./AbstractController";
import {StorageManager} from "../manager/storage/StorageManager";
import {LogManager} from "../manager/log/LogManager";
import {ConfigManager} from "../manager/config/ConfigManager";
import {IAPIManagerAsync} from "../manager/api/IAPIManagerAsync";
import {APIManagerAsyncGot} from "../manager/api/APIManagerAsyncGot";
declare var nw: any;

// https://medium.freecodecamp.org/javascript-modules-a-beginner-s-guide-783f7d7a5fcc
export class LoginController extends AbstractController {

    private readonly _APIManagerAsync = new APIManagerAsyncGot();

    private getAPIManagerAsync(): IAPIManagerAsync {
        return this._APIManagerAsync;
    }

    constructor(window:Window, nwWindow:any) {
        super(window, nwWindow);
        this.initListeners(window);
        this.initContent();
    }

    async onNext() {
        LogManager.getInstance().log(">> LoginController.onNextAsync");
        try {
            let username = commonUtils.getById(document, "username").value;
            let password = commonUtils.getById(document, "password").value;
            let configDir = commonUtils.getById(document, "configDir").value;
            if (!username || !password || !configDir) {
                LogManager.getInstance().log("<< LoginController.onNextAsync");
                throw new Error("all fields are mandatory!");
            }
            new ConfigManager(configDir).checkConfig();
            // note that password is not logged (this is done on purpose)
            LogManager.getInstance().log("LoginController.onNextAsync: username=[" + username + "], configDir=[" + configDir + "]");
            commonUtils.getById(document, "body").classList.add("wait");
            let hostnameAndAccessToken: string[] = await this.getAPIManagerAsync().SOAPLoginAsync(username, password);
            let apiURL = await this.getAPIManagerAsync().APIUrlGetAsync(hostnameAndAccessToken[0]);
            LogManager.getInstance().log("LoginController.onNextAsync: apiURL=[" + apiURL + "]");
            StorageManager.saveUsername(username);
            StorageManager.savePassword(password);
            StorageManager.saveConfigDir(configDir);
            let sfContext: commonUtils.sfContext = {
                hostname: hostnameAndAccessToken[0],
                apiURL: apiURL,
                accessToken: hostnameAndAccessToken[1],
                networkId: null,
            };
            try {
                await this.getAPIManagerAsync().sObjectCountAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkActivityDailyMetrics);
            } catch (error) {
                LogManager.getInstance().log("LoginController.onNextAsync: sObjectCountAsync error=[" + error.stack + "]");
                throw new Error("make sure that you're connected to the Salesforce VPN AND that the 'Allow Salesforce Internal QA Clients' BT perm is enabled on your org.");
            }
            commonUtils.getById(document, "body").classList.remove("wait");
            // TODO: use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
            window.location.href = "selectCommunity.html?hostname=" + hostnameAndAccessToken[0] + "&accessToken=" + hostnameAndAccessToken[1] + "&apiURL=" + apiURL;
        } catch (error) { // caught here because otherwise it will NOT be caught by window.onerror
            LogManager.getInstance().log("LoginController.onNextAsync: caught error=[" + error + "], stack=[" + error.stack + "]", true);
            commonUtils.showError(window.document, "Error: " + error.message);
            commonUtils.getById(document, "body").classList.remove("wait");
        }
        LogManager.getInstance().log("<< LoginController.onNextAsync");
    }

    initListeners(window: Window) {
        LogManager.getInstance().log(">> LoginController.initListeners");
        super.initListeners(window);
        // code below doesn't work because of https://stackoverflow.com/questions/21298918/is-it-possible-to-call-a-class-method-with-addeventlistener
        //commonUtils.getById(document, "next").onclick = this.onNext;
        const that = this;
        commonUtils.getById(document, "next").onclick = function () {
            that.onNext()
        };
        commonUtils.getById(document, "selectDir").onclick = function () {
            commonUtils.getById(document, "fileInput").click();
        };
        commonUtils.getById(document, "fileInput").onchange = function (event:any) {
            commonUtils.getById(document, "configDir").value = event.target.value;
        };
        LogManager.getInstance().log("<< LoginController.initListeners");
    }

    initContent() {
        LogManager.getInstance().log(">> LoginController.initContent");
        commonUtils.getById(document, "username").value = StorageManager.retrieveUsername();
        commonUtils.getById(document, "password").value = StorageManager.retrievePassword();
        commonUtils.getById(document, "configDir").value = StorageManager.retrieveConfigDir();
        LogManager.getInstance().log("<< LoginController.initContent");
    }

}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        LogManager.getInstance().log("App launched at: " + new Date());
        new LoginController(window, nw.Window);
    });
}
