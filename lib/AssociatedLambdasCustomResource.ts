import * as child_process from 'child_process';
import * as path from 'path';
import * as os from 'os';

import { Stack, Duration, CustomResource } from 'aws-cdk-lib';
import { Code, Function, Runtime, SingletonFunction } from 'aws-cdk-lib/aws-lambda';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Provider } from 'aws-cdk-lib/custom-resources';

import { ConnectInstance } from './ConnectInstance';

/**
 * 
 * @param stack 
 * @param connectInstance 
 * @param responseOrchestrationFunction 
 * @returns 
 */
export default function AssociatedLambdasCustomResource(stack: Stack, connectInstance: ConnectInstance, responseOrchestrationFunction: Function) {
    // ensure the node_modules folder exists
    var npm = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';
    child_process.spawn(npm, ['run', 'build'], { env: process.env, cwd: path.join(__dirname, '..', 'lambdas', 'custom_resource_associated_lambdas', 'src'), stdio: 'inherit' })

    const associatedLambdasCustomResourceFunction = new SingletonFunction(stack, 'AssociatedLambdasCustomResourceFunction', {
        uuid: 'b71500fc-0a4a-4364-8abd-8eb3f3a0bbdb',
        code: Code.fromAsset(path.join(__dirname, '..', 'lambdas', 'custom_resource_associated_lambdas', 'src')),
        handler: 'app.handler',
        timeout: Duration.seconds(300),
        runtime: Runtime.NODEJS_14_X
    });

    const policy = new Policy(stack, 'AssociatedLambdasCustomResourcePolicy', {
        statements: [
            new PolicyStatement({
                actions: [
                    'lambda:*' // todo: determine exactly what is required here to allow associate-lambda-function
                ],
                resources: [responseOrchestrationFunction.functionArn]
            }),
            new PolicyStatement({
                actions: [
                    'connect:AssociateLambdaFunction',
                    'connect:DisassociateLambdaFunction'
                ],
                resources: [connectInstance.instanceArn]
            })
        ]
    });

    associatedLambdasCustomResourceFunction.role?.attachInlinePolicy(policy);

    const associatedLambdasCustomResourceProvider = new Provider(stack, 'AssociatedLambdasCustomResourceProvider', {
        onEventHandler: associatedLambdasCustomResourceFunction
    });

    const resource = new CustomResource(stack, 'AssociatedLambdasCustomResource', {
        serviceToken: associatedLambdasCustomResourceProvider.serviceToken,
        properties: {
            InstanceId: connectInstance.instanceId,
            LambdaFunctionArns: [
                responseOrchestrationFunction.functionArn
            ]
        }
    });

    // to prevent not authorized errors on delete (policy being deleted before resource)
    resource.node.addDependency(associatedLambdasCustomResourceFunction);
    associatedLambdasCustomResourceFunction.node.addDependency(policy);
    resource.node.addDependency(policy);
    return resource;
}