// aws codebuild import-source-credentials --server-type GITHUB --auth-type PERSONAL_ACCESS_TOKEN --token <token_value>

// Load the AWS SDK
const aws = require('aws-sdk');
aws.config.update({
  profile: process.env.AWS_PROFILE,
  region: process.env.REGION,
});
const codebuild = new aws.CodeBuild();
const { config } = require('./../config');
const { githubToken } = config.secretsManager;

async function importGithubCreds() {
  try {
    console.log(`Importing Github Token ${githubToken} to codebuild`);
    return await codebuild
      .importSourceCredentials({
        authType: 'PERSONAL_ACCESS_TOKEN',
        serverType: 'GITHUB',
        token: githubToken,
      })
      .promise();
  } catch (err) {
    console.log(err, `There was a problem importing Github Token ${githubToken} to codebuild`);
    return err;
  }
}

module.exports.importGithubCreds = importGithubCreds;
