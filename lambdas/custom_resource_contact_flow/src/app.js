const {
    ConnectClient,
    CreateContactFlowCommand,
    DeleteContactFlowCommand,
    UpdateContactFlowContentCommand,
    UpdateContactFlowMetadataCommand,
    UpdateContactFlowNameCommand

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
 * @description create a new contact flow
 * @remarks https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-connect/classes/createcontactflowcommand.html
 * @param {*} event the Custom Resource create event
 * @returns {{ PhysicalResourceId: string, Data: CreateContactFlowCommandOutput }} result containing PhysicalResourceId
 */
async function onCreate(event) {
    const { InstanceId, Name, Description='', Type, Content, Tags={} } = event.ResourceProperties;

    const command = new CreateContactFlowCommand({
        InstanceId: InstanceId,
        Name: Name,
        Description: Description,
        Type: Type,
        Content: Content,
        Tags: Tags
    });
    const result = await client.send(command);
    
    return {
        Data: {
            ContactFlowArn: result.ContactFlowArn,
            ContactFlowId: result.ContactFlowId
        },
        PhysicalResourceId: result.ContactFlowId
    }
}

/**
 * onUpdate()
 * @description update an existing contact flow
 * @remarks https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-connect/classes/updatecontactflownamecommand.html
 * @remarks https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-connect/classes/updatecontactflowmetadatacommand.html
 * @remarks https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-connect/classes/updatecontactflowcontentcommand.html
 * @param {*} event the Custom Resource update event
 * @returns {{ PhysicalResourceId: string, Data: CreateContactFlowCommandOutput }} result containing PhysicalResourceId
 */
async function onUpdate(event) {
    const { PhysicalResourceId } = event;
    const { InstanceId, Name, Description: Description='', ContactFlowState, Content, Tags: Tags={} } = event.ResourceProperties;

    // Update the name and description
    const updateNameCommand = new UpdateContactFlowNameCommand({
        InstanceId: InstanceId,
        ContactFlowId: PhysicalResourceId,
        Name: Name,
        Description: Description
    });
    const updateNameResult = await client.send(updateNameCommand);

    // update the metadata
    const updateMetadataCommand = new UpdateContactFlowMetadataCommand({
        InstanceId: InstanceId,
        ContactFlowId: PhysicalResourceId,
        Name: Name,
        Description: Description,
        ContacFlowState: ContactFlowState
    });
    const updateMetadataResult = await client.send(updateMetadataCommand);

    // update the content
    const updateContentCommand = new UpdateContactFlowContentCommand({
        InstanceId: InstanceId,
        ContactFlowId: PhysicalResourceId,
        Content: Content
    });
    const updateContentResult = await client.send(updateContentCommand);

    return {
        Data: {
            ContactFlowArn: PhysicalResourceId, // todo: how do we get the ARN on update, is it even necessary?
            ContactFlowId: PhysicalResourceId
        },
        PhysicalResourceId: PhysicalResourceId
    }
}

/**
 * onDelete()
 * @description delete a contact flow
 * @remarks https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-connect/classes/deletecontactflowcommand.html
 * @param {*} event the Custom Resource delete event
 * @returns {{ PhysicalResourceId: string }} the delete contact flow output
 */
async function onDelete(event) {
    const { PhysicalResourceId } = event;
    const { InstanceId } = event.ResourceProperties;

    const command = new DeleteContactFlowCommand({
        InstanceId: InstanceId,
        ContactFlowId: PhysicalResourceId
    });
    const result = await client.send(command);

    return { PhysicalResourceId: PhysicalResourceId };
}