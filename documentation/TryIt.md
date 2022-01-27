# Try It Lambda Function

## Overview

The TryIt lambda function allows the user to try the vanity phone-number generator without the need to call the contact center number.

This function backs the `https://{host}/api/phonenumbers/{phoneNumber}/vanityphonenumbers` REST [API](ApiGateway.md) call.

Note: tests conducted via this API do not add records to the DynamoDB table.

# Implementation

The function invokes the [VanityPhoneNumberGenerator](VanityPhoneNumberGenerator.md) lambda function and then returns the result.

The following are the request and response formats for this function.

Request

```
{
    pathParameters: {
        phoneNumber: string // regex /^\+[0-9]{9,13}$/g
    }
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
    vanityPhoneNumbers: string[]
}
```

## Testing

```
sam local invoke TryItFunction \
    -e lambdas\vanity_phonenumbers_api\events\event.json \
    -t cdk.out\sam-app.template.json \
    -n locals.json
```