#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { VoiceFoundryDemonstrationStack } from '../lib/VoiceFoundryDemonstrationStack';

const app = new App();
new VoiceFoundryDemonstrationStack(app, 'VoiceFoundryDemonstrationStack');
