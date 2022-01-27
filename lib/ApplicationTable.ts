import { Stack, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

/**
 * ApplicationTable
 * @param stack  The stack for this deployment package
 * @returns The DynamoDB Table resource for this application
 */
export default function ApplicationTable(stack: Stack) {
    return new Table(stack, "CallsTable", {
        partitionKey: { name: 'Id', type: AttributeType.STRING },
        sortKey: { name: 'Type', type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: RemovalPolicy.DESTROY
    });
}