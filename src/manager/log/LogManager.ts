import * as commonUtils from "../commonUtils";
import {ConfigManager} from "../config/ConfigManager";

declare var nw: any;
let fs = require("fs");

export class LogManager {

    // http://www.adam-bien.com/roller/abien/entry/singleton_pattern_in_es6_and
    private static instance: LogManager;
    public readonly logFilePath;

    private constructor() {
        console.log(">> LogManager.constructor");
        this.logFilePath = this.newLogFilePath();
        // TODO: check if log can actually be created
        this.resetLog();
        console.log("<< LogManager.constructor");
    }

    /*
 * When the nwjs.app is launched in "exploded context", then process.cwd(=[/Users/lkubaski/Documents/DATA/src/node sources/nw
 * However, when launched in "embedded context", then process.cwd(=[/Users/lkubaski/Documents/DATA/src/node sources/nw/output/nwjs.app/Contents/Resources/app.nw]
 *
 * In the later case, we need to add some logic to retrieve the "working dir" which is where the log file is going to be created
 */
    private newRootDir() {
        let rootDir;
        let cwd = process.cwd();
        console.log(">> LogManager.generateRootDir: cwd=[" + cwd + "]");
        let dirElts = cwd.split("/");
        let nwjsAppName = dirElts.find(function (elt: string) {
            return elt.endsWith(".app");
        });
        console.log("LogManager.generateRootDir: app=[" + nwjsAppName + "]");
        if (nwjsAppName === undefined) { // "nw exploded" context
            rootDir = cwd;
        } else { // "nw embedded" context
            rootDir = cwd.split(nwjsAppName)[0];
        }
        console.log("<< LogManager.generateRootDir: returning rootDir=[" + rootDir + "]");
        return rootDir;
    }

    private newLogFilePath() {
        console.log(">> LogManager.newLogFilePath");
        let logPath;
        if (ConfigManager.STORE_LOGS_IN_LIBRARY_DIR) {
            logPath = nw.App.dataPath + "/logs.txt";
        } else {
            logPath = this.newRootDir() + "/logs.txt";
        }
        console.log("<< LogManager.newLogFilePath: returning logFilePath=[" + logPath + "]");
        return logPath;
    }

    static getInstance() {
        if (LogManager.instance) {
            return LogManager.instance;
        }
        this.instance = new LogManager();
        return this.instance;
    }

    private resetLog() {
        fs.writeFileSync(this.logFilePath, "", 'utf8');
    }

    log(msg: string, isError: boolean = false) {
        let logger = isError ? console.error : console.log;
        logger.call(this, msg);
        fs.appendFileSync(this.logFilePath, commonUtils.dateToString(new Date(), true) + " " + msg + "\n", 'utf8');
    }

}
