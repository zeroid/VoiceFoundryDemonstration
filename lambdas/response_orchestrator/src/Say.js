/**
 * Say
 * @descriptions static functions to encapuslate SSML generation fo various types
 */
class Say {
    /**
     * Say.number
     * @description generates SSML for saying a number e.g. 1 = 'one', 2 = 'two'
     * @param {number} value The number to speak
     * @returns {string} The generated SSML snippet
     */
    static number(value) {
        return `<say-as interpret-as="cardinal">${value}</say-as>`;
    }

    /**
     * Say.ordinal
     * @description generates SSML to turn a number into its ordinal representation e.g. 1 = 'first', 2 = 'second'
     * @param {number} value 
     * @returns {string} The generated SSML snippet
     */
    static ordinal(value) {
        return `<say-as interpret-as="ordinal">${value}</say-as>`;
    }

    /**
     * Say.phoneNumber
     * @description generates SSML for natural sounding phone-number
     * @param {string} value The phone-number to speak
     * @returns {string} The generated SSML snippet
     */
    static phoneNumber(value) {
        return `<say-as interpret-as="telephone">${value}</say-as>`;
    }

    /**
     * Say.vanityPhoneNumber
     * @description generates SSML for natural sounding vanity phone-number
     * @remarks the phone-number is said twive, one with the word spoken and once with it spelt out
     * @param {string} value the vanity phone-number to speak
     * @returns {string} The generated SSML snippet
     */
    static vanityPhoneNumber(value) {
        // split the phone number into country code, area code and phone number (this differs by country code and possibly carrier)
        const countryCode = value.substring(0, value.length - 10).replace('+', '');
        const areaCode = value.substring(value.length - 10, value.length - 7);
        const number = value.substring(value.length - 7);
        // const prefix = number.match(/^[0-9]+/g);
        // const word = number.match(/[^0-9]+/g);
        // const suffix = number.match(/[0-9]+$/g);
        return  `<say-as interpret-as="digits">${countryCode}</say-as><break time="200ms"/>` +
                `<say-as interpret-as="digits">${areaCode}</say-as><break time="200ms"/>` +
            //    (prefix ? `<say-as interpret-as="digits">${prefix[0]}</say-as><break time="200ms"/>` : '') +
            //    word[0] +
            //    (suffix ? `<break time="200ms"/><say-as interpret-as="digits">${suffix[0]}</say-as>` : '') +
                `<say-as interpret-as="digits">${number}</say-as>` +
                `; that's ` +
                `<say-as interpret-as="digits">${countryCode}</say-as><break time="200ms"/>` +
                `<say-as interpret-as="digits">${areaCode}</say-as><break time="200ms"/>` +
                `<say-as interpret-as="characters">${number}</say-as>`;
    }
}

module.exports = Say;