const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const DatabaseReader = require('./DatabaseReader');

const tableName = process.env.APPLICATION_TABLE_NAME;
const reader = new DatabaseReader(DynamoDBDocumentClient.from(new DynamoDBClient()), tableName);

/**
 * handler()
 * @description handle an API request to /api/calls
 * @param {*} event the API Gateway event for this request
 * @returns {{ statusCode: number, body: string }} the API Gateway response object
 */
exports.handler = async function (event) {
    console.log('REQUEST', JSON.stringify(event));
    const response = {
        statusCode: 200,
        body: JSON.stringify(await reader.ReadHistory())
    };
    console.log('RESPONSE', JSON.stringify(response));
    return response;
}