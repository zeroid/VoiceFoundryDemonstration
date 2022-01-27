const { GetCommand } = require('@aws-sdk/lib-dynamodb');

/**
 * DatabaseReader
 */
class DatabaseReader {
    /**
     * constructor()
     * @param {DynamoDBDocumentClient} the DynamoDB document client
     * @param {string} tableName the name of the DynamoDB table to read from
     */
    constructor(dynamoClient, tableName) {
        this._dynamoClient = dynamoClient;
        this._tableName = tableName;
    }

    /**
     * readHistory()
     * @description read the most recent call records from the DynamoDB table
     * @returns {{ at: string, phoneNumber: string, vanityPhoneNumbers: string[] }[]} the list of recent calls
     */
    async ReadHistory() {
        try {
            const response = await this._dynamoClient.send(new GetCommand({
                TableName: this._tableName,
                Key: {
                    Id: 'history#default',
                    Type: 'history'
                }
            }));
            
            return response.Item?.Recent || [];
        }
        catch (error) {
            const message = 'Error reading database.';
            console.log('ERROR', message, error);
            throw new Error(message);
        }
    }
}

module.exports = DatabaseReader;