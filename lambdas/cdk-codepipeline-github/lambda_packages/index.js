const aws = require('aws-sdk');
const axios = require('axios');

const BaseURL = 'https://api.github.com/repos';
// These are used for test purposes only
let defaultResponseURL;

const codepipeline = new aws.CodePipeline();

const Password = process.env.ACCESS_TOKEN;

/**
 * Upload a CloudFormation response for a Custom Resource
 *
 * @param {object} event the Lambda event payload received by the handler function
 * @param {object} context the Lambda context received by the handler function
 * @param {string} responseStatus the response status, either 'SUCCESS' or 'FAILED'
 * @param {string} physicalResourceId CloudFormation physical resource ID
 * @param {object} [responseData] arbitrary response data object
 * @param {string} [reason] reason for failure, if any, to convey to the user.
 * @returns {Promise} Promise that is resolved on success, or rejected on connection error or HTTP error response
 */
const report = function customConstructResponse(
  event,
  context,
  responseStatus,
  physicalResourceId,
  responseData,
  reason,
) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const { URL } = require('url');

    const responseBody = JSON.stringify({
      Status: responseStatus,
      Reason: reason,
      PhysicalResourceId: physicalResourceId || context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: responseData,
    });

    const parsedUrl = new URL(event.ResponseURL || defaultResponseURL);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'PUT',
      headers: {
        'Content-Type': '',
        'Content-Length': responseBody.length,
      },
    };

    https
      .request(options)
      .on('error', reject)
      .on('response', res => {
        res.resume();
        if (res.statusCode >= 400) {
          reject(new Error(`Server returned error ${res.statusCode}: ${res.statusMessage}`));
        } else {
          resolve();
        }
      })
      .end(responseBody, 'utf8');
  });
};

/**
 * Takes a Codepipeline status event, transforms it to
 * a Github status API payload request and POSTs it
 * to Github as a webhook
 */
exports.handler = async (event, context) => {
  console.log(`REQUEST RECEIVED:\n${JSON.stringify(event)}`);
  const responseData = {};
  let physicalResourceId;

  try {
    switch (event.RequestType) {
      case 'Create':
      case 'Update':
        const {
          region,
          detail: { pipeline: pipelineName, 'execution-id': executionId, state } = {},
        } = event.ResourceProperties;
        physicalResourceId = executionId;
        const transformedState = transformState(state);

        if (transformedState !== null) {
          const result = await this.getPipelineExecution(pipelineName, executionId);
          if (result) {
            const { owner, repository, sha } = result;
            const payload = createPayload(pipelineName, region, state);
            await this.postStatusToGitHub(owner, repository, sha, payload);
          }
          await report(event, context, 'SUCCESS', physicalResourceId, responseData);
        }

        break;
      case 'Delete':
        console.log('DELETE!');
        await report(event, context, 'SUCCESS', physicalResourceId, responseData);
        break;
      default:
        throw new Error(`Unsupported request type ${event.RequestType}`);
    }
  } catch (err) {
    console.log(`Caught error ${err}.`);
    await report(event, context, 'FAILED', physicalResourceId, null, err.message);
  }
};

/**
 * transformState returns a github api friendly
 * alternative
 * @param {string} state even state from codepipeline
 * @returns {null}
 */
function transformState(state) {
  switch (state) {
    case 'STARTED':
      return 'pending';
    case 'SUCCEEDED':
      return 'success';
    case 'FAILED':
      return 'failure';
    default:
      return null;
  }
}

/**
 * createPayload formats a payload for the github status api request
 * @param {string} pipelineName the pipeline name the event is origionating from
 * @param {string} region region pipeline has been deployed to
 * @param {string} status github api status
 * @returns {object} payload sent to github status api
 */
function createPayload(pipelineName, region, status) {
  console.log('status', status);
  let description;
  if (status === 'started') {
    description = 'Build started';
  } else if (status === 'success') {
    description = 'Build succeeded';
  } else if (status === 'failure') {
    description = 'Build failed!';
  }

  return {
    state: status,
    target_url: buildCodePipelineUrl(pipelineName, region),
    description,
    context: 'continuous-integration/codepipeline',
  };
}

function buildCodePipelineUrl(pipelineName, region) {
  return `https://${region}.console.aws.amazon.com/codepipeline/home?region=${region}#/view/${pipelineName}`;
}

exports.getPipelineExecution = async (pipelineName, executionId) => {
  const params = {
    pipelineName,
    pipelineExecutionId: executionId,
  };

  const result = await codepipeline.getPipelineExecution(params).promise();
  const artifactRevision = result.pipelineExecution.artifactRevisions[0];

  const revisionURL = artifactRevision.revisionUrl;
  const sha = artifactRevision.revisionId;

  const pattern = /github.com\/(.+)\/(.+)\/commit\//;
  const matches = pattern.exec(revisionURL);

  return {
    owner: matches[1],
    repository: matches[2],
    sha,
  };
};

exports.postStatusToGitHub = async (owner, repository, sha, payload) => {
  const url = `/${owner}/${repository}/statuses/${sha}`;
  const config = {
    baseURL: BaseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      password: Password,
    },
  };

  try {
    const res = await axios.post(url, payload, config);
    const { status } = res;
    const configData = res.config ? JSON.parse(res.config.data) : undefined;
    const body = { configData };
    console.log(body);
    return {
      statusCode: status,
      body: JSON.stringify(body),
    };
  } catch (e) {
    console.log(e.message);
    return {
      statusCode: 400,
      body: JSON.stringify(e.message),
    };
  }
};

/**
 * @private
 */
exports.withDefaultResponseURL = function(url) {
  defaultResponseURL = url;
};
