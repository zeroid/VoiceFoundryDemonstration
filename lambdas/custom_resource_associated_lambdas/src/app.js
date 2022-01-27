const {
    ConnectClient,
    AssociateLambdaFunctionCommand,
    DisassociateLambdaFunctionCommand
    
} = require('@aws-sdk/client-connect');

const client = new ConnectClient();

/**
 * handler()
 * @description entry point for the lambda function
 * @param {*} event the Custom Resource event
 * @returns {{ PhysicalResourceId: string }} result containing PhysicalResourceId
 */
exports.handler = async function(event) {
    console.log('REQUEST', JSON.stringify(event));

    const requestType = event['RequestType'].toLowerCase();
    switch(requestType) {
        case 'create':
            return await onCreate(event);
        case 'update':
            return await onUpdate(event);
        case 'delete':
            return await onDelete(event);
        default:
            const message = 'Invalid request type';
            console.log('ERROR', message, requestType);
            throw new Error(message);
    }
}

/**
 * onCreate()
 * @description create a new associated lambdas resource
 * @remarks https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-connect/classes/associatelambdafunctioncommand.html
 * @param {*} event the Custom Resource create event
 * @returns {{ PhysicalResourceId: string }} result containing PhysicalResourceId
 */
async function onCreate(event) {
    const { InstanceId, LambdaFunctionArns=[], Tags={} } = event.ResourceProperties;

    // associate any lambda functions required by this contact flow
    await Promise.all(LambdaFunctionArns.map(async (a) => {
        const associateLambdaCommand = new AssociateLambdaFunctionCommand({
            InstanceId: InstanceId,
            FunctionArn: a
        });
        return await client.send(associateLambdaCommand);
    }));

    return { PhysicalResourceId: `associated-lambdas-${InstanceId}` }
}

/**
 * _difference()
 * @description helper function to difference two arrays
 * @param {string[]} setA 
 * @param {string[]} setB 
 * @returns 
 */
function _difference(setA, setB) {
    let _difference = new Set(setA)
    for (let elem of setB) {
        _difference.delete(elem)
    }
    return _difference
}

/**
 * onUpdate()
 * @description update an existing associated lambdas resource
 * @remarks https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-connect/classes/associatelambdafunctioncommand.html
 * @remarks https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-connect/classes/disassociatelambdafunctioncommand.html
 * @param {*} event the Custom Resource update event
 * @returns {{ PhysicalResourceId: string }} result containing PhysicalResourceId
 */
async function onUpdate(event) {
    const { PhysicalResourceId } = event;
    const { InstanceId, LambdaFunctionArns: LambdaFunctionArns=[] } = event.ResourceProperties;
    const { OldLambdaFunctionArns } = event.OldResourceProperties;

    // disassociate any deleted lambda functions managed by this stack
    await Promise.all(_diference(OldLambdaFunctionArns, LambdaFunctionArns).map(async (a) => {
        const disassociateLambdaCommand = new DisassociateLambdaFunctionCommand({
            InstanceId: InstanceId,
            FunctionArn: a
        });
        return await client.send(disassociateLambdaCommand);
    }));

    // associate any new lambda functions managed by this stack
    await Promise.all(_difference(LambdaFunctionArns, OldLambdaFunctionArns).map(async (a) => {
        const associateLambdaCommand = new AssociateLambdaFunctionCommand({
            InstanceId: InstanceId,
            FunctionArn: a
        });
        return await client.send(associateLambdaCommand);
    }));

    return { PhysicalResourceId: PhysicalResourceId }
}

/**
 * onDelete()
 * @description delete an associated lambdas resource
 * @remarks https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-connect/classes/disassociatelambdafunctioncommand.html
 * @param {*} event the Custom Resource delete event
 * @returns {{ PhysicalResourceId: string }}} result containing PhysicalResourceId
 */
async function onDelete(event) {
    const { PhysicalResourceId } = event;
    const { InstanceId, LambdaFunctionArns: LambdaFunctionArns=[] } = event.ResourceProperties;

    // disassociate any lambda functions managed by this stack
    await Promise.all(LambdaFunctionArns.map(async (a) => {
        const disassociateLambdaCommand = new DisassociateLambdaFunctionCommand({
            InstanceId: InstanceId,
            FunctionArn: a
        });
        return await client.send(disassociateLambdaCommand);
    }));

    return { PhysicalResourceId: PhysicalResourceId };
}