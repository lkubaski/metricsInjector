import * as commonUtils from "../commonUtils";
import {LogManager} from "../log/LogManager";
import {IAPIManagerAsync} from "./IAPIManagerAsync";

const got = require('got');

export class APIManagerAsyncGot extends IAPIManagerAsync {

    // https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_asynch/asynch_api_quickstart_login.htm
    static LOGIN_SOAP = '\
<?xml version="1.0" encoding="utf-8" ?>\
<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">\
<env:Body>\
<n1:login xmlns:n1="urn:partner.soap.sforce.com">\
<n1:username>[USERNAME]</n1:username>\
<n1:password>[PASSWORD]</n1:password>\
</n1:login>\
</env:Body>\
</env:Envelope>';

    private newHeaders(token:string): object {
        return {
            'Sforce-Call-Options': 'client=SfdcInternalQA/...',
            'Authorization': 'Bearer [TOKEN]'
                .replace("[TOKEN]", token)
                .replace("!", "\!"),
            'X-PrettyPrint': '1',
            'Content-Type': 'application/json'
        };
    }

    private async invokeGot(url:string, method:string, headers:object, body?:string): Promise<string> {
        LogManager.getInstance().log(">> APIManagerAsyncGot.invokeGot: url=[" + url + "]");
        let result;
        try {
            result = await got(
                url,
                {
                    'method': method,
                    'headers': headers,
                    'body': body,
                    // https://github.com/sindresorhus/got#api (see "proxies" section)
                    // https://www.charlesproxy.com/documentation/configuration/browser-and-system-configuration/
                    /*'agent': tunnel.httpOverHttp({
                        'proxy': {
                            'host': 'localhost',
                            'port': 8888
                        }
                    })*/
                });
            //LogManager.getInstance().log("APIManagerAsyncGot.invokeGot: response=[" + JSON.stringify(result) + "]"); // TODO: remove when in production (this can fail with a circular ref)
        } catch (error) { // module.exports.HTTPError
            LogManager.getInstance().log("APIManagerAsyncGot.invokeGot: caught error=[" + error.stack + "]", true);
            throw error;
        }
        LogManager.getInstance().log("<< APIManagerAsyncGot.invokeGot");
        return result.body;
    }

    /*
     * see https://github.com/Microsoft/TypeScript/issues/15292
     * to understand why the function needs to ALSO return a promise
     */
    async SOAPLoginAsync(username: string, password: string): Promise<string[]> {
        LogManager.getInstance().log(">> APIManagerAsyncGot.SOAPLoginAsync");
        let url = "https://login.salesforce.com/services/Soap/u/43.0";
        let headers = {
            'SOAPAction': 'login',
            'Content-Type': 'text/xml; charset=UTF-8',
        };
        let body = APIManagerAsyncGot.LOGIN_SOAP
            .replace("[USERNAME]", username)
            .replace("[PASSWORD]", password);
        let gotResult = await this.invokeGot(url, 'post', headers, body);
        let sessionIdBegin = gotResult.indexOf("<sessionId>");
        let sessionIdEnd = gotResult.indexOf("</sessionId>");
        let sessionId = gotResult.substring(sessionIdBegin + "<sessionId>".length, sessionIdEnd);
        let serverURLBegin = gotResult.indexOf("<serverUrl>");
        let serverURLEnd = gotResult.indexOf("</serverUrl>");
        let serverURL = gotResult.substring(serverURLBegin + "<serverUrl>".length, serverURLEnd);
        let hostname = serverURL.split("/services/")[0];
        LogManager.getInstance().log("<< APIManagerAsyncGot.SOAPLoginAsync: hostname=[" + hostname + "], sessionId=[" + sessionId + "]");
        return [hostname, sessionId]; // this is automatically going to be wrapped in a promise (confusing huh?)
    }

    async APIUrlGetAsync(hostname: string): Promise<string> {
        LogManager.getInstance().log(">> APIManagerAsyncGot.APIUrlGetAsync");
        let url = hostname + '/services/data/';
        let gotResult = await this.invokeGot(url, 'get', {}, null);
        let gotResultObject = JSON.parse(gotResult);
        let result = gotResultObject[gotResultObject.length - 1].url;
        LogManager.getInstance().log("<< APIManagerAsyncGot.APIUrlGetAsync: result=[" + result + "]");
        return result;
    }

    async CommunitiesGetAsync(sfContext: commonUtils.sfContext): Promise<object> {
        LogManager.getInstance().log(">> APIManagerAsyncGot.CommunitiesGetAsync");
        let url = sfContext.hostname + sfContext.apiURL + "/query/?q=SELECT+ID,Name+FROM+Network+WHERE+Status=%27Live%27";
        let headers = this.newHeaders(sfContext.accessToken);
        let gotResult = await this.invokeGot(url, 'get', headers, null);
        let gotResultObject = JSON.parse(gotResult);
        let result = {};
        for (let i = 0; i < gotResultObject.records.length; i++) {
            // @ts-ignore
            result[gotResultObject.records[i].Id] = gotResultObject.records[i].Name;
        }
        LogManager.getInstance().log("APIManagerAsyncGot.CommunitiesGetAsync: result=[" + JSON.stringify(result) + "]");
        LogManager.getInstance().log("<< APIManagerAsyncGot.CommunitiesGetAsync");
        return result;
    }

    async sObjectCountAsync(sfContext: commonUtils.sfContext, sObjectName: commonUtils.METRICS_SOBJECT_ENUM): Promise<number> {
        LogManager.getInstance().log(">> APIManagerAsyncGot.sObjectCountAsync: sObjectName=[" + sObjectName + "]");
        let url = sfContext.hostname + sfContext.apiURL + "/query/?q=SELECT+COUNT%28%29+FROM+" + sObjectName;
        let headers = this.newHeaders(sfContext.accessToken);
        let gotResult = await this.invokeGot(url, 'get', headers, null);
        let gotResultObject = JSON.parse(gotResult);
        let result = gotResultObject.totalSize;
        LogManager.getInstance().log("<< APIManagerAsyncGot.sObjectCountAsync: returning result=[" + result + "]");
        return result;
    }

    async sObjectGetAllAsync(sfContext: commonUtils.sfContext, sObjectName: commonUtils.METRICS_SOBJECT_ENUM, limit?: number): Promise<string[]> {
        LogManager.getInstance().log(" >> APIManagerAsyncGot.sObjectGetAllAsync: sObjectName=[" + sObjectName + "]");
        let url = sfContext.hostname + sfContext.apiURL + "/query/?q=SELECT+ID+FROM+" + sObjectName + "+WHERE+NetworkId=%27" + sfContext.networkId + "%27";
        if (sObjectName === commonUtils.METRICS_SOBJECT_ENUM.NetworkSearchQueryFrequency) {
            url += "+ORDER+BY+QUERYDATE+DESC";
        } else {
            url += "+ORDER+BY+METRICSDATE+DESC";
        }
        if (limit) url += "+LIMIT+" + limit;
        let headers = this.newHeaders(sfContext.accessToken);
        let gotResult = await this.invokeGot(url, 'get', headers, null);
        let gotResultObject = JSON.parse(gotResult);
        let result = [];
        for (let i = 0; i < gotResultObject.records.length; i++) {
            result.push(gotResultObject.records[i].Id);
        }
        LogManager.getInstance().log("<< APIManagerAsyncGot.sObjectGetAllAsync: returning nbResults=[" + result.length + "]");
        return result;
    }

    async sObjectInsertAsync(sfContext: commonUtils.sfContext, sObjectName: commonUtils.METRICS_SOBJECT_ENUM, sobject: any): Promise<void> {
        LogManager.getInstance().log(">> APIManagerAsyncGot.sObjectInsertAsync: sObjectName=[" + sObjectName + "]");
        let url = sfContext.hostname + sfContext.apiURL + "/sobjects/" + sObjectName;
        let result = await this.invokeGot(url, 'post', this.newHeaders(sfContext.accessToken), JSON.stringify(sobject));
        LogManager.getInstance().log("APIManagerAsyncGot.sObjectInsertAsync: result=[" + JSON.stringify(result) + "]");
        LogManager.getInstance().log("<< APIManagerAsyncGot.sObjectInsertAsync");
    }

    async sObjectGetBulkAsync(sfContext: commonUtils.sfContext, sObjectName: commonUtils.METRICS_SOBJECT_ENUM, ids: string[]): Promise<object> {
        LogManager.getInstance().log(">> APIManagerAsyncGot.sObjectGetBulkAsync: sObjectName=[" + sObjectName + "]");
        let url = sfContext.hostname + sfContext.apiURL + "/composite/" + sObjectName + "?ids=" + ids.join() + "&fields=Id";
        let headers = this.newHeaders(sfContext.accessToken);
        let gotResult = await this.invokeGot(url, 'get', headers, null);
        let gotResultObject = JSON.parse(gotResult);
        let result = gotResultObject;
        //LogManager.getInstance().log("APIManagerAsyncCurl.sObjectGetBulkAsync: result=[" + JSON.stringify(sfResult) + "]");
        LogManager.getInstance().log("<< APIManagerAsyncGot.sObjectGetBulkAsync");
        return result;
    }

    async sObjectDeleteBulkAsync(sfContext: commonUtils.sfContext, ids: string[]): Promise<void> {
        LogManager.getInstance().log(">> APIManagerAsyncGot.sObjectDeleteBulkAsync: nbIds=[" + ids.length + "]");
        let url = sfContext.hostname + sfContext.apiURL + "/composite/sobjects?ids=" + ids.join();
        let headers = this.newHeaders(sfContext.accessToken);
        let gotResult = await this.invokeGot(url, 'delete', headers, null);
        let gotResultObject = JSON.parse(gotResult);
        LogManager.getInstance().log("<< APIManagerAsyncGot.sObjectDeleteBulkAsync");
    }
}
