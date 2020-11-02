const fs = require('fs');
import * as commonUtils from "../commonUtils";
import {LogManager} from "../log/LogManager";

export class ConfigManager {
    public static readonly NB_CONCURRENT_API_REQUESTS = 5;
// 'true' means that logs will be in /Users/lkubaski/Library/Application Support/Salesforce_Communities_Metrics_Injecter/Default/logs.txt
// 'false" means that logs will be in the current folder
    public static readonly STORE_LOGS_IN_LIBRARY_DIR = true;

    private readonly NADM_PATH;
    private readonly NMDM_PATH;
    private readonly NPUDM_PATH;
    private readonly NSQF_PATH;
    private readonly NUCDM_PATH;
    private readonly NUPDM_PATH;

    constructor(configDir: string) {
        this.NADM_PATH = configDir + "/NetworkActivityDailyMetrics.csv";
        this.NMDM_PATH = configDir + "/NetworkMembershipDailyMetrics.csv";
        this.NPUDM_PATH = configDir + "/NetworkPublicUsageDailyMetrics.csv";
        this.NSQF_PATH = configDir + "/NetworkSearchQueryFrequency.csv";
        this.NUCDM_PATH = configDir + "/NetworkUniqueContributorDailyMetrics.csv";
        this.NUPDM_PATH = configDir + "/NetworkUserParticipationDailyMetrics.csv";
    }

    processFile(path: string, onNextLineCallback:any) {
        LogManager.getInstance().log(">> ConfigManager.processFile: path=[" + path + "]");
        let fileAsString: string = fs.readFileSync(path, 'utf8');
        let lines: string[] = fileAsString.split("\n");
        for (let i = 1; i < lines.length; i++) { // skip CSV header
            if (lines[i].length === 0) continue; // skip empty line
            let lineElts = lines[i].split(",");
            onNextLineCallback(lineElts);
        }
        LogManager.getInstance().log("<< ConfigManager.processFile");
    }

    checkConfig() {
        let cwd = process.cwd();
        LogManager.getInstance().log(">> ConfigManager.checkConfig: cwd=[" + cwd + "]");
        let configs = [this.NADM_PATH, this.NMDM_PATH, this.NPUDM_PATH, this.NSQF_PATH, this.NUCDM_PATH, this.NUPDM_PATH];
        for (let i = 0; i < configs.length; i++) {
            if (!fs.existsSync(configs[i])) {
                throw new Error("cannot read configuration file=[" + configs[i] + "]");
            }
        }
        LogManager.getInstance().log("<< ConfigManager.checkConfig");
    }

    getNADMConfig(): commonUtils.NetworkActivityDailyMetrics[] {
        LogManager.getInstance().log(">> ConfigManager.getNADMConfig");
        let result: commonUtils.NetworkActivityDailyMetrics[] = [];
        this.processFile(this.NADM_PATH, function (lineElts: string[]) {
            let nadm: commonUtils.NetworkActivityDailyMetrics = {};
            nadm.NetworkUserDescNRecType = lineElts[0].trim();
            nadm.NetworkUserTypeDescriptor = lineElts[1].trim();
            nadm.ParentType = lineElts[2].trim();
            nadm.PostCount = Number.parseInt(lineElts[3]);
            nadm.CommentCount = Number.parseInt(lineElts[4]);
            nadm.NewQuestionCount = Number.parseInt(lineElts[5]);
            nadm.NewAnswerCount = Number.parseInt(lineElts[6]);
            nadm.NewBestAnswerCount = Number.parseInt(lineElts[7]);
            result.push(nadm);
        });
        //console.log("result=[" + JSON.stringify(result) + "]");
        LogManager.getInstance().log("<< ConfigManager.getNADMConfig: returning nbResults=" + result.length);
        return result;
    }

    getNMDMConfig(): commonUtils.NetworkMembershipDailyMetrics[] {
        LogManager.getInstance().log(">> ConfigManager.getNMDMConfig");
        let result: commonUtils.NetworkMembershipDailyMetrics[] = [];
        this.processFile(this.NMDM_PATH, function (lineElts: string[]) {
            let nmdm: commonUtils.NetworkMembershipDailyMetrics = {};
            nmdm.NetworkUserTypeDescriptor = lineElts[0].trim();
            nmdm.MemberCount = Number.parseInt(lineElts[1]);
            nmdm.LoginCount = Number.parseInt(lineElts[2]);
            nmdm.NewMemberCount = Number.parseInt(lineElts[3]);
            result.push(nmdm);
        });
        //console.log("result=[" + JSON.stringify(result) + "]");
        LogManager.getInstance().log("<< ConfigManager.getNMDMConfig: returning nbResults=" + result.length);
        return result;
    }

    getNPUDMConfig(): commonUtils.NetworkPublicUsageDailyMetrics[] {
        LogManager.getInstance().log(">> ConfigManager.getNPUDMConfig");
        let result: commonUtils.NetworkPublicUsageDailyMetrics[] = [];
        this.processFile(this.NPUDM_PATH, function (lineElts: string[]) {
            let npudm: commonUtils.NetworkPublicUsageDailyMetrics = {};
            npudm.FormFactor = lineElts[0].trim();
            npudm.PageViewDailyCount = Number.parseInt(lineElts[1]);
            npudm.UniqueVisitorDailyCount = Number.parseInt(lineElts[2]);
            result.push(npudm);
        });
        LogManager.getInstance().log("<< ConfigManager.getNPUDMConfig: returning nbResults=" + result.length);
        return result;
    }

    getNSQFConfig(): commonUtils.NetworkSearchQueryFrequency[] {
        LogManager.getInstance().log(">> ConfigManager.getNSQFConfig");
        let result: commonUtils.NetworkSearchQueryFrequency[] = [];
        this.processFile(this.NSQF_PATH, function (lineElts: string[]) {
            let npudm: commonUtils.NetworkSearchQueryFrequency = {};
            npudm.AvgNumResults = Number.parseFloat(lineElts[0]);
            npudm.CountQueries = Number.parseInt(lineElts[1]);
            npudm.HasResults = (lineElts[2].trim() === 'TRUE');
            npudm.NetworkUserType = lineElts[3].trim();
            npudm.Scope = lineElts[4].trim();
            npudm.SearchTerm = lineElts[5].trim();
            npudm.UsedDeflection = (lineElts[6].trim() === 'TRUE');
            result.push(npudm);
        });
        LogManager.getInstance().log("<< ConfigManager.getNSQFConfig: returning nbResults=" + result.length);
        return result;
    }

    getNUCDMConfig(): commonUtils.NetworkUniqueContributorDailyMetrics[] {
        LogManager.getInstance().log(">> ConfigManager.getNUCDMConfig");
        let result: commonUtils.NetworkUniqueContributorDailyMetrics[] = [];
        this.processFile(this.NUCDM_PATH, function (lineElts: string[]) {
            let npudm: commonUtils.NetworkUniqueContributorDailyMetrics = {};
            npudm.NetworkUserTypeDescriptor = lineElts[0].trim();
            npudm.UniqueContributorCount = Number.parseInt(lineElts[1]);
            result.push(npudm);
        });
        LogManager.getInstance().log("<< ConfigManager.getNUCDMConfig: returning nbResults=" + result.length);
        return result;
    }

     getNUPDMConfig(): commonUtils.NetworkUserParticipationDailyMetrics[] {
        LogManager.getInstance().log(">> ConfigManager.getNUPDMConfig");
        let result: commonUtils.NetworkUserParticipationDailyMetrics[] = [];
        this.processFile(this.NUPDM_PATH, function (lineElts: string[]) {
            let nupdm: commonUtils.NetworkUserParticipationDailyMetrics = {};
            nupdm.NetworkUserTypeNParticipationType = lineElts[0].trim();
            nupdm.NetworkUserTypeDescriptor = lineElts[1].trim();
            nupdm.NetworkParticipationType = lineElts[2].trim();
            nupdm.UserCount = Number.parseInt(lineElts[3]);
            result.push(nupdm);
        });
        LogManager.getInstance().log("<< ConfigManager.getNUPDMConfig: returning nbResults=" + result.length);
        return result;
    }

}
