import { App } from 'aws-cdk-lib';
import { AppStack } from './stacks/app-stack';

const app = new App();
new AppStack(app, 'quick-budget-cdk-prod', {
  transient: false,
  envName: 'prod',
  env: {
    region: 'eu-west-2',
    account: '661272765443'
  }
});
