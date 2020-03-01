/* eslint-disable no-restricted-syntax */
const aws = require('aws-sdk');
aws.config.update({
  profile: process.env.AWS_PROFILE,
  region: process.env.REGION,
});
const ssm = new aws.SSM();
const secretName = '/TOKENS/CODEBUILD/ReadWriteNpmToken';
const { config } = require('../config');
const { npmToken } = config.secretParams;

async function validateNpmParam() {
  return ssm.describeParameters({
    ParameterFilters: [
      {
        Key: "Name",
        Values: [secretName],
      },
    ]
  }).promise();
}

async function createNpmParam() {
  console.log(`Creating NpmToken Token name ${secretName}: ${npmToken}`);
  return ssm.putParameter({
    Name: secretName,
    Type: 'SecureString',
    Value: npmToken,
    Overwrite: true,
  })
  .promise();
}

/**
 * Puts secure environment variables
 * in the parameter store
 * @see{@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SSM.html#putParameter-property}
 * @returns {Promise} Promise
 */
async function npmSecret() {
  try {
    const data = await validateNpmParam();
    if (data.Parameters.length > 0) {
      console.log("Npm token already exists");
    } else {
      return await createNpmParam();
    }
  } catch (err) {
      console.log(err, err.stack);
      return err;
  }
}

module.exports.npmSecret = npmSecret;
