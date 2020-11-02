import {METRICS_SOBJECT_ENUM} from "../commonUtils";

export interface IInsertEventEmitter {
    emitUpdateTotalNbInsertedRows(sobjectName: METRICS_SOBJECT_ENUM, nbRows: number):void;

    emitUpdateTotalNbDeletedRows(sobjectName: METRICS_SOBJECT_ENUM, nbRows: number):void;

    emitUpdateInsertedRow(sobjectName: METRICS_SOBJECT_ENUM, delta: number):void;

    emitUpdateDeletedRow(sobjectName: METRICS_SOBJECT_ENUM, delta: number):void;
}
