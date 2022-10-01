import { App } from 'aws-cdk-lib';
import { AppStack } from './stacks/app-stack';

const app = new App();
new AppStack(app, 'quick-budget-cdk', {
  transient: false,
  env: {
    region: 'eu-west-2'
  }
});
