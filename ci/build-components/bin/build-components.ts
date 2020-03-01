#!/usr/bin/env node
/* tslint:disable:no-unused-expression */
import { App, Environment, Tag } from '@aws-cdk/core';
import { config } from './../../../scripts/config';
import { BuildComponentsStack } from './../lib/build-components-stack';

const app = new App();

const env: Environment = {
  account: app.node.tryGetContext('account'),
  region: app.node.tryGetContext('region'),
};

// Stack description
const description = 'Builds a CI/CD platform that publishes cdk modules to a private npm registry';

const buildComponentsStack = new BuildComponentsStack(app, 'BuildComponentsStack', { config, env, description });

// Add a tag to all constructs in the stack
Tag.add(buildComponentsStack, 'Project', 'CDKComponents');
