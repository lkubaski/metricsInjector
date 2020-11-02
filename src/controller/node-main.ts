import {LogManager} from "../manager/log/LogManager";

//declare var nw: any; // the nw context is NOT available at this point

// note: do NOT import/require anything in this file since we don't want things to fail before the
// uncaught handler is set
console.log(">> main");
// https://nodejs.org/dist/latest-v10.x/docs/api/process.html#process_event_uncaughtexception
process.on('uncaughtException', (error) => {
    console.error("uncaughtException=[" + error + "]");
    LogManager.getInstance().log("uncaughtException=[" + error + "], stack=[" + error.stack + "]", true);
    process.exit(1);
});
console.log("<< main");