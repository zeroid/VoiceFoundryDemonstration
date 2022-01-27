# Amazon Connect

## Overview

The Amazon Connect instance is an existing instance. The ARN of this instance is supplied as a parameter when running the deployment package.

The deployment package will add an new [contact flow](ContactFlow.md) to the Amazon Connect instance as well as associating the [ResponseOrchestration](ResponseOrchestration.md) lambda function which is a dependency of the contact flow.

After deployment, it is necessary to manually assign the new contact flow to the desired phone-number via the Amazon Connect console or the AWS command line interface.