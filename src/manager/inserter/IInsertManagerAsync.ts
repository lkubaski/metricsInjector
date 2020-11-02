import * as commonUtils from "../commonUtils";

export interface IInsertManagerAsync {
    deleteMetricsAsync(sfContext: commonUtils.sfContext, sObjectName: commonUtils.METRICS_SOBJECT_ENUM):void;

    insertNADMsAsync(sfContext: commonUtils.sfContext): Promise<void>;

    insertNMDMsAsync(sfContext: commonUtils.sfContext): Promise<void>;

    insertNPUDMsAsync(sfContext: commonUtils.sfContext): Promise<void>;

    insertNSQFsAsync(sfContext: commonUtils.sfContext): Promise<void>;

    insertNUCDMsAsync(sfContext: commonUtils.sfContext): Promise<void>;

    insertNUPDMsAsync(sfContext: commonUtils.sfContext): Promise<void>;
}
