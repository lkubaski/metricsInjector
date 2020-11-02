import * as commonUtils from "../commonUtils";
import {ConfigManager} from "../config/ConfigManager";
import {LogManager} from "../log/LogManager";
import {IInsertManagerAsync} from "./IInsertManagerAsync";
import {IAPIManagerAsync} from "../api/IAPIManagerAsync";
import {IInsertEventEmitter} from "./IInsertEventEmitter";
import {APIManagerAsyncGot} from "../api/APIManagerAsyncGot";

const parallel = require('async-await-parallel'); // https://www.npmjs.com/package/async-await-parallel

export class InsertManagerAsync implements IInsertManagerAsync {
    private readonly ONE_DAY = 24 * 60 * 60 * 1000;
    private readonly _APIManagerAsync = new APIManagerAsyncGot();
    private readonly _configManager;
    private readonly _eventEmitter;

    constructor(configDir:string, eventEmitter:IInsertEventEmitter) {
        this._configManager = new ConfigManager(configDir);
        this._eventEmitter = eventEmitter;
    }

    private getAPIManagerAsync(): IAPIManagerAsync {
        return this._APIManagerAsync;
    }

    async deleteMetricsAsync(sfContext: commonUtils.sfContext, sObjectName: commonUtils.METRICS_SOBJECT_ENUM) {
        LogManager.getInstance().log(">> InsertManagerAsync.deleteMetricsAsync: sObjectName=[" + sObjectName + "]");
        let ids = await this.getAPIManagerAsync().sObjectGetAllAsync(sfContext, sObjectName);
        this._eventEmitter.emitUpdateTotalNbDeletedRows(sObjectName, ids.length);
        // https://stackoverflow.com/questions/8495687/split-array-into-chunks
        let i, j, tmpArray, chunk = 100;
        // the goal of this loop is to delete all the rows that can be retrieved during a single API call
        // the assumption being that you will insert LESS rows than the total number of deleted ones
        for (i = 0, j = ids.length; i < j; i += chunk) {
            // note that the loop won't be executed at all if the initial array is empty
            tmpArray = ids.slice(i, i + chunk);
            this._eventEmitter.emitUpdateDeletedRow(sObjectName, chunk);
            await this.getAPIManagerAsync().sObjectDeleteBulkAsync(sfContext, tmpArray);
        }
        LogManager.getInstance().log("<< InsertManagerAsync.deleteMetricsAsync");
    }

    /*
     * NetworkActivityDailyMetrics config file has 6 data rows per day
     */
    async insertNADMsAsync(sfContext: commonUtils.sfContext) {
        LogManager.getInstance().log(">> InsertManagerAsync.insertNADMsAsync");
        let nadms = this._configManager.getNADMConfig();
        this._eventEmitter.emitUpdateTotalNbInsertedRows(commonUtils.METRICS_SOBJECT_ENUM.NetworkActivityDailyMetrics, nadms.length);
        let yesterday = new Date();
        yesterday.setTime(new Date().getTime() - this.ONE_DAY);
        let promises = [];
        for (let i = 0; i < nadms.length; i++) {
            let nadm = nadms[i];
            let nextDate = new Date();
            nextDate.setTime(yesterday.getTime() - (Math.floor(i / 6) * this.ONE_DAY));
            nadm.NetworkId = sfContext.networkId;
            nadm.MetricsDate = commonUtils.dateToString(nextDate);
            nadm.PeriodEndDate = commonUtils.dateToString(nextDate);
            const that = this;
            promises.push(function () {
                that._eventEmitter.emitUpdateInsertedRow(commonUtils.METRICS_SOBJECT_ENUM.NetworkActivityDailyMetrics, 1);
                return that.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkActivityDailyMetrics, nadm);
            });
            //await this.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkActivityDailyMetrics, nadm);
        }
        await parallel(promises, ConfigManager.NB_CONCURRENT_API_REQUESTS);
        LogManager.getInstance().log("<< InsertManagerAsync.insertNADMsAsync");
    }

    /*
    * NetworkMembershipDailyMetrics config file has 3 data rows per day
    */
    async insertNMDMsAsync(sfContext: commonUtils.sfContext) {
        LogManager.getInstance().log(">> InsertManagerAsync.insertNMDMsAsync");
        let nmdms = this._configManager.getNMDMConfig();
        this._eventEmitter.emitUpdateTotalNbInsertedRows(commonUtils.METRICS_SOBJECT_ENUM.NetworkMembershipDailyMetrics, nmdms.length);
        let yesterday = new Date();
        yesterday.setTime(new Date().getTime() - this.ONE_DAY);
        let promises = [];
        for (let i = 0; i < nmdms.length; i++) {
            let nmdm = nmdms[i];
            let nextDate = new Date();
            nextDate.setTime(yesterday.getTime() - (Math.floor(i / 3) * this.ONE_DAY));
            nmdm.NetworkId = sfContext.networkId;
            nmdm.MetricsDate = commonUtils.dateToString(nextDate);
            nmdm.PeriodEndDate = commonUtils.dateToString(nextDate);
            const that = this;
            promises.push(function () {
                that._eventEmitter.emitUpdateInsertedRow(commonUtils.METRICS_SOBJECT_ENUM.NetworkMembershipDailyMetrics, 1);
                return that.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkMembershipDailyMetrics, nmdm);
            });
            //await this.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkMembershipDailyMetrics, nmdm);
        }
        await parallel(promises, ConfigManager.NB_CONCURRENT_API_REQUESTS);
        LogManager.getInstance().log("<< InsertManagerAsync.insertNMDMsAsync");
    }

    /*
     * NetworkPublicUsageDailyMetrics config file has 3 data rows per day
     */
    async insertNPUDMsAsync(sfContext: commonUtils.sfContext) {
        LogManager.getInstance().log(">> InsertManagerAsync.insertNPUDMsAsync");
        let npudms = this._configManager.getNPUDMConfig();
        this._eventEmitter.emitUpdateTotalNbInsertedRows(commonUtils.METRICS_SOBJECT_ENUM.NetworkPublicUsageDailyMetrics, npudms.length);
        let yesterday = new Date();
        yesterday.setTime(new Date().getTime() - this.ONE_DAY);
        let promises = [];
        for (let i = 0; i < npudms.length; i++) {
            let npudm = npudms[i];
            let nextDate = new Date();
            nextDate.setTime(yesterday.getTime() - (Math.floor(i / 3) * this.ONE_DAY));
            npudm.NetworkId = sfContext.networkId;
            npudm.MetricsDate = commonUtils.dateToString(nextDate);
            npudm.PeriodEndDate = commonUtils.dateToString(nextDate);
            const that = this;
            promises.push(function () {
                that._eventEmitter.emitUpdateInsertedRow(commonUtils.METRICS_SOBJECT_ENUM.NetworkPublicUsageDailyMetrics, 1);
                return that.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkPublicUsageDailyMetrics, npudm);
            });
            //await this.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkPublicUsageDailyMetrics, npudm);
        }
        await parallel(promises, ConfigManager.NB_CONCURRENT_API_REQUESTS);
        LogManager.getInstance().log("<< InsertManagerAsync.insertNPUDMsAsync");
    }

    /*
     * NetworkSearchQueryFrequency config file has 92 data rows per day
     */
    async insertNSQFsAsync(sfContext: commonUtils.sfContext) {
        LogManager.getInstance().log(">> InsertManagerAsync.insertNSQFsAsync");
        let nsqfs = this._configManager.getNSQFConfig();
        this._eventEmitter.emitUpdateTotalNbInsertedRows(commonUtils.METRICS_SOBJECT_ENUM.NetworkSearchQueryFrequency, nsqfs.length);
        let yesterday = new Date();
        yesterday.setTime(new Date().getTime() - this.ONE_DAY);
        let promises = [];
        for (let i = 0; i < nsqfs.length; i++) {
            let nsqf = nsqfs[i];
            let nextDate = new Date();
            nextDate.setTime(yesterday.getTime() - (Math.floor(i / 92) * this.ONE_DAY));
            nsqf.NetworkId = sfContext.networkId;
            nsqf.QueryDate = commonUtils.dateToString(nextDate);
            const that = this;
            promises.push(function () {
                that._eventEmitter.emitUpdateInsertedRow(commonUtils.METRICS_SOBJECT_ENUM.NetworkSearchQueryFrequency, 1);
                return that.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkSearchQueryFrequency, nsqf);
            });
            //await this.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkSearchQueryFrequency, npudm);
        }
        await parallel(promises, ConfigManager.NB_CONCURRENT_API_REQUESTS);
        LogManager.getInstance().log("<< InsertManagerAsync.insertNSQFsAsync");
    }

    /*
     * NetworkUniqueContributorDailyMetrics config file has 3 data rows per day
     */
    async insertNUCDMsAsync(sfContext: commonUtils.sfContext) {
        LogManager.getInstance().log(">> InsertManagerAsync.insertNUCDMsAsync");
        let nucdms = this._configManager.getNUCDMConfig();
        this._eventEmitter.emitUpdateTotalNbInsertedRows(commonUtils.METRICS_SOBJECT_ENUM.NetworkUniqueContributorDailyMetrics, nucdms.length);
        let yesterday = new Date();
        yesterday.setTime(new Date().getTime() - this.ONE_DAY);
        let promises = [];
        for (let i = 0; i < nucdms.length; i++) {
            let nucdm = nucdms[i];
            let nextDate = new Date();
            nextDate.setTime(yesterday.getTime() - (Math.floor(i / 3) * this.ONE_DAY));
            nucdm.NetworkId = sfContext.networkId;
            nucdm.MetricsDate = commonUtils.dateToString(nextDate);
            nucdm.PeriodEndDate = commonUtils.dateToString(nextDate);
            const that = this;
            promises.push(function () {
                that._eventEmitter.emitUpdateInsertedRow(commonUtils.METRICS_SOBJECT_ENUM.NetworkUniqueContributorDailyMetrics, 1);
                return that.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkUniqueContributorDailyMetrics, nucdm);
            });
            //await this.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkUniqueContributorDailyMetrics, nucdm);
        }
        await parallel(promises, ConfigManager.NB_CONCURRENT_API_REQUESTS);
        LogManager.getInstance().log("<< InsertManagerAsync.insertNUCDMsAsync");
    }

    /*
     * NetworkUserParticipationDailyMetrics config file has 6 data rows per day
     */
    async insertNUPDMsAsync(sfContext: commonUtils.sfContext) {
        LogManager.getInstance().log(">> InsertManagerAsync.insertNUPDMsAsync");
        let nupdms = this._configManager.getNUPDMConfig();
        this._eventEmitter.emitUpdateTotalNbInsertedRows(commonUtils.METRICS_SOBJECT_ENUM.NetworkUserParticipationDailyMetrics, nupdms.length);
        let yesterday = new Date();
        yesterday.setTime(new Date().getTime() - this.ONE_DAY);
        let promises = [];
        for (let i = 0; i < nupdms.length; i++) {
            let nupdm = nupdms[i];
            let nextDate = new Date();
            nextDate.setTime(yesterday.getTime() - (Math.floor(i / 3) * this.ONE_DAY));
            nupdm.NetworkId = sfContext.networkId;
            nupdm.MetricsDate = commonUtils.dateToString(nextDate);
            nupdm.PeriodEndDate = commonUtils.dateToString(nextDate);
            const that = this;
            promises.push(function () {
                that._eventEmitter.emitUpdateInsertedRow(commonUtils.METRICS_SOBJECT_ENUM.NetworkUserParticipationDailyMetrics, 1);
                return that.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkUserParticipationDailyMetrics, nupdm);
            });
            //await this.getAPIManagerAsync().sObjectInsertAsync(sfContext, commonUtils.METRICS_SOBJECT_ENUM.NetworkUserParticipationDailyMetrics, nupdm);
        }
        await parallel(promises, ConfigManager.NB_CONCURRENT_API_REQUESTS);
        LogManager.getInstance().log("<< InsertManagerAsync.insertNUPDMsAsync");
    }

}
