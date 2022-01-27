const https = require('https');
const WordIndexer = require('./WordIndexer');
const VanityNumberGenerator = require('./VanityNumberGenerator');

const {
    WORD_LIST_URL: WORD_LIST_URL     = 'https://raw.githubusercontent.com/zeisler/scrabble/master/db/dictionary.csv',
    MIN_WORD_LENGTH: MIN_WORD_LENGTH = 3,
    MAX_WORD_LENGTH: MAX_WORD_LENGTH = 7

} = process.env;

let generator = null; // asynchronous initialization in handler

/**
 * lambdaHandler
 * @param {{ phoneNumber: string }} event the event for this request
 * @returns {{ vanityPhoneNumbers: string[] }} a list of vanity phone-numbers
 */
exports.lambdaHandler = async (event) => {
    console.log('REQUEST', JSON.stringify(event));

    if (!generator) {
        await new Promise((resolve, reject) => {
            https.get(WORD_LIST_URL, async (response) => {
                const index = await new WordIndexer(MIN_WORD_LENGTH, MAX_WORD_LENGTH).index(response);
                generator = new VanityNumberGenerator(index, MIN_WORD_LENGTH, MAX_WORD_LENGTH);
                resolve();
            });
        });
    }

    if (!event.phoneNumber) {
        const message = 'The phone-number was not suppled.';
        console.log('ERROR', message);
        throw new Error(message);
    }

    const response = generator.suggest(event.phoneNumber);
    console.log('RESPONSE', JSON.stringify(response));
    return { vanityPhoneNumbers: response };
};
