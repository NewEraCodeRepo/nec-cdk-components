### CDK Documentation

CDK Getting Started Guide: https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html

### CDK Setup

Install the AWS CDK the latest version globally

```
npm install -g aws-cdk
```

### CDK Update

Check CDK version

```
cdk --version
```

Update the npm dependencies

```
npm-check-updates -u
```

Install npm modules again

```
npm install
```

## CDK Deployment & Cleanup

**IMPORTANT REQUIREMENT:**
Setup and destroy scripts require [jq](https://stedolan.github.io/jq/):
To install on Mac OS: `brew install jq`

### Deployment

```bash
npm run setup 
npm run build
npm run test
npm run bootstrap # only run if first cdk project in environment
npm run deploy
```

### Cleanup stack:

```bash
cd aws-cdk
npm run destroy:stack
```

### Deleting CDKToolkit Stack

```bash
cd aws-cdk
npm run destroy:toolkit
```
