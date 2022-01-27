# DynamoDB

## Overview

The DynamoDB table stores two types of record, individual call records and a history record of recent calls. The latter means it is not necessary to scan the table in order to display recent call history.

The [ResponseOrchestration](ResponseOrchestration.md) lambda function writes both records to the table.

The [RecentHistory](RecentHistory.md) lambda function reads the history record.

Nothing currently reads the individual call records.

## Records

### Call record

```
{
    Id: string, // format call#+1234567890_f0b82870-7b77-42b8-8b17-a13f2bf6072c
    Type: 'call',
    PhoneNumber: string,
    VanityPhoneNumbers: string[]
}
```

### History record

```
{
    Id: 'history#default',
    Type: 'history',
    Version: string,
    Recent: {
        at: string,
        phoneNumber: string,
        vanityPhoneNumbers: string[]
    }[]
}
```

The `Version` property is used for optimistic locking of the history record. Writes to the history record include a conditional expressing stating that the Version must match the previously read value. Each write updates the version with the awsRequestId to ensure uniqueness.

Without this in a production system it is possible for one instance of the ResponseOrchestrator lambda function to overwrite the changes of another. 