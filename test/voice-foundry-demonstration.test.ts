import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions'

import * as AwsSamCliCdkVoiceFoundry from '../lib/VoiceFoundryDemonstrationStack';

test('Empty Stack', () => {
    const stack = new AwsSamCliCdkVoiceFoundry.VoiceFoundryDemonstrationStack(new App(), 'VoiceFoundryDemonstrationStack');
    const template = Template.fromStack(stack);
    template.templateMatches({
        Resources: {

        }
    })
});
