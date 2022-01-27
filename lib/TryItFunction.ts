import * as child_process from 'child_process';
import * as path from 'path';
import * as os from 'os';

import { Stack, Duration } from 'aws-cdk-lib';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';

export default function TryItFunction(stack: Stack, vanityPhoneNumberGeneratorFunction: Function) {
    // ensure the node_modules folder exists
    var npm = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';
    try {
        child_process.execSync(`${npm} run build`, {
            env: process.env,
            cwd: path.join(__dirname, '..', 'lambdas', 'vanity_phonenumbers_api', 'src'),
            stdio: 'inherit'
        });
    }
    catch (error) {
        throw new Error('Build process failed.');
    }

    const tryItFunction = new Function(stack, "TryItFunction", {
        runtime: Runtime.NODEJS_14_X,
        handler: 'app.handler',
        code: Code.fromAsset(path.join(__dirname, '..', 'lambdas', 'vanity_phonenumbers_api', 'src')),
        tracing: Tracing.ACTIVE,
        environment: {
            'VANITY_PHONENUMBER_GENERATOR_FUNCTION_ARN': vanityPhoneNumberGeneratorFunction.functionArn
        },
        timeout: Duration.seconds(20)
    });

    tryItFunction.role?.attachInlinePolicy(
        new Policy(stack, 'TryItFunctionPolicy', {
            statements: [
                new PolicyStatement({
                    actions: [
                        'lambda:InvokeFunction',
                        'lambda:InvokeAsync'
                    ],
                    resources: [
                        vanityPhoneNumberGeneratorFunction.functionArn
                    ]
                })
            ]
        })
    );

    return tryItFunction;
}