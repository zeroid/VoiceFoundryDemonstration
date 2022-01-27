const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const MAX_RETRYS = 5;

/**
 * DatabaseWriter
 * @description encapsulates logic for writing call information to the DynamoDB table
 * @remarks also writes to the history record using an optimistic locking transaction
 */
class DatabaseWriter {
    /**
     * constructor()
     * @param {DynamoDBDocumentClient} dynamoClient the DynamoDB client
     * @param {string} tableName the DynamoDB table name
     * @param {number} MAX_HISTORY the maximum number of calls to log
     */
    constructor(dynamoClient, tableName, MAX_HISTORY = 5) {
        this._dynamoClient = dynamoClient
        this._tableName = tableName;
        this.MAX_HISTORY = MAX_HISTORY;
    }

    /**
     * addEntry()
     * @description add the call as an individual record and update the history record
     * @param {string} requestId used as a unique identifier
     * @param {{ at: string, phoneNumber: string, vanityPhoneNumbers: string[] }} entry the call information
     * @returns
     */
    async addEntry(requestId, entry) {
        // add the call record to dynamo
        const putEntryResponse = await this._dynamoClient.send(new PutCommand({
            TableName: this._tableName,
            Item: {
                Id: `call#${entry.phoneNumber}_${requestId}`,
                Type: 'call',
                PhoneNumber: entry.phoneNumber,
                VanityPhoneNumbers: entry.vanityPhoneNumbers
            }
        }));
        
        // update the record tracking the last 5 calls
        for(let i = 0; i < MAX_RETRYS; i++) {
            try {
                const readHistoryResponse = await this._dynamoClient.send(new GetCommand({
                    TableName: this._tableName,
                    Key: {
                        Id: 'history#default',
                        Type: 'history'
                    },
                    ProjectionExpression: 'Version, Recent'
                }));

                // generate the new history record
                const newHistory = [entry, ...(readHistoryResponse.Item?.Recent || [])].slice(0, this.MAX_HISTORY);

                const writeHistoryResponse = await this._dynamoClient.send(new PutCommand({
                    TableName: this._tableName,
                    Item: {
                        Id: 'history#default',
                        Type: 'history',
                        Version: requestId,
                        Recent: newHistory
                    },
                    ConditionalExpression: readHistoryResponse.Item?.Version
                        ? `Version = ${readHistoryResponse.Item?.Version}`
                        : 'attribute_not_exist(Version)'
                }));

                return;
            }
            catch {
                // likely just the conditional expression
            }
        }

        const message = 'Unable to update call history record';
        console.log(message);
        return; // this should not be a show-stopper, don't throw an exception
    }
}

module.exports = DatabaseWriter;