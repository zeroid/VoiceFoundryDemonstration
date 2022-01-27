import { App, CfnOutput, CfnParameter, Stack, StackProps } from 'aws-cdk-lib';

import ConnectInstance from './ConnectInstance';
import ApplicationTable from './ApplicationTable';
import VanityPhoneNumberGeneratorFunction from './VanityPhoneNumberGeneratorFunction';
import ResponseOrchestrationFunction from './ResponseOrchestrationFunction';
import RecentHistoryFunction from './RecentHistoryFunction';
import TryItFunction from './TryItFunction';
import WebClientApi from './WebClientApi';
import WebClientBucket from './WebClientBucket';
import AssociatedLambdasCustomResource from './AssociatedLambdasCustomResource';
import ContactFlowCustomResource from './ContactFlowCustomResource';
import WebClientCloudFrontDistribution from './WebClientCloudFrontDistribution';

/**
 * VoiceFoundryDemonstrationStack class
 */
export class VoiceFoundryDemonstrationStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        const AWS_CONNECT_INSTANCE_ARN = new CfnParameter(this, 'AwsConnectInstanceArn', {
            type: 'String',
            description: 'The ARN of the AWS Connect instance',
        });

        const CONTACT_FLOW_NAME = new CfnParameter(this, 'ContactFlowName', {
            type: 'String',
            description: 'The name of the contact flow to create',
        });

        const connectInstance = ConnectInstance(AWS_CONNECT_INSTANCE_ARN.valueAsString);

        const applicationTable = ApplicationTable(this);

        const vanityPhoneNumberGeneratorFunction = VanityPhoneNumberGeneratorFunction(this);
        const responseOrchestrationFunction = ResponseOrchestrationFunction(this, applicationTable, vanityPhoneNumberGeneratorFunction);
        const recentHistoryFunction = RecentHistoryFunction(this, applicationTable);
        const tryItFunction = TryItFunction(this, vanityPhoneNumberGeneratorFunction);

        const webClientApi = WebClientApi(this, recentHistoryFunction, tryItFunction);
        const webClientBucket = WebClientBucket(this);

        const webClientCloudFrontDistribution = WebClientCloudFrontDistribution(this, webClientBucket, webClientApi);

        const associatedLambdasCustomResource = AssociatedLambdasCustomResource(this, connectInstance, responseOrchestrationFunction);

        const contactFlowCustomResource = ContactFlowCustomResource(this, connectInstance, CONTACT_FLOW_NAME.valueAsString, responseOrchestrationFunction);
        contactFlowCustomResource.node.addDependency(associatedLambdasCustomResource); // ensure lambdas are associated with Connect instance before creating contact flow

        new CfnOutput(this, 'ApplicationUrl', {
            value: `https://${webClientCloudFrontDistribution.distributionDomainName}/`
        });

        new CfnOutput(this, 'locals.json', {
            value: JSON.stringify({
                "GetCallsFunction": {
                    "APPLICATION_TABLE_NAME": applicationTable.tableName
                },
                "TryItFunction": {
                    "VANITY_PHONENUMBER_GENERATOR_FUNCTION_ARN": vanityPhoneNumberGeneratorFunction.functionArn
                },
                "ResponseOrchestrationFunction": {
                    "VANITY_PHONENUMBER_GENERATOR_FUNCTION_ARN": vanityPhoneNumberGeneratorFunction.functionArn,
                    "APPLICATION_TABLE_NAME": applicationTable.tableName
                }
            })
        });
    }
}
