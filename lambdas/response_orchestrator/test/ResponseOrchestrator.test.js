const ResponseOrchestrator = require('../src/ResponseOrchestrator');
const { ordinal } = require('../src/Say');

const structuredClone = (object) => JSON.parse(JSON.stringify(object));

class MockSay {
    static number(value) { return value.toString(); }
    static ordinal(value) { return value.toString(); }
    static phoneNumber(value) { return value; }
    static vanityPhoneNumber(value) { return value; }
}

const event = {
    Details: {
        ContactData: {
            CustomerEndpoint: {
                Type: 'TELEPHONE_NUMBER',
                Address: '+1234567890'
            }
        }
    }
};

const context = {
    awsRequestId: 'awsRequestId'
};

test('it generates a response when no results are found', async () => {
    const generator = { generateVanityPhoneNumbers: jest.fn((phoneNumber) => { return { vanityPhoneNumbers: [] } }) };
    const writer = { addEntry: jest.fn(async(entry) => {}) };
    const systemUnderTest = new ResponseOrchestrator(generator, writer, MockSay);
    const result = await systemUnderTest.createResponse(event, context);
    expect(result).toHaveProperty('speech');
    expect(result.speech).toMatch(/^<speak>(\s*)We did not find any vanity phone-number suggestions for \+1234567890.(\s*)<\/speak>$/g)
    expect(generator.generateVanityPhoneNumbers.mock.calls.length).toBe(1);
    expect(generator.generateVanityPhoneNumbers.mock.calls[0][0]).toBe('+1234567890');
    expect(writer.addEntry.mock.calls.length).toBe(1);
    expect(writer.addEntry.mock.calls[0][0]).toBe('awsRequestId');
    expect(writer.addEntry.mock.calls[0][1]).toHaveProperty('at');
    expect(writer.addEntry.mock.calls[0][1]).toHaveProperty('phoneNumber');
    expect(writer.addEntry.mock.calls[0][1].phoneNumber).toBe('+1234567890');
    expect(writer.addEntry.mock.calls[0][1]).toHaveProperty('vanityPhoneNumbers');
    expect(writer.addEntry.mock.calls[0][1].vanityPhoneNumbers).toEqual(expect.arrayContaining([]));
});

test('it generates a response when multiple results are found', async () => {
    const generator = { generateVanityPhoneNumbers: jest.fn((phoneNumber) => { return { vanityPhoneNumbers: ['+123456test','+12345test0'] } }) };
    const writer = { addEntry: jest.fn(async(entry) => {}) };
    const systemUnderTest = new ResponseOrchestrator(generator, writer, MockSay);
    const result = await systemUnderTest.createResponse(event, context);
    expect(result).toHaveProperty('speech');
    expect(result.speech).toMatch(/^<speak>(\s*)We found 2 vanity phone-number suggestions for \+1234567890\.(\s*)The 1 is: \+123456test\.(\s*)The 2 is: \+12345test0\.(\s*)<\/speak>$/g)
    expect(generator.generateVanityPhoneNumbers.mock.calls.length).toBe(1);
    expect(generator.generateVanityPhoneNumbers.mock.calls[0][0]).toBe('+1234567890');
    expect(writer.addEntry.mock.calls.length).toBe(1);
    expect(writer.addEntry.mock.calls[0][0]).toBe('awsRequestId');
    expect(writer.addEntry.mock.calls[0][1]).toHaveProperty('at');
    expect(writer.addEntry.mock.calls[0][1]).toHaveProperty('phoneNumber');
    expect(writer.addEntry.mock.calls[0][1].phoneNumber).toBe('+1234567890');
    expect(writer.addEntry.mock.calls[0][1]).toHaveProperty('vanityPhoneNumbers');
    expect(writer.addEntry.mock.calls[0][1].vanityPhoneNumbers).toEqual(expect.arrayContaining(['+123456test','+12345test0']));
});

test('it throws an error if the contact flow is not telephone based', async () => {
    const generator = { generateVanityPhoneNumbers: jest.fn((phoneNumber) => {}) };
    const writer = { addEntry: jest.fn(async(entry) => {}) };
    const systemUnderTest = new ResponseOrchestrator(generator, writer, MockSay);
    const invalidEvent = structuredClone(event);
    invalidEvent.Details.ContactData.CustomerEndpoint.Type = 'CHAT';
    await expect(systemUnderTest.createResponse(invalidEvent, context)).rejects.toThrow('This lambda function can only be called from a telephone based contact flow.');
    expect(generator.generateVanityPhoneNumbers.mock.calls.length).toBe(0);
    expect(writer.addEntry.mock.calls.length).toBe(0);
});

test('it throws an error if the phone number is invalid', async () => {
    const generator = { generateVanityPhoneNumbers: jest.fn((phoneNumber) => {}) };
    const writer = { addEntry: jest.fn(async(entry) => {}) };
    const systemUnderTest = new ResponseOrchestrator(generator, writer, MockSay);
    const invalidEvent = structuredClone(event);
    invalidEvent.Details.ContactData.CustomerEndpoint.Address = 'invalid';
    await expect(systemUnderTest.createResponse(invalidEvent, context)).rejects.toThrow('This phone-number is not in the expected format.');
    expect(generator.generateVanityPhoneNumbers.mock.calls.length).toBe(0);
    expect(writer.addEntry.mock.calls.length).toBe(0);
});