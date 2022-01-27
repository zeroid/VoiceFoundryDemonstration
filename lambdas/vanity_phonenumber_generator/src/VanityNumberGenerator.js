/**
 * VanityNumberGenerator
 */
class VanityNumberGenerator {
    /**
     * constructor()
     * @param {{[string]: string[]}} entries the indexed dictionary of words
     * @param {number} minWordLength an optional minimum word length (default 3)
     * @param {number} maxWordLength  an optional maximum word length (default 7)
     */
    constructor(entries, minWordLength = 3, maxWordLength = 7) {
        this._entries = entries;
        this._minWordLength = minWordLength;
        this._maxWordLength = maxWordLength;
    }

    /**
     * suggest()
     * @description Given a phone number return the best corresponding vanity numbers
     * @remarks The vanity numbers will include one english word corresponding to the numeric values
     * @remarks The criteria for determining "best" is:
     *          - larger words are preferred over smaller words
     *          - words appearing to the end of the sequence are preferred to words at the start of the sequence
     *          - finally words ranked by alphabetical order
     * @param {string} phone The phone number to suggest vanity numbers for
     * @param {integer} maxResults The maximum number of results to return
     * @returns {string[]} the list of generated numbers
     */
    suggest(phone, maxResults = 3) {
        if (!phone.match(/^\+[0-9]{9,13}$/g)) {
            throw new Error('The phone-number is not in the expected format.');
        }

        const region = phone.slice(0, -this._maxWordLength);
        const number = phone.slice(-this._maxWordLength);
        const result = [];
        // the following is a moving window algorithm over the number, starting with the largest possible string and moving right to left
        // i.e.
        // [6936169] length==7, offset==0
        // 6[936169] length==6, offset==1
        // [693616]9 length==6, offset==0
        // 69[36169] length==5, offset==2
        // 6[93616]9 length==5, offset==1
        // ...
        for (let length = this._maxWordLength; length >= this._minWordLength; length--) {
            for (let offset = this._maxWordLength - length; offset >= 0; offset--) {
                const prefix = number.substr(0, offset);
                const window = number.substr(offset, length);
                const suffix = number.substr(offset + length);

                const suggestions = this._entries[window] || [];
                result.push(...(suggestions.map(a => `${region}${prefix}${a}${suffix}`)));

                if (result.length >= maxResults) {
                    // we have at least the required number of results
                    // return the requested number of results
                    return result.slice(0, maxResults);
                }
            }
        }
        // we did not reach maxResults
        // return what we have
        return result;
    }
}

module.exports = VanityNumberGenerator;