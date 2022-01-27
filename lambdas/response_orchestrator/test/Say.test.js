const Say = require('../src/Say');

test('it says a number', () => {
    expect(Say.number(1)).toBe('<say-as interpret-as="cardinal">1</say-as>');
});

test('is says an ordinal', () => {
    expect(Say.ordinal(1)).toBe('<say-as interpret-as="ordinal">1</say-as>');
});

test('it says a phone-number', () => {
    expect(Say.phoneNumber('+1234567890')).toBe('<say-as interpret-as="telephone">+1234567890</say-as>');
});

test('it says a vanity phone-number', () => {
    expect(Say.vanityPhoneNumber('+1234test90')).toBe('<say-as interpret-as="digits"></say-as><break time="200ms"/><say-as interpret-as="digits">123</say-as><break time="200ms"/><say-as interpret-as="digits">4test90</say-as>; that\'s <say-as interpret-as="digits"></say-as><break time="200ms"/><say-as interpret-as="digits">123</say-as><break time="200ms"/><say-as interpret-as="characters">4test90</say-as>');
});