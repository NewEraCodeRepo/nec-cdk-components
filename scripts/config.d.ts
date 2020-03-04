export interface IConfig {
    githubConfig: {
        githubBranch: string;
        githubOwner: string;
        githubRepo: string;
    };
    nodeConfig: {
        configProd: string;
        logLevel: string;
        nodeEnv: string;
        yarnProd: string;
    };
    secretParams: {
        npmToken: string;
    };
    secretsManager: {
        githubToken: string;
    };
}
export declare const config: IConfig;
