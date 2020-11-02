import * as commonUtils from "../manager/commonUtils";
import {AbstractController} from "./AbstractController";
import {StorageManager} from "../manager/storage/StorageManager";
import {LogManager} from "../manager/log/LogManager";
import {InsertManagerAsync} from "../manager/inserter/InsertManagerAsync";
import {IInsertManagerAsync} from "../manager/inserter/IInsertManagerAsync";
import {IInsertEventEmitter} from "../manager/inserter/IInsertEventEmitter";
import {InsertEventEmitter} from "../manager/inserter/InsertEventEmitter";
declare var nw: any;

export class InsertMetricsController extends AbstractController {

    private readonly _InsertManagerAsync: IInsertManagerAsync;
    private readonly _emitter:IInsertEventEmitter;

    private readonly _accessToken;
    private readonly _apiURL;
    private readonly _hostname;
    private readonly _networkId;

    constructor(window:Window, nwWindow:any) {
        super(window, nwWindow);
        this._emitter = new InsertEventEmitter(document);
        this._InsertManagerAsync = new InsertManagerAsync(StorageManager.retrieveConfigDir(), this._emitter);
        let searchParams = new URL(window.location.href).searchParams;
        this._accessToken = searchParams.get("accessToken");
        this._apiURL = searchParams.get("apiURL");
        this._networkId = searchParams.get("networkId");
        this._hostname = searchParams.get("hostname");
        this.initListeners(window);
        this.initContent();
    }

    onNext() {
        LogManager.getInstance().log(">> InsertMetricsController.onNext");
        LogManager.getInstance().log("<< InsertMetricsController.onNext");
    }

    initListeners(window: Window) {
        LogManager.getInstance().log(">> InsertMetricsController.initListeners");
        super.initListeners(window);
        LogManager.getInstance().log("<< InsertMetricsController.initListeners");
    }

    static addStatusUpdate(status: string, sObjectName?: commonUtils.METRICS_SOBJECT_ENUM, isInsertion?: boolean,) {
        LogManager.getInstance().log(">> InsertMetricsController.addStatusUpdate: sObjectName=[" + sObjectName + "], isInsertion=[" + isInsertion + "]");
        let newFirstElement;
        let divStatusElt = commonUtils.getById(document, "status");
        if (sObjectName) {
            let rowId, separatorId, nbRowsId;
            if (isInsertion) {
                rowId = sObjectName ? AbstractController.INSERTED_ROW_ID_PREFIX + "_" + sObjectName : AbstractController.INSERTED_ROW_ID_PREFIX;
                separatorId = sObjectName ? AbstractController.INSERTED_ROW_SEPARATOR_ID_PREFIX + "_" + sObjectName : AbstractController.INSERTED_ROW_SEPARATOR_ID_PREFIX;
                nbRowsId = sObjectName ? AbstractController.TOTAL_NB_INSERTED_ROWS_ID_PREFIX + "_" + sObjectName : AbstractController.TOTAL_NB_INSERTED_ROWS_ID_PREFIX;
            } else {
                rowId = sObjectName ? AbstractController.DELETED_ROW_ID_PREFIX + "_" + sObjectName : AbstractController.DELETED_ROW_ID_PREFIX;
                separatorId = sObjectName ? AbstractController.DELETED_ROW_SEPARATOR_ID_PREFIX + "_" + sObjectName : AbstractController.DELETED_ROW_SEPARATOR_ID_PREFIX;
                nbRowsId = sObjectName ? AbstractController.TOTAL_NB_DELETED_ROWS_ID_PREFIX + "_" + sObjectName : AbstractController.TOTAL_NB_DELETED_ROWS_ID_PREFIX;
            }
            let html = '<div><span>' + status + '</span><span id=\'' + rowId + '\'></span><span id=\'' + separatorId + '\'></span><span id=\'' + nbRowsId + '\'></span></div>';
            LogManager.getInstance().log("InsertMetricsController.addStatusUpdate = html=[" + html + "]");
            newFirstElement = commonUtils.createElementFromHTML(html);
        } else {
            let html = '<div><span>' + status + '</span></div>';
            newFirstElement = commonUtils.createElementFromHTML(html);
        }
        divStatusElt.insertBefore(newFirstElement, divStatusElt.firstChild);
        LogManager.getInstance().log("<< InsertMetricsController.addStatusUpdate");
    }

    async initContent() {
        LogManager.getInstance().log(">> InsertMetricsController.initContentAsync");
        try {
            let sfContext: commonUtils.sfContext = {
                hostname: this._hostname,
                apiURL: this._apiURL,
                accessToken: this._accessToken,
                networkId: this._networkId
            };
            commonUtils.getById(document, "body").classList.add("wait");

            InsertMetricsController.addStatusUpdate("step 01/12 - deleting NetworkActivityDailyMetrics: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkActivityDailyMetrics, false);
            await this._InsertManagerAsync.deleteMetricsAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkActivityDailyMetrics);
            InsertMetricsController.addStatusUpdate("step 02/12 - deleting NetworkMembershipDailyMetrics: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkMembershipDailyMetrics, false);
            await this._InsertManagerAsync.deleteMetricsAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkMembershipDailyMetrics);
            InsertMetricsController.addStatusUpdate("step 03/12 - deleting NetworkPublicUsageDailyMetrics: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkPublicUsageDailyMetrics, false);
            await this._InsertManagerAsync.deleteMetricsAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkPublicUsageDailyMetrics);
            InsertMetricsController.addStatusUpdate("step 04/12 - deleting NetworkSearchQueryFrequency: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkSearchQueryFrequency, false);
            await this._InsertManagerAsync.deleteMetricsAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkSearchQueryFrequency);
            InsertMetricsController.addStatusUpdate("step 05/12 - deleting NetworkUniqueContributorDailyMetrics: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkUniqueContributorDailyMetrics, false);
            await this._InsertManagerAsync.deleteMetricsAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkUniqueContributorDailyMetrics);
            InsertMetricsController.addStatusUpdate("step 06/12 - deleting NetworkUserParticipationDailyMetrics: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkUserParticipationDailyMetrics, false);
            await this._InsertManagerAsync.deleteMetricsAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkUserParticipationDailyMetrics);
            InsertMetricsController.addStatusUpdate("step 07/12 - inserting NetworkActivityDailyMetrics: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkActivityDailyMetrics, true);
            await this._InsertManagerAsync.insertNADMsAsync(sfContext);
            InsertMetricsController.addStatusUpdate("step 08/12 - inserting NetworkMembershipDailyMetrics: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkMembershipDailyMetrics, true);
            await this._InsertManagerAsync.insertNMDMsAsync(sfContext);
            InsertMetricsController.addStatusUpdate("step 09/12 - inserting NetworkPublicUsageDailyMetrics: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkPublicUsageDailyMetrics, true);
            await this._InsertManagerAsync.insertNPUDMsAsync(sfContext);
            InsertMetricsController.addStatusUpdate("step 10/12 - inserting NetworkSearchQueryFrequency: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkSearchQueryFrequency, true);
            await this._InsertManagerAsync.insertNSQFsAsync(sfContext);
            InsertMetricsController.addStatusUpdate("step 11/12 - inserting NetworkUniqueContributorDailyMetrics: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkUniqueContributorDailyMetrics, true);
            await this._InsertManagerAsync.insertNUCDMsAsync(sfContext);
            InsertMetricsController.addStatusUpdate("step 12/12 - inserting NetworkUserParticipationDailyMetrics: ", commonUtils.METRICS_SOBJECT_ENUM.NetworkUserParticipationDailyMetrics, true);
            await this._InsertManagerAsync.insertNUPDMsAsync(sfContext);
            InsertMetricsController.addStatusUpdate("Done!");
            commonUtils.getById(document, "body").classList.remove("wait");
            this.onNext();
        } catch (error) { // caught here because otherwise it will NOT be caught by window.onerror
            LogManager.getInstance().log("InsertMetricsController.initContentAsync: caught error=[" + error + "], stack=[" + error.stack + "]", true);
            commonUtils.showError(window.document, "Error: " + error.message);
            commonUtils.getById(document, "body").classList.remove("wait");
        }
        LogManager.getInstance().log(">> InsertMetricsController.initContentAsync");
    }

    /*initContentSync() {
        LogManager.getInstance().log(">> InsertMetricsController.initContentSync");
        let sfContext: commonUtils.sfContext = {
            hostname: StorageManager.retrieveHostname(),
            apiURL: this._apiURL,
            accessToken: this._accessToken,
            networkId: this._networkId,
        };
        // This "cascading setTimeout() pyramid of hell is because the whole server-side logic is synchronous
        // thus preventing the UI from refreshing. setTimeout() gives the chance for the UI to refresh between
        // 2 long backend operations, the caveat beeing that if the main window loses focus while a long
        // operation is running, then it will not be refreshed before that operation is done
        commonUtils.getById(document, "body").classList.add("wait");
        InsertMetricsController.addStatusUpdate("step 01/12: deleting NetworkActivityDailyMetrics...");
        const that = this;
        setTimeout(function () {
            that.getInsertManagerSync().deleteMetricsSync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkActivityDailyMetrics);
            InsertMetricsController.addStatusUpdate("step 02/12: deleting NetworkMembershipDailyMetrics...");
            setTimeout(function () {
                that.getInsertManagerSync().deleteMetricsSync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkMembershipDailyMetrics);
                InsertMetricsController.addStatusUpdate("step 03/12: deleting NetworkPublicUsageDailyMetrics...");
                setTimeout(function () {
                    that.getInsertManagerSync().deleteMetricsSync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkPublicUsageDailyMetrics);
                    InsertMetricsController.addStatusUpdate("step 04/12: deleting NetworkSearchQueryFrequency...");
                    setTimeout(function () {
                        that.getInsertManagerSync().deleteMetricsSync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkSearchQueryFrequency);
                        InsertMetricsController.addStatusUpdate("step 05/12: deleting NetworkUniqueContributorDailyMetrics...");
                        setTimeout(function () {
                            that.getInsertManagerSync().deleteMetricsSync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkUniqueContributorDailyMetrics);
                            InsertMetricsController.addStatusUpdate("step 06/12: deleting NetworkUserParticipationDailyMetrics...");
                            setTimeout(function () {
                                that.getInsertManagerSync().deleteMetricsSync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkUserParticipationDailyMetrics);
                                InsertMetricsController.addStatusUpdate("step 07/12: inserting NetworkActivityDailyMetrics...");
                                setTimeout(function () {
                                    that.getInsertManagerSync().insertNADMsSync(sfContext);
                                    InsertMetricsController.addStatusUpdate("step 08/12: inserting NetworkMembershipDailyMetrics...");
                                    setTimeout(function () {
                                        that.getInsertManagerSync().insertNMDMsSync(sfContext);
                                        InsertMetricsController.addStatusUpdate("step 09/12: inserting NetworkPublicUsageDailyMetrics...");
                                        setTimeout(function () {
                                            that.getInsertManagerSync().insertNPUDMsSync(sfContext);
                                            InsertMetricsController.addStatusUpdate("step 10/12: inserting NetworkSearchQueryFrequency...");
                                            setTimeout(function () {
                                                that.getInsertManagerSync().insertNSQFsSync(sfContext);
                                                InsertMetricsController.addStatusUpdate("step 11/12: inserting NetworkUniqueContributorDailyMetrics...");
                                                setTimeout(function () {
                                                    that.getInsertManagerSync().insertNUCDMsSync(sfContext);
                                                    InsertMetricsController.addStatusUpdate("step 12/12: inserting NetworkUserParticipationDailyMetrics...");
                                                    setTimeout(function () {
                                                        that.getInsertManagerSync().insertNUPDMsSync(sfContext);
                                                        InsertMetricsController.addStatusUpdate("Done!");
                                                        commonUtils.getById(document, "body").classList.remove("wait");
                                                    }, 0)
                                                }, 0)
                                            }, 0)
                                        }, 0)
                                    }, 0)
                                }, 0)
                            }, 0)
                        }, 0)
                    }, 0)
                }, 0)
            }, 0);
        }, 500); // "0" isn't enough for the mouse cursor to update


        this.onNext();
        LogManager.getInstance().log("<< InsertMetricsController.initContentSync");
    }*/

}


document.addEventListener('DOMContentLoaded', function () {
    new InsertMetricsController(window, nw.Window);
});
