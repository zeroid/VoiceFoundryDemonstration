# Recent History Lambda Function

## Overview

The RecentHistory lambda function returns the five most recent calls to the call center and the vanity phone-numbers generated.

This function backs the `https://{host}/api/calls` REST [API](ApiGateway.md).

## Implementation

This function reads the [DynamoDB](DynamoDB.md) record that records the five most recent calls, it does not scan the individual records stored in the DynamoDB table.

The following are the request and response formats for this function.

Request

```
{
    // request is not used
}
```

Response

```
{
    statusCode: number
    body: string
}
```

Body content

```
{
    at: string,
    phoneNumber: string,
    vanityPhoneNumbers: string[]
}[]
```

## Testing

```
sam local invoke RecentHistoryFunction \
    -e lambdas\calls_api\events\event.json \
    -t cdk.out\VoiceFoundryDemonstrationStack.template.json \
    -n locals.json
```