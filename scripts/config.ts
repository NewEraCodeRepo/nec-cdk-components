import * as dotenv from 'dotenv';
import path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export interface IConfig {
  githubConfig: {
    githubBranch: string;
    githubOwner: string;
    githubRepo: string;
  },
  nodeConfig: {
    configProd: string;
    logLevel: string;
    nodeEnv: string;
    yarnProd: string;
  },
  secretParams: {
    npmToken: string;
  },
  secretsManager: {
    githubToken: string;
  }
}

export const config: IConfig = {
  githubConfig: {
    githubBranch: process.env.GITHUB_BRANCH || 'develop',
    githubOwner: process.env.GITHUB_OWNER || 'NewEraCode-Holdings',
    githubRepo: process.env.GITHUB_REPO || 'kh-cdk-components',
  },
  nodeConfig: {
    configProd: process.env.NPM_CONFIG_PRODUCTION || 'false',
    logLevel: process.env.NPM_CONFIG_LOGLEVEL || 'error',
    nodeEnv: process.env.NODE_ENV || 'development',
    yarnProd: process.env.YARN_PRODUCTION || 'false',
  },
  secretParams: {
    npmToken: process.env.NPM_TOKEN as string,
  },
  secretsManager: {
    githubToken: process.env.GITHUB_TOKEN as string,
  }
};
