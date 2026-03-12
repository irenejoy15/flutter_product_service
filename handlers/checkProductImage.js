// STEP 6
const {DynamoDBClient, UpdateItemCommand, ScanCommand} = require('@aws-sdk/client-dynamodb');

const dynamoDBClient = new DynamoDBClient({region: 'us-east-1'});
exports.checkProductImage = async (event) => {
    try{
         const tableName = process.env.DYNAMODB_TABLE;
    
    // EXTRACT PRODUCT ID FROM PATH PARAMETERS
    // const record = event.Records[0];
    
    // // GETTING THE BUCKET NAME AND KEY FROM THE S3 EVENT
    // const bucketName = record.s3.bucket.name;

    // GETTING THE KEY (FILE NAME) FROM THE S3 EVENT
        const fileName = 'laptopIrene.png';
        // const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

        // FIND THE PRODUCT ID IN DYNAMODB TABLE USING THE FILE NAME
        const scanCommand = new ScanCommand({
            TableName: tableName,
            filterExpression: 'fileName = :fileName',
            expressionAttributeValues: {
                ':fileName': { S: fileName },
            },
        });
        const scanResult = await dynamoDBClient.send(scanCommand);
        if(!scanResult.Items || scanResult.Items.length === 0){
            console.error('No product found with the given file name:', fileName);
            return {
                statusCode: 404,
                body: JSON.stringify({msg: 'Product not found'}),
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({msg: 'Product image exists'}),
        }
    }catch(error){
        console.error('Error checking product image:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({error: error.message}),
        }
    }
   
}