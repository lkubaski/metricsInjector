import * as commonUtils from "../manager/commonUtils";
import {AbstractController} from "./AbstractController";
import {LogManager} from "../manager/log/LogManager";
import {IAPIManagerAsync} from "../manager/api/IAPIManagerAsync";
import {APIManagerAsyncGot} from "../manager/api/APIManagerAsyncGot";
declare var nw: any;

export class SelectCommunityController extends AbstractController {

    private readonly _APIManagerAsync;

    private readonly _accessToken;
    private readonly _apiURL;
    private readonly _hostname;

    constructor(window: Window, nwWindow:any) {
        super(window, nwWindow);
        LogManager.getInstance().log(">> SelectCommunityController.constructor");
        this._APIManagerAsync = new APIManagerAsyncGot();
        let searchParams = new URL(window.location.href).searchParams;
        this._accessToken = searchParams.get("accessToken");
        this._apiURL = searchParams.get("apiURL");
        this._hostname = searchParams.get("hostname");
        this.initListeners(window);
        this.initContent();
        LogManager.getInstance().log("<< SelectCommunityController.constructor");
    }

    private getAPIManagerAsync(): IAPIManagerAsync {
        return this._APIManagerAsync;
    }

    onNext() {
        LogManager.getInstance().log(">> SelectCommunityController.onNext");
        let selectElt = commonUtils.getById(document, "community");
        let communityId = selectElt.options[selectElt.selectedIndex].value;
        if (communityId.startsWith("choose")) {
            LogManager.getInstance().log("<< SelectCommunityController.onNext");
            throw new Error("all fields are mandatory");
        }
        LogManager.getInstance().log("SelectCommunityController.onNext: communityId=[" + communityId + "]");
        window.location.href = "insertMetrics.html?hostname=" + this._hostname + "&accessToken=" + this._accessToken + "&apiURL=" + this._apiURL + "&networkId=" + communityId;
        LogManager.getInstance().log("<< SelectCommunityController.onNext");
    }

    initListeners(window: Window) {
        LogManager.getInstance().log(">> SelectCommunityController.initListeners");
        super.initListeners(window);
        const that = this;
        commonUtils.getById(document, "next").onclick = function () {
            that.onNext()
        };
        LogManager.getInstance().log("<< SelectCommunityController.initListeners");
    }

    async initContent() {
        LogManager.getInstance().log(">> SelectCommunityController.initContent");
        try {
            commonUtils.getById(document, "body").classList.add("wait");
            let sfContext: commonUtils.sfContext = {
                hostname: this._hostname,
                apiURL: this._apiURL,
                accessToken: this._accessToken,
                networkId: null
            };
            let result = await this.getAPIManagerAsync().CommunitiesGetAsync(sfContext);
            let selectElt = commonUtils.getById(document, "community");
            for (let selectIndex in result) {
                // @ts-ignore
                selectElt.options[selectElt.options.length] = new Option(result[selectIndex], selectIndex);
            }
            // TODO: select the previously selected network using StorageManager
            commonUtils.getById(document, "body").classList.remove("wait");
        } catch (error) { // caught here because otherwise it will NOT be caught by window.onerror
            LogManager.getInstance().log("SelectCommunityController.initContentAsync: caught error=[" + error + "], stack=[" + error.stack + "]", true);
            commonUtils.showError(window.document, "Error: " + error.message);
            commonUtils.getById(document, "body").classList.remove("wait");
        }
        LogManager.getInstance().log("<< SelectCommunityController.initContent");
    }

}

document.addEventListener('DOMContentLoaded', function () {
    new SelectCommunityController(window, nw.Window);
});
