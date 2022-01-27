import * as path from 'path';
import { Stack, Duration, CustomResource } from 'aws-cdk-lib';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime, SingletonFunction } from 'aws-cdk-lib/aws-lambda';

import { ConnectInstance } from './ConnectInstance';

/**
 * ContactFlow
 * @param stack The deployment stack
 * @param connectInstance The AWS Connect instance that this contact flow will be created in
 * @param CONTACT_FLOW_NAME The name to assign to the new contact flow
 * @param responseOrchestrationFunction The response orchestration function that will be called from the contact flow
 * @returns The contact flow custom resource
 */
export default function ContactFlowCustomResource(stack: Stack, connectInstance: ConnectInstance, CONTACT_FLOW_NAME: string, responseOrchestrationFunction: Function) {
    // aws connect contact flow
    const customResourceFunction = new SingletonFunction(stack, 'ContactFlowCustomResourceFunction', {
        uuid: 'f9949ce0-8f1c-45b9-b0e9-8310df28c13b',
        code: Code.fromAsset(path.join(__dirname, '..', 'lambdas', 'custom_resource_contact_flow', 'src')),
        handler: 'app.handler',
        timeout: Duration.seconds(300),
        runtime: Runtime.NODEJS_14_X
    });

    const policy = new Policy(stack, 'ContactFlowCustomResourcePolicy', {
        statements: [
            new PolicyStatement({
                actions: [
                    'lambda:*' // todo: determine exactly what is required here to allow associate-lambda-function
                ],
                resources: [responseOrchestrationFunction.functionArn]
            }),
            new PolicyStatement({
                actions: [
                    'connect:AssociateLambdaFunction'
                ],
                resources: [connectInstance.instanceArn]
            }),
            new PolicyStatement({
                actions: [
                    'connect:CreateContactFlow',
                    'connect:UpdateContactFlowName',
                    'connect:UpdateContactFlowMetadata',
                    'connect:UpdateContactFlowContent',
                    'connect:DeleteContactFlow'
                ],
                resources: [`${connectInstance.instanceArn}/contact-flow/*`]
            })
        ]
    });

    customResourceFunction.role?.attachInlinePolicy(policy);

    const customResourceProvider = new Provider(stack, 'ContactFlowCustomResourceProvider', {
        onEventHandler: customResourceFunction
    });

    enum ContactFlowType {
        AGENT_HOLD = 'AGENT_HOLD',
        AGENT_TRANSFER = 'AGENT_TRANSFER',
        AGENT_WHISPER = 'AGENT_WHISPER',
        CONTACT_FLOW = 'CONTACT_FLOW',
        CUSTOMER_HOLD = 'CUSTOMER_HOLD',
        CUSTOMER_QUEUE = 'CUSTOMER_QUEUE',
        CUSTOMER_WHISPER = 'CUSTOMER_WHISPER',
        OUTBOUND_WHISPER = 'OUTBOUND_WHISPER',
        QUEUE_TRANSFER = 'QUEUE_TRANSFER'
    };
    const resource = new CustomResource(stack, 'ContactFlowCustomResource', {
        serviceToken: customResourceProvider.serviceToken,
        properties: {
            InstanceId: connectInstance.instanceId,
            Name: CONTACT_FLOW_NAME,
            Description: 'Demonstration contact flow for Voice Foundry project',
            Type: ContactFlowType.CONTACT_FLOW,
            Content: JSON.stringify({
                "Version": "2019-10-30",
                "StartAction": "efa7d3c6-7420-42a0-ab0a-af80d4443dab",
                "Metadata": {
                    "entryPointPosition": {
                        "x": 20,
                        "y": 20
                    },
                    "snapToGrid": false,
                    "ActionMetadata": {
                        "efa7d3c6-7420-42a0-ab0a-af80d4443dab": {
                            "position": {
                                "x": 163,
                                "y": 22
                            }
                        },
                        "c76c094f-89f8-4819-bf47-b838d3e6a52f": {
                            "position": {
                                "x": 381,
                                "y": 21
                            },
                            "overrideConsoleVoice": false,
                            "defaultVoice": "Conversational"
                        },
                        "0218ffce-29f1-4bf9-9026-457f7016b29c": {
                            "position": {
                                "x": 603,
                                "y": 23
                            },
                            "useDynamic": false
                        },
                        "f9829998-ae3d-4615-b216-850ff6a6d4c4": {
                            "position": {
                                "x": 824,
                                "y": 23
                            },
                            "dynamicMetadata": {},
                            "useDynamic": false
                        },
                        "34fb3054-81d1-42e1-b296-bc0d989cd566": {
                            "position": {
                                "x": 1043,
                                "y": 23
                            },
                            "useDynamic": true
                        },
                        "e0232544-96a4-4e9e-8d30-4b2351485d3a": {
                            "position": {
                                "x": 1263,
                                "y": 23
                            },
                            "useDynamic": false
                        },
                        "15b54b6b-822f-4121-8a74-a975e4d30bba": {
                            "position": {
                                "x": 1042,
                                "y": 184
                            },
                            "useDynamic": false
                        },
                        "4e9618b6-85f1-4082-bf2d-ffc8a0b4b24c": {
                            "position": {
                                "x": 1265,
                                "y": 222
                            }
                        }
                    }
                },
                "Actions": [{
                    "Identifier": "efa7d3c6-7420-42a0-ab0a-af80d4443dab",
                    "Parameters": {
                        "FlowLoggingBehavior": "Enabled"
                    },
                    "Transitions": {
                        "NextAction": "c76c094f-89f8-4819-bf47-b838d3e6a52f",
                        "Errors": [],
                        "Conditions": []
                    },
                    "Type": "UpdateFlowLoggingBehavior"
                }, {
                    "Identifier": "c76c094f-89f8-4819-bf47-b838d3e6a52f",
                    "Parameters": {
                        "TextToSpeechVoice": "Joanna"
                    },
                    "Transitions": {
                        "NextAction": "0218ffce-29f1-4bf9-9026-457f7016b29c",
                        "Errors": [],
                        "Conditions": []
                    },
                    "Type": "UpdateContactTextToSpeechVoice"
                }, {
                    "Identifier": "0218ffce-29f1-4bf9-9026-457f7016b29c",
                    "Parameters": {
                        "Text": "Welcome to the vanity phone-number demonstration for Voice Foundry."
                    },
                    "Transitions": {
                        "NextAction": "f9829998-ae3d-4615-b216-850ff6a6d4c4",
                        "Errors": [],
                        "Conditions": []
                    },
                    "Type": "MessageParticipant"
                }, {
                    "Identifier": "f9829998-ae3d-4615-b216-850ff6a6d4c4",
                    "Parameters": {
                        "LambdaFunctionARN": responseOrchestrationFunction.functionArn,
                        "InvocationTimeLimitSeconds": "8"
                    },
                    "Transitions": {
                        "NextAction": "34fb3054-81d1-42e1-b296-bc0d989cd566",
                        "Errors": [{
                            "NextAction": "15b54b6b-822f-4121-8a74-a975e4d30bba",
                            "ErrorType": "NoMatchingError"
                        }],
                        "Conditions": []
                    },
                    "Type": "InvokeLambdaFunction"
                }, {
                    "Identifier": "34fb3054-81d1-42e1-b296-bc0d989cd566",
                    "Parameters": {
                        "SSML": "$.External.speech"
                    },
                    "Transitions": {
                        "NextAction": "e0232544-96a4-4e9e-8d30-4b2351485d3a",
                        "Errors": [],
                        "Conditions": []
                    },
                    "Type": "MessageParticipant"
                }, {
                    "Identifier": "e0232544-96a4-4e9e-8d30-4b2351485d3a",
                    "Parameters": {
                        "Text": "Thank you, have a nice day."
                    },
                    "Transitions": {
                        "NextAction": "4e9618b6-85f1-4082-bf2d-ffc8a0b4b24c",
                        "Errors": [],
                        "Conditions": []
                    },
                    "Type": "MessageParticipant"
                }, {
                    "Identifier": "15b54b6b-822f-4121-8a74-a975e4d30bba",
                    "Parameters": {
                        "Text": "We are currently unable to generate suggestions. Please try again at a later time."
                    },
                    "Transitions": {
                        "NextAction": "4e9618b6-85f1-4082-bf2d-ffc8a0b4b24c",
                        "Errors": [],
                        "Conditions": []
                    },
                    "Type": "MessageParticipant"
                }, {
                    "Identifier": "4e9618b6-85f1-4082-bf2d-ffc8a0b4b24c",
                    "Type": "DisconnectParticipant",
                    "Parameters": {},
                    "Transitions": {}
                }]
            }),
            Tags: {}
        }
    });

    // to prevent not authorized errors on delete (policy being deleted before resource)
    resource.node.addDependency(customResourceFunction);
    customResourceFunction.node.addDependency(policy);
    resource.node.addDependency(policy);
    return resource;
}