import * as commonUtils from "../commonUtils";

export abstract class IAPIManagerAsync {
    /*
     * see https://github.com/Microsoft/TypeScript/issues/15292
     * to understand why the function needs to ALSO return a promise
     */
    abstract SOAPLoginAsync(username: string, password: string): Promise<string[]>;
    abstract APIUrlGetAsync(hostname: string): Promise<string>;
    abstract CommunitiesGetAsync(sfContext: commonUtils.sfContext): Promise<object>;
    abstract sObjectCountAsync(sfContext: commonUtils.sfContext, sObject: commonUtils.METRICS_SOBJECT_ENUM): Promise<number>;
    abstract sObjectGetAllAsync(sfContext: commonUtils.sfContext, sObject: commonUtils.METRICS_SOBJECT_ENUM, limit?:number): Promise<string[]>;
    abstract sObjectInsertAsync(sfContext: commonUtils.sfContext, sObject: commonUtils.METRICS_SOBJECT_ENUM, nmdm: commonUtils.NetworkMembershipDailyMetrics): Promise<void>;
    abstract sObjectGetBulkAsync(sfContext: commonUtils.sfContext, sObject: commonUtils.METRICS_SOBJECT_ENUM, ids: string[]): Promise<object>;
    abstract sObjectDeleteBulkAsync(sfContext: commonUtils.sfContext, ids: string[]): Promise<void>;
}