import * as commonUtils from "../manager/commonUtils";
import {LogManager} from "../manager/log/LogManager";

declare var nw: any;

export abstract class AbstractController {

    public static INSERTED_ROW_ID_PREFIX = "insertedRow";
    public static INSERTED_ROW_SEPARATOR_ID_PREFIX = "insertedRowSeparator";
    public static TOTAL_NB_INSERTED_ROWS_ID_PREFIX = "totalNbInsertedRows";

    public static DELETED_ROW_ID_PREFIX = "deletedRow";
    public static DELETED_ROW_SEPARATOR_ID_PREFIX = "deletedRowSeparator";
    public static TOTAL_NB_DELETED_ROWS_ID_PREFIX = "totalNbDeletedRows";

    constructor(window: Window, nwWindow:any) {
        LogManager.getInstance().log(">> AbstractController.constructor");
        this.buildMenu(window, nwWindow);
        LogManager.getInstance().log("<< AbstractController.constructor");
    }

    /*
* Menus created in the page that can be navigated will not be functional after a reload or navigation.
* The reason is that the menus and even the web page will be garbage collected by JS engine after navigation to prevent memory leak.
* So it’s recommended to use menus in background page, which is existed for the life cycle of your app.
*
* Since I'm lazy, this method is re-invoked in every controller
*/
    private buildMenu(window: Window, nwWindow:any) {
        LogManager.getInstance().log(">> AbstractController.buildMenu");
        let menu = new nw.Menu({type: 'menubar'});
        // http://docs.nwjs.io/en/latest/For%20Users/Advanced/Customize%20Menubar/#mac-os-x
        // createMacBuiltin() adds 3 entries to the menu: nwjs (the bundle name) / Edit / Window
        // However, using menu.RemoveItem() it is NOT possible to remove the OOTB "nwjs" entry
        // The reason I'm keeping these default menus is because they're present by default anyways
        // so if we remove them, then there is a short period where the menu gets refreshed which is weird
        menu.createMacBuiltin("[BUNDLE]", {
            hideEdit : false,
            hideWindow: false
        });
        let submenu = new nw.Menu();
        menu.append(new nw.MenuItem({
            label: 'File', // the label will actually be the app bundle name if createMacBuiltin() is NOT invoked
            submenu: submenu
        }));
        let exportLogsMenuItem = new nw.MenuItem({label: 'Export logs'});
        let that = this;
        exportLogsMenuItem.click = function () {
            that.onExportLogs(window);
        };
        submenu.append(exportLogsMenuItem);
        //submenu.append(new nw.MenuItem({type: 'separator'}));
        //nw.Window.get().menu = menu;
        nwWindow.get().menu = menu;
        /*for (let i=0;i< nwWindow.get().menu.items.length;i++) {
            // weird: the first menu entry (has no label)
            LogManager.getInstance().log("AbstractController.buildMenu: nextMenuLabel=" + nwWindow.get().menu.items[i].label);
        }*/
        LogManager.getInstance().log("<< AbstractController.buildMenu");
    }

    private onExportLogs(window: Window) {
        LogManager.getInstance().log(">> AbstractController.onExportLogs");
        //window.open('file:///Users/lkubaski/Documents/DATA/src/node%20sources/nw/logs.txt');
        // https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
        let elt = window.document.createElement('a');
        let href = 'file:///' + LogManager.getInstance().logFilePath;
        LogManager.getInstance().log("AbstractController.onExportLogs: href=[" + href + "]");
        elt.setAttribute('href', href);
        elt.setAttribute('download', "logs.txt");
        elt.style.display = 'none';
        window.document.body.appendChild(elt);
        elt.click();
        window.document.body.removeChild(elt);
        LogManager.getInstance().log("<< AbstractController.onExportLogs");
    }

    abstract onNext():void;

    /*
     * We need to pass "window" as a param since this class is imported via "import" and
     * thus doesn't have access to the Window context
     */
    initListeners(window: Window) {
        LogManager.getInstance().log(">> AbstractController.initListeners");
        // https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
        window.onerror = function (msg, url, line, col, error) {
            let errorMsg = "Error: msg=[" + msg + "], url=[" + url + "], line=[" + line + "]";
            LogManager.getInstance().log("AbstractController.initListeners.onerror: " + errorMsg, true);
            // note that we display "error" and not "msg" since "msg" is prefixed with "Uncaught"
            commonUtils.showError(window.document, "Error: " + error.message);
            commonUtils.getById(document, "body").classList.remove("wait");
        };
        LogManager.getInstance().log("<< AbstractController.initListeners");
    }

    abstract initContent():void;

}
