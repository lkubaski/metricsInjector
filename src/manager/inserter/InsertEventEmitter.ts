import {LogManager} from "../log/LogManager";
import * as commonUtils from "../commonUtils";
import {METRICS_SOBJECT_ENUM} from "../commonUtils";
import {IInsertEventEmitter} from "./IInsertEventEmitter";
import {AbstractController} from "../../controller/AbstractController";

const EventEmitter = require('events');

export class InsertEventEmitter extends EventEmitter implements IInsertEventEmitter {

    private readonly UPDATE_TOTAL_NB_INSERTED_ROWS_EVENT = "totalNbInsertedRowsEvent";
    private readonly UPDATE_INSERTED_ROW_EVENT = "insertedRowEvent";
    private readonly UPDATE_TOTAL_NB_DELETED_ROWS_EVENT = "totalNbDeletedRowsEvent";
    private readonly UPDATE_DELETED_ROW_EVENT = "deletedRowEvent";

    constructor(document: Document) {
        super(); // the typescript error can be ignored
        this.init(document);
    }

    private init(document: Document) {
        LogManager.getInstance().log(">> InsertEventEmitter.init");
        this.on(this.UPDATE_TOTAL_NB_DELETED_ROWS_EVENT, (sobjectName: commonUtils.METRICS_SOBJECT_ENUM, nbRows: number) => {
            LogManager.getInstance().log("InsertEventEmitter: processing event=[" + this.UPDATE_TOTAL_NB_DELETED_ROWS_EVENT + "], nbRows=[" + nbRows + "]");
            commonUtils.getById(document, AbstractController.DELETED_ROW_ID_PREFIX + "_" + sobjectName).innerHTML = "0";
            commonUtils.getById(document, AbstractController.DELETED_ROW_SEPARATOR_ID_PREFIX + "_" + sobjectName).innerHTML = "/";
            commonUtils.getById(document, AbstractController.TOTAL_NB_DELETED_ROWS_ID_PREFIX + "_" + sobjectName).innerHTML = nbRows;
        });
        this.on(this.UPDATE_DELETED_ROW_EVENT, (idPrefix: commonUtils.METRICS_SOBJECT_ENUM, delta: number) => {
            LogManager.getInstance().log("InsertEventEmitter: processing event=[" + this.UPDATE_DELETED_ROW_EVENT + ", delta=[" + delta + "]");
            let rowAsString = commonUtils.getById(document, AbstractController.DELETED_ROW_ID_PREFIX + "_" + idPrefix).innerHTML;
            let row = rowAsString !== "" ? parseInt(rowAsString) : 0;
            let nbRowsAsString = commonUtils.getById(document, AbstractController.TOTAL_NB_DELETED_ROWS_ID_PREFIX + "_" + idPrefix).innerHTML;
            let nbRows = Number.parseInt(nbRowsAsString);
            let result = (row + delta) > nbRows ? nbRows : row + delta;
            commonUtils.getById(document, AbstractController.DELETED_ROW_ID_PREFIX + "_" + idPrefix).innerHTML = result;
        });
        this.on(this.UPDATE_TOTAL_NB_INSERTED_ROWS_EVENT, (sobjectName: commonUtils.METRICS_SOBJECT_ENUM, nbRows: number) => {
            LogManager.getInstance().log("InsertEventEmitter: processing event=[" + this.UPDATE_TOTAL_NB_INSERTED_ROWS_EVENT + "], nbRows=[" + nbRows + "]");
            commonUtils.getById(document, AbstractController.INSERTED_ROW_ID_PREFIX + "_" + sobjectName).innerHTML = "0";
            commonUtils.getById(document, AbstractController.INSERTED_ROW_SEPARATOR_ID_PREFIX + "_" + sobjectName).innerHTML = "/";
            commonUtils.getById(document, AbstractController.TOTAL_NB_INSERTED_ROWS_ID_PREFIX + "_" + sobjectName).innerHTML = nbRows;
        });
        this.on(this.UPDATE_INSERTED_ROW_EVENT, (sobjectName: commonUtils.METRICS_SOBJECT_ENUM, delta: number) => {
            LogManager.getInstance().log("InsertEventEmitter: processing event=[" + this.INSERTED_ROW_ID_PREFIX + "], delta=[" + delta + "]");
            let rowAsString = commonUtils.getById(document, AbstractController.INSERTED_ROW_ID_PREFIX + "_" + sobjectName).innerHTML;
            let row = rowAsString !== "" ? Number.parseInt(rowAsString) : 0;
            let nbRowsAsString = commonUtils.getById(document, AbstractController.TOTAL_NB_INSERTED_ROWS_ID_PREFIX + "_" + sobjectName).innerHTML;
            let nbRows = Number.parseInt(nbRowsAsString);
            let result = (row + delta) > nbRows ? nbRows : row + delta;
            commonUtils.getById(document, AbstractController.INSERTED_ROW_ID_PREFIX + "_" + sobjectName).innerHTML = result;
        });
        LogManager.getInstance().log("<< InsertEventEmitter.init");
    }

    emitUpdateTotalNbInsertedRows(sobjectName: METRICS_SOBJECT_ENUM, nbRows: number) {
        LogManager.getInstance().log(">> InsertEventEmitter.emitUpdateTotalNbInsertedRows: sobjectName=[" + sobjectName + "], nbRows=[" + nbRows + "]");
        this.emit(this.UPDATE_TOTAL_NB_INSERTED_ROWS_EVENT, sobjectName, nbRows);
        LogManager.getInstance().log("<< InsertEventEmitter.emitUpdateTotalNbInsertedRows");
    }

    emitUpdateTotalNbDeletedRows(sobjectName: METRICS_SOBJECT_ENUM, nbRows: number) {
        LogManager.getInstance().log(">> InsertEventEmitter.emitUpdateTotalNbDeletedRows: sobjectName=[" + sobjectName + "], nbRows=[" + nbRows + "]");
        this.emit(this.UPDATE_TOTAL_NB_DELETED_ROWS_EVENT, sobjectName, nbRows);
        LogManager.getInstance().log("<< InsertEventEmitter.emitUpdateTotalNbDeletedRows");
    }

    emitUpdateInsertedRow(sobjectName: METRICS_SOBJECT_ENUM, delta: number) {
        LogManager.getInstance().log(">> InsertEventEmitter.emitUpdateTotalNbInsertedRows: sobjectName=[" + sobjectName + "], delta=[" + delta + "]");
        this.emit(this.UPDATE_INSERTED_ROW_EVENT, sobjectName, delta);
        LogManager.getInstance().log("<< InsertEventEmitter.emitUpdateTotalNbInsertedRows");

    }

    emitUpdateDeletedRow(sobjectName: METRICS_SOBJECT_ENUM, delta: number) {
        LogManager.getInstance().log(">> InsertEventEmitter.emitUpdateDeletedRow: sobjectName=[" + sobjectName + "], delta=[" + delta + "]");
        this.emit(this.UPDATE_DELETED_ROW_EVENT, sobjectName, delta);
        LogManager.getInstance().log("<< InsertEventEmitter.emitUpdateDeletedRow");
    }
}