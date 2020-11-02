import {LogManager} from "./log/LogManager";

export enum METRICS_SOBJECT_ENUM { // cannot be defined in a typescript class
    NetworkActivityDailyMetrics = "NetworkActivityDailyMetrics",
    NetworkMembershipDailyMetrics = "NetworkMembershipDailyMetrics",
    NetworkPublicUsageDailyMetrics = "NetworkPublicUsageDailyMetrics",
    NetworkSearchQueryFrequency = "NetworkSearchQueryFrequency",
    NetworkUniqueContributorDailyMetrics = "NetworkUniqueContributorDailyMetrics",
    NetworkUserParticipationDailyMetrics = "NetworkUserParticipationDailyMetrics",
}

// Note: (PeriodEndDate, NetworkUserTypeDescriptor) is the primary key
export interface NetworkMembershipDailyMetrics {
    NetworkId?: string;
    MetricsDate?: string; // this is actually the insertion date (PeriodEndDate + 1 day)
    PeriodEndDate?: string; // this is actually the date where the activity was generated
    NetworkUserTypeDescriptor?: string; // Internal or Partner or Customer
    LoginCount?: number;
    MemberCount?: number; // not populated (but should match "NewMemberCount")
    NewMemberCount?: number;
}

export interface NetworkActivityDailyMetrics {
    NetworkId?: string;
    MetricsDate?: string;
    PeriodEndDate?: string;
    NetworkUserDescNRecType?: string; // i005 or i0F9 or p005 or p0F9 or c005 or c0F9
    NetworkUserTypeDescriptor?: string; // Internal or Partner or Customer
    ParentType?: string; // User or CollaborationGroup
    PostCount?: number;
    NewPostCountCount?: number; // not populated (but should match "PostCount")
    CommentCount?: number;
    NewCommentCount?: number; // not populated (but should match "New Comment Count")
    NewQuestionCount?: number;
    NewAnswerCount?: number;
    NewBestAnswerCount?: number;
}

export interface NetworkUserParticipationDailyMetrics {
    NetworkId?: string;
    MetricsDate?: string;
    PeriodEndDate?: string;
    NetworkUserTypeNParticipationType?: string; // io or ic or po or pc or co or cc
    NetworkUserTypeDescriptor?: string; // Internal or Partner or Customer
    NetworkParticipationType?: string; // Observer or Contributor
    UserCount?: number;
}

export interface NetworkUniqueContributorDailyMetrics {
    NetworkId?: string;
    MetricsDate?: string;
    PeriodEndDate?: string;
    NetworkUserTypeDescriptor?: string; // Internal or Partner or Customer
    UniqueContributorCount?: number;
}

export interface NetworkPublicUsageDailyMetrics {
    NetworkId?: string;
    MetricsDate?: string;
    PeriodEndDate?: string;
    FormFactor?: string;
    PageViewDailyCount?: number;
    UniqueVisitorDailyCount?: number;
}

// public Key: (SearchTerm,UsedDeflection,Scope,NetworkUserType,HasResults)
export interface NetworkSearchQueryFrequency {
    NetworkId?: string;
    QueryDate?: string;
    AvgNumResults?: number;
    CountQueries?: number;
    HasResults?: boolean;
    NetworkUserType?: string;
    Scope?: string;
    SearchTerm?: string;
    UsedDeflection?: boolean;
}

export interface sfContext {
    hostname: string;
    apiURL: string;
    accessToken: string;
    networkId: string;
}

export function showError(document: Document, errorMsg: string) {
    getById(document, "errorMsg").innerHTML = errorMsg;
    getById(document, "errorPanel").style.display = "block";
}

export function sleep(timeout:number) {
    console.log(">> sleep");
    let begin = new Date();
    while (new Date().getTime() - begin.getTime() < timeout) {
    }
    console.log("<< sleep");
}

export function createElementFromHTML(htmlString:string) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}

export function getById(document: Document, idValue: string): any {
    //console.log(">> getById: idValue=[" + idValue + "]");
    let elt = document.getElementById(idValue);
    if (elt === null) {
        LogManager.getInstance().log("commonUtils.getById: WARNING: unknown id=[" + idValue + "]");
    }
    //console.log("<< getById: elt=[" + elt + "]");
    return elt;
}

export function dateToString(date: Date, includeHHMMSS: boolean = false): string {
    let displDay = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let displMonth = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
    let displYear = date.getFullYear();
    let result = displYear + "-" + displMonth + "-" + displDay;
    if (includeHHMMSS) {
        let displHours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        let displMinutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        let displSeconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        result += " " + displHours + ":" + displMinutes + ":" + displSeconds;
    }
    return result;
}
