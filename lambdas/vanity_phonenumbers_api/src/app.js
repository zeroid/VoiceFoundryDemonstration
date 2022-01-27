const { LambdaClient } = require('@aws-sdk/client-lambda');

const VanityPhoneNumberGenerator = require('./VanityPhoneNumberGenerator');

const { VANITY_PHONENUMBER_GENERATOR_FUNCTION_ARN } = process.env;

const generator = new VanityPhoneNumberGenerator(new LambdaClient(), VANITY_PHONENUMBER_GENERATOR_FUNCTION_ARN);

/**
 * handler()
 * @description handle an API request to /api/phonenumbers/{phoneNumber}/vanityphonenumbers
 * @param {{ pathParameters: { phoneNumber: string } }} event the API Gateway event for this request
 * @returns {{ statusCode: number, body: string }} the API Gateway response object
 */
exports.handler = async function (event) {
    console.log('REQUEST', JSON.stringify(event));

    const phoneNumber = event.pathParameters?.phoneNumber;
    if (!phoneNumber.match(/^\+[0-9]{9,13}$/g)) {
        const message = 'The phone-number is not in the expected format.';
        console.log('ERROR', message, JSON.stringify(lambdaResponse));
        throw new Error(message);
    }

    // generate vanity phone-numbers
    var lambdaResult = await generator.generateVanityPhoneNumbers(phoneNumber);
    console.log('GENERATED_NUMBERS', JSON.stringify(lambdaResult));

    const response = {
        statusCode: 200,
        body: JSON.stringify(lambdaResult)
    };
    console.log('RESPONSE', JSON.stringify(response));
    return response;
}