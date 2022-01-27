import * as child_process from 'child_process';
import * as path from 'path';
import * as os from 'os';

import { Stack, Duration } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';

export default function RecentHistoryFunction(stack: Stack, applicationTable: Table) {
    // ensure the node_modules folder exists
    var npm = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';
    try {
        child_process.execSync(`${npm} run build`, {
            env: process.env,
            cwd: path.join(__dirname, '..', 'lambdas', 'calls_api', 'src'),
            stdio: 'inherit'
        });
    }
    catch (error) {
        throw new Error('Build process failed.')
    }

    const recentHistoryFunction = new Function(stack, "RecentHistoryFunction", {
        runtime: Runtime.NODEJS_14_X,
        handler: 'app.handler',
        code: Code.fromAsset(path.join(__dirname, '..', 'lambdas', 'calls_api', 'src')),
        tracing: Tracing.ACTIVE,
        environment: {
            'APPLICATION_TABLE_NAME': applicationTable.tableName
        },
        timeout: Duration.seconds(60)
    });

    recentHistoryFunction.role?.attachInlinePolicy(
        new Policy(stack, 'RecentHistoryFunctionPolicy', {
            statements: [
                new PolicyStatement({
                    actions: [
                        'dynamodb:GetItem'
                    ],
                    resources: [
                        applicationTable.tableArn
                    ]
                })
            ]
        })
    );

    return recentHistoryFunction;
}