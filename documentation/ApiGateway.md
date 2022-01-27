# API Gateway

## Overview

Exposes a REST API with two endpoints.

[RecentHistory](RecentHistory.md)

https://{host}/api/calls

returns

```
{
    at: string,
    phoneNumber: string,
    vanityPhoneNumbers: string[]
}[]
```

[TryIt](TryIt.md)

https://{host}/api/phonenumber/{phoneNumber}/vanityphonenumbers

returns

```
{ 
    vanityPhoneNumbers: string[]
}
```

Access to this API should be restricted to only being called via the [Cloud Front](CloudFront.md) distribution but this is not yet implemented.

## Testing

The following command should start the API on your local machine, however it is not currently picking up the environment variables and this is an issue that still needs resolving.

```
sam local start-api -t cdk.out\VoiceFoundryDemonstrationStack.template.json -n locals.json
```

The APIs can be tested locally with the following calls.

```
http://127.0.0.1/api/calls
http://127.0.0.1/api/phonenumbers/%2B1234567890/vanityphonenumbers
```