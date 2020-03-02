// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/

// Load the AWS SDK
const aws = require('aws-sdk');
aws.config.update({
  profile: process.env.AWS_PROFILE,
  region: process.env.REGION,
});
const client = new aws.SecretsManager();
const secretName = 'TOKENS/CODEBUILD/GithubToken';
const { config } = require('./../config');
const { githubToken } = config.secretsManager;
let response;

async function createGitTokenSecret() {
  console.log(`Creating Github Token name ${secretName}: ${githubToken}`);
  const secret = await client
    .createSecret({
      Name: secretName,
      Description: 'Github Token for New Era Code Org',
      SecretString: githubToken,
    })
    .promise();

  return secret;
}

// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.
async function githubSecret() {
  try {
    const data = await client.getSecretValue({ SecretId: secretName }).promise();
    if ('SecretString' in data) {
      console.log(`Github token exists and is ${data.SecretString}`);
      return data.SecretString;
    }

    const buff = Buffer.from(data.SecretBinary, 'base64');
    console.log(`Github token exists and is ${buff.toString('ascii')}`);
    return buff.toString('ascii');
  } catch (err) {
    switch (err.code) {
      case 'DecryptionFailureException':
      case 'InternalServiceErrorException':
      case 'InvalidParameterException':
      case 'InvalidRequestException':
        console.log(err.message);
        return err;
      case 'ResourceNotFoundException':
        response = await createGitTokenSecret();
        console.log(response, `Github Token secret created`);
        return response;
      default:
        console.log(err);
        return err;
    }
  }
}

module.exports.githubSecret = githubSecret;
