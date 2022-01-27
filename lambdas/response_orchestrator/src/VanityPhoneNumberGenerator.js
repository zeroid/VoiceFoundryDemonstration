const { InvokeCommand } = require('@aws-sdk/client-lambda');

/**
 * VanityPhoneNumberGenerator
 */
class VanityPhoneNumberGenerator {
    /**
     * VanityPhoneNumberGenerator
     * @description encapsulates logic to call teh VanityPhoneNumberGenerator lambda function
     * @param {LambdaClient} lambdaClient the Lambda client
     * @param {string} vanityPhoneNumberGeneratorArn 
     */
    constructor (lambdaClient, vanityPhoneNumberGeneratorArn) {
        this._lambdaClient = lambdaClient;
        this._vanityPhoneNumberGeneratorArn = vanityPhoneNumberGeneratorArn;
    }

    /**
     * generateVanityPhoneNumbers
     * @description call the VanityPhoneNumberGenerator lambda function
     * @param {string} phoneNumber the phone-number to generate vanity phone-numbers for
     * @returns {{ vanityPhoneNumbers: string[] }} a list of vanity phone-numbers
     */
    async generateVanityPhoneNumbers(phoneNumber) {
        const lambdaResponse = await this._lambdaClient.send(new InvokeCommand({
            FunctionName: this._vanityPhoneNumberGeneratorArn,
            Payload: JSON.stringify({ phoneNumber: phoneNumber })
        }));

        if (lambdaResponse.StatusCode !== 200 || ('FunctionError' in lambdaResponse && lambdaResponse.FunctionError === 'Unhandled')) {
            const message = 'Unable to generate vanity phone-numbers.';
            console.log('ERROR', message, JSON.stringify(response));
            throw new Error(message);
        }

        return JSON.parse(Buffer.from(lambdaResponse.Payload));
    }
}

module.exports = VanityPhoneNumberGenerator;