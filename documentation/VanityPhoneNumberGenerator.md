# Vanity Phone-number Generator Function

## Overview

This is a shared lambda function that generates a list of vanity phone-numbers given a starting phone-number. This function is called by both the [ResponseOrchestration](ResponseOrchestration.md) lambda function and the [TryIt](TryIt.md) lambda function.

## Anatomy of a phone-number

A phone-number can be split into three parts; country code, area code and number.

### Country codes

Can be 1-3 characters in length and are typically prefixed with a '+' character as a placeholder for any numbers required by the carrier to indicate a international call. [Link](https://en.wikipedia.org/wiki/List_of_country_calling_codes)

### Area codes

Can be 1-3 characters in length depending on the convention of the country/carrier.

### Number

In most modern phone systems this is 6-7 characters.

## Vanity phone-numbers

A vanity phone-number is a easily recallable sequence of characters and numbers in which some of the digits 0-9 are replaced with letters. [Link](https://en.wikipedia.org/wiki/Vanity_number)

The character replacement is as follows, although it needs to be investigated whether this is universal across all languages and countries.

|         | Codes   |         |
|  :---:  |  :---:  |  :---:  |
| 1       | 2(ABC)  | 3(DEF)  |
| 4(HIJ)  | 5(KLM)  | 6(NMO)  |
| 7(PQRS) | 8(TUV)  | 9(WXUZ) |
|         | 0       |         |

To be memorable a vanity phone-number should include an easily recognizable character sequence, typically a word or phrase.
A random sequence of characters is no more memorable than the original number.

It is not possible to generate a vanity phone-number for all numbers. For example numbers with many 0 or 1 digits are unlikely to generate a memorable vanity-number.

### Vanity phone-number algorithm

The first step of the chosen algorithm is to obtain a list of recognizable sequences. Scrabble dictionaries are widely available and provide a suitable starting point.

The following are ways in which the basic word list could be enhanced in the future.

* filter the list for obscenities
* add in short phrases
* add in other easily recognizable character sequences e.g. AAA

The list is filtered to only those sequences with 3-7 characters.

The minimum of three was chosen because 1-2 character sequences are easily overwhelmed by the numeric sequences and do not make the vanity phone-number any more memorable.

The maximum of 7 was chosen based on the fact that country code and area code are not always necessary when dialing a number, adding these to the vanity phone-number could therefore cause confusion.

Next the list is sorted into a dictionary indexed by the digit sequence the word represents.

There may be multiple recognizable sequences per index.

e.g. 936 - [WEN, YEN]

The definition for 'best' vanity phone-numbers ranks the options using the following criteria in preferential order.

* Length of the included word/sequence, larger sequences are better.
* The placement of the word/sequence in the vanity phone-number, characters towards the end of the number are preferred.
* The priority of the word/sequence. This is dictated by the original list, alphabetic lists give priority to the earlier letters in the alphabet but this could be altered for example to give priority to words more commonly used.

#### The moving window algorithm

In order to achieve the best vanity phone-number suggestions without the need to calculate all possible values I use a moving window algorithm over the number, starting with the largest possible string and moving right to left.

i.e.

```
[6936169] length==7, offset==0
6[936169] length==6, offset==1
[693616]9 length==6, offset==0
69[36169] length==5, offset==2
6[93616]9 length==5, offset==1
...
```

As soon as the desired number of suggestions has been generated the fundtion returns the result and exits.

## Implementation

The current implementation loads the word list from a URL and generates the word index in memory on cold start. For a standard word list this does not appear to impact performance significantly although there is a noticeable pause in the contact flow. This might be improved by storing the word index in DynamoDB.

The following are the request and response formats for this function.

Request object

```
{
    phoneNumber: string // regex /^\+[0-9]{9,13}$/g
}
```

Response object

```
{
    vanityPhoneNumbers: string[]
}
```

On error

```
{
    errorType: string,
    errorMessage: string,
    trace: string[]
}
```

## Testing

```
sam local invoke VanityPhoneNumberGeneratorFunction \
    -e lambdas\vanity_phonenumber_generator\events\event.json \
    -t cdk.out\VoiceFoundryDemonstrationStack.template.json
```