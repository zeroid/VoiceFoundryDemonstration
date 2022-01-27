/**
 * ResponseOrchestrator
 */
class ResponseOrchestrator {
    /**
     * ResponseOrchestrator constuctor
     * @remarks allows for dependency injection and testing
     * @param {VanityPhoneNumberGenerator} generator 
     * @param {DatabaseWriter} writer 
     * @param {Say} say
     */
    constructor(generator, writer, say) {
        this._generator = generator;
        this._writer = writer;
        this._say = say
    }

    /**
     * createResponse
     * @description handle a request to generate dynamic text for a given phone-number
     * @remarks calculates a number of vanity phone-numbers and returns SSML text giving the result
     * @param {*} event the dynamic text event for the AWS Connect contact flow 
     * @param {*} context context.awsRequestId is used as a random number
     * @returns {{ speech: string }} an object containing the SSML to speek
     */
    async createResponse(event, context) {
        const receivedTime = new Date().toISOString();

        if (event.Details?.ContactData?.CustomerEndpoint?.Type !== 'TELEPHONE_NUMBER') {
            const message = 'This lambda function can only be called from a telephone based contact flow.';
            console.log('ERROR', message);
            throw new Error(message);
        }

        const phoneNumber = event.Details?.ContactData?.CustomerEndpoint?.Address;
        if (!phoneNumber || !phoneNumber.match(/^\+[0-9]{9,13}$/g)) {
            const message = 'This phone-number is not in the expected format.';
            console.log('ERROR', message, phoneNumber);
            throw new Error(message);
        }

        // generate vanity phone-numbers
        var lambdaResult = await this._generator.generateVanityPhoneNumbers(phoneNumber);
        console.log('GENERATED_NUMBERS', JSON.stringify(lambdaResult));

        // write to the database
        await this._writer.addEntry(context.awsRequestId, {
            at: receivedTime,
            phoneNumber: phoneNumber,
            vanityPhoneNumbers: lambdaResult.vanityPhoneNumbers
        });

        // generate the SSML for the dynamic contact flow content
        let speech;
        if (lambdaResult.vanityPhoneNumbers.length === 0) {
            speech =
            `<speak>
                We did not find any vanity phone-number suggestions for ${this._say.phoneNumber(phoneNumber)}.
            </speak>`;
        }
        else {
            speech = 
            `<speak> 
                We found ${this._say.number(lambdaResult.vanityPhoneNumbers.length)} vanity phone-number suggestions for ${this._say.phoneNumber(phoneNumber)}.
                ${lambdaResult.vanityPhoneNumbers.map((value, index) => {
                    return `The ${this._say.ordinal(index + 1)} is: ${this._say.vanityPhoneNumber(value)}.`;
                }).join('\n')}
            </speak>`;
        }

        return { speech: speech };
    }
}

module.exports = ResponseOrchestrator;