import * as child_process from 'child_process';
import * as path from 'path';
import * as os from 'os';

import { Stack, Duration } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';

export default function ResponseOrchestrationFunction(stack: Stack, applicationTable: Table, vanityPhoneNumberGeneratorFunction: Function) {
    // ensure the node_modules folder exists
    var npm = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';
    try {
        child_process.execSync(`${npm} run build`, {
            env: process.env, cwd: path.join(__dirname, '..', 'lambdas', 'response_orchestrator', 'src'),
            stdio: 'inherit'
        });
    }
    catch (error) {
        throw new Error('Build process failed.');
    }

    const responseOrchestrationFunction = new Function(stack, 'ResponseOrchestrationFunction', {
        runtime: Runtime.NODEJS_14_X,
        handler: 'app.lambdaHandler',
        code: Code.fromAsset(path.join(__dirname, '..', 'lambdas', 'response_orchestrator', 'src')),
        timeout: Duration.seconds(20),
        environment: {
            APPLICATION_TABLE_NAME: applicationTable.tableName,
            VANITY_PHONENUMBER_GENERATOR_FUNCTION_ARN: vanityPhoneNumberGeneratorFunction.functionArn
        }
    });

    responseOrchestrationFunction.role?.attachInlinePolicy(
        new Policy(stack, 'ResponseOrchestrationFunctionPolicy', {
            statements: [
                new PolicyStatement({
                    actions: [
                        'lambda:InvokeFunction',
                        'lambda:InvokeAsync'
                    ],
                    resources: [
                        vanityPhoneNumberGeneratorFunction.functionArn
                    ]
                }),
                new PolicyStatement({
                    actions: [
                        'dynamodb:GetItem',
                        'dynamodb:PutItem'
                    ],
                    resources: [
                        applicationTable.tableArn
                    ]
                })
            ]
        })
    );

    return responseOrchestrationFunction;
}