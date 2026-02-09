#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MonthGoalTrackerStack } from '../lib/month-goal-tracker-stack';

const app = new cdk.App();

new MonthGoalTrackerStack(app, 'MonthGoalTrackerStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Infrastructure for Month Goal Tracker App',
});
