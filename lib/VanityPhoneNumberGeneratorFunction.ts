import * as child_process from 'child_process';
import * as path from 'path';
import * as os from 'os';

import { Stack, Duration } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';

export default function VanityPhoneNumberGeneratorFunction(stack: Stack) {
    // ensure the node_modules folder exists
    var npm = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';
    try {
        child_process.execSync(`${npm} run build`, {
            env: process.env,
            cwd: path.join(__dirname, '..', 'lambdas', 'vanity_phonenumber_generator', 'src'),
            stdio: 'inherit'
        });
    }
    catch (error) {
        throw new Error('Build process failed.');
    }

    return new Function(stack, 'VanityPhoneNumberGeneratorFunction', {
        runtime: Runtime.NODEJS_14_X,
        handler: 'app.lambdaHandler',
        code: Code.fromAsset(path.join(__dirname, '..', 'lambdas', 'vanity_phonenumber_generator', 'src')),
        timeout: Duration.seconds(10)
    });
}