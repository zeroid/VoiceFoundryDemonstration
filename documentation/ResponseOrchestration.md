# Response Orchestration Lambda Function

## Overview

The ResponseOrchestration lambda calls the [VanityPhoneNumberGenerator](VanityPhoneNumberGenerator.md) lambda function passing the phone-number of the caller and receives back a list of vanity phone-number suggestions. For cases where there are no suggestions an alternative phrase is returned. The function logs the phone-number and suggestions to [DynamoDB](DynamoDB.md), and updates a record that tracks the five most recent calls.

It then returns a string in SSML format that the Amazon Connect [contact flow](ContactFlow.md) will speak to the caller.

## Speech Synthesis Markup Language (SSML)

To improve the quality of the spoken text Speech Synthesis Markup Language (SSML) is used.

Testing was performed with the [Amazon Polly online tester](https://console.aws.amazon.com/polly/home/SynthesizeSpeech).

To generate a natural sounding phone-number the following tag is used.

```
<say-as interpret-as="telephone">+1234567890</say-as>
```

For vanity phone-numbers this does not produce an acceptable result so a function was created to handle this.
It was decided that the function should return a response with the word both spoken and spelled out to account for similar sounding words.

Additionally, the SSML say-as tag is used to convert numbers to speech.

```
<say-as interpret-as="cardinal">1<say-as> - says 'one'
```

And to indicate the presidence of each response.

```
<say-as interpret-as="ordinal">1<say-as> - says 'first'
```

## Implementation

The following are the request and response formats for this function.

Request object

```
{
    Details: {
        ContactData: {
            CustomerEndpoint: {
                Type: string    // e.g. TELEPHONE_NUMBER
                Address: string // e.g. +1234567890
            }
        }
    }
}
```

Response object

```
{
    speech: string
}
```

## Testing

```
sam local invoke ResponseOrchestrationFunction \
    -e lambdas\response_orchestrator\events\event.json \
    -t cdk.out\VoiceFoundryDemonstrationStack.template.json \
    -n locals.json
```