const { LambdaClient } = require('@aws-sdk/client-lambda');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const VanityPhoneNumberGenerator = require('./VanityPhoneNumberGenerator');
const DatabaseWriter = require('./DatabaseWriter');
const Say = require('./Say');
const ResponseOrchestrator = require('./ResponseOrchestrator');

const { APPLICATION_TABLE_NAME, VANITY_PHONENUMBER_GENERATOR_FUNCTION_ARN } = process.env;

const generator = new VanityPhoneNumberGenerator(new LambdaClient(), VANITY_PHONENUMBER_GENERATOR_FUNCTION_ARN);
const writer = new DatabaseWriter(DynamoDBDocumentClient.from(new DynamoDBClient()), APPLICATION_TABLE_NAME);
const orchestrator = new ResponseOrchestrator(generator, writer, Say);

/**
 * lambdaHandler
 * @description handle a request to generate dynamic text for a given phone-number
 * @remarks calculates a number of vanity phone-numbers and returns SSML text giving the result
 * @param {*} event the dynamic text event for the AWS Connect contact flow 
 * @param {*} context context.awsRequestId is used as a random number
 * @returns {{ speech: string }} an object containing the SSML to speek
 */
exports.lambdaHandler = async (event, context) => {
    console.log('REQUEST', JSON.stringify(event));
    const response = await orchestrator.createResponse(event, context);
    console.log('RESPONSE', JSON.stringify(response));
    return response;
};
