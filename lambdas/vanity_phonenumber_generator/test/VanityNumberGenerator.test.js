const VanityNumberGenerator = require('../src/VanityNumberGenerator');

test('it returns an empty list when there are no suggestions', () => {
    const systemUnderTest = new VanityNumberGenerator({});
    const suggestions = systemUnderTest.suggest('+1234567890');
    expect(suggestions).toEqual(expect.arrayContaining(([])));
});

test('it returns a list of suggestions for a phone-number where there are less than the number of required suggestions', () => {
    const systemUnderTest = new VanityNumberGenerator({ '6936': ['oxen'], '936': ['wen']});
    const suggestions = systemUnderTest.suggest('+17206936169');
    expect(suggestions).toEqual(expect.arrayContaining((['+1720oxen169', '+17206wen169'])));
});

test('it returns a list of suggestions for a phone-number where there are exactly the number of required suggestions', () => {
    const systemUnderTest = new VanityNumberGenerator({ '6936': ['oxen'], '936': ['wen', 'yen']});
    const suggestions = systemUnderTest.suggest('+17206936169');
    expect(suggestions).toEqual(expect.arrayContaining((['+1720oxen169', '+17206wen169', '+17206yen169'])));
});

test('it returns a list of suggestions for a phone-number where there are more than the number of required suggestions', () => {
    const systemUnderTest = new VanityNumberGenerator({ '6936': ['oxen'], '936': ['wen', 'yen', 'zen']});
    const suggestions = systemUnderTest.suggest('+17206936169');
    expect(suggestions).toEqual(expect.arrayContaining((['+1720oxen169', '+17206wen169', '+17206yen169'])));
});

test('it throws an error when the phone-number is invalid', () => {
    const systemUnderTest = new VanityNumberGenerator({});
    expect(() => systemUnderTest.suggest('abcd')).toThrow('The phone-number is not in the expected format.');
});