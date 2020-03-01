/* eslint-disable import/no-unresolved */
const sinon = require('sinon');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const LambdaTester = require('lambda-tester').noVersionCheck();
const nock = require('nock');
const app = require('../index');
const startedEvent = require('./started-event.json');
const succeededEvent = require('./succeeded-event.json');
const failedEvent = require('./failed-event.json');

/**
 * Tests a Codepipeline status event, transforms it to
 * a Github status API payload request and POSTs it
 * to Github as a webhook
 */
describe('Codepipeline Github Handler', () => {
  const origLog = console.log;
  const testRequestId = 'f4ef1b10-c39a-44e3-99c0-fbf7e53c3943';
  const ResponseURL = 'https://cloudwatch-response-mock.example.com/';
  let getPipelineExecutionStub;
  let postStatusToGitHubStub;
  const mockAxios = new MockAdapter(axios);
  let url;
  const mockPipelineData = {
    owner: 'some-owner',
    repository: 'some-repo',
    sha: 'f94d5b6565659d4b84c59b641b811254a2588e4e',
  };

  beforeEach(() => {
    app.withDefaultResponseURL(ResponseURL);
    console.log = function() {};
    getPipelineExecutionStub = sinon.stub(app, 'getPipelineExecution').callsFake(() => mockPipelineData);
    postStatusToGitHubStub = sinon.stub(app, 'postStatusToGitHub');
    url = `/${mockPipelineData.repository}/${mockPipelineData.repository}/statuses/${mockPipelineData.sha}`;
    mockAxios.onPost(url).reply(201);
  });

  afterEach(() => {
    getPipelineExecutionStub.restore();
    postStatusToGitHubStub.restore();
    mockAxios.resetHistory();
    console.log = origLog;
  });

  it('If request type is create, will produce a pending status update', async () => {
    const request = nock(ResponseURL)
      .put('/', body => body.Status === 'SUCCESS')
      .reply(200);

    return LambdaTester(app.handler)
      .event({
        RequestType: 'Create',
        RequestId: testRequestId,
        ResourceProperties: startedEvent,
      })
      .expectResolve(() => {
        postStatusToGitHubStub.callsFake((owner, repository, sha, payload) => {
          expect(owner).toEqual('some-owner');
          expect(repository).toEqual('some-repo');
          expect(sha).toEqual('f94d5b6565659d4b84c59b641b811254a2588e4e');
          expect(typeof 'payload').toBe('object');
          expect(payload.state).toEqual('pending');
          expect(payload.target_url).toEqual(
            'https://us-east-1.console.aws.amazon.com/codepipeline/home?region=us-east-1#/view/some-pipeline',
          );
          expect(payload.context).toEqual('continuous-integration/codepipeline');
        });
        postStatusToGitHubStub.returns({ statusCode: 201 });
        expect(request.isDone()).toBe(true);
      });
  });

  it('if request type is update and event state is success, will produce a successful status update', async () => {
    const request = nock(ResponseURL)
      .put('/', body => body.Status === 'SUCCESS')
      .reply(200);

    return LambdaTester(app.handler)
      .event({
        RequestType: 'Update',
        RequestId: testRequestId,
        ResourceProperties: succeededEvent,
      })
      .expectResolve(() => {
        postStatusToGitHubStub.callsFake((owner, repository, sha, payload) => {
          expect(owner).toEqual('some-owner');
          expect(repository).toEqual('some-repo');
          expect(sha).toEqual('f94d5b6565659d4b84c59b641b811254a2588e4e');
          expect(typeof 'payload').toBe('object');
          expect(payload.state).toEqual('success');
          expect(payload.target_url).toEqual(
            'https://us-east-1.console.aws.amazon.com/codepipeline/home?region=us-east-1#/view/some-pipeline',
          );
          expect(payload.context).toEqual('continuous-integration/codepipeline');
        });
        postStatusToGitHubStub.returns({ statusCode: 201 });
        expect(request.isDone()).toBe(true);
      });
  });

  it('if request type is update and event state is failure, will produce a failure status update', async () => {
    const request = nock(ResponseURL)
      .put('/', body => body.Status === 'SUCCESS')
      .reply(200);

    return LambdaTester(app.handler)
      .event({
        RequestType: 'Update',
        RequestId: testRequestId,
        ResourceProperties: failedEvent,
      })
      .expectResolve(() => {
        postStatusToGitHubStub.callsFake((owner, repository, sha, payload) => {
          expect(owner).toEqual('some-owner');
          expect(repository).toEqual('some-repo');
          expect(sha).toEqual('f94d5b6565659d4b84c59b641b811254a2588e4e');
          expect(typeof 'payload').toBe('object');
          expect(payload.state).toEqual('failure');
          expect(payload.target_url).toEqual(
            'https://us-east-1.console.aws.amazon.com/codepipeline/home?region=us-east-1#/view/some-pipeline',
          );
          expect(payload.context).toEqual('continuous-integration/codepipeline');
        });
        postStatusToGitHubStub.returns({ statusCode: 201 });
        expect(request.isDone()).toBe(true);
      });
  });

  it('Fails if the event payload is empty', async () => {
    const request = nock(ResponseURL)
      .put('/', body => body.Status === 'FAILED' && body.Reason === 'Unsupported request type undefined')
      .reply(200);
    return LambdaTester(app.handler)
      .event({})
      .expectResolve(() => {
        expect(request.isDone()).toBe(true);
      });
  });

  it('Fails if the request type is invalid', async () => {
    const invalidType = 'invalid';
    const request = nock(ResponseURL)
      .put('/', body => body.Status === 'FAILED' && body.Reason === `Unsupported request type ${invalidType}`)
      .reply(200);
    return LambdaTester(app.handler)
      .event({
        RequestType: 'invalid',
      })
      .expectResolve(() => {
        expect(request.isDone()).toBe(true);
      });
  });
});
