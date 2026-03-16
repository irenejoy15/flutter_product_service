// STEP 14
const {DynamoDBClient, ScanCommand} = require('@aws-sdk/client-dynamodb');
const dynamoDBClient = new DynamoDBClient({region: 'us-east-1'});
exports.getAllProducts = async () => {
    try{
        const tableName = process.env.DYNAMODB_TABLE;
        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: 'isApproved = :approved',
            ExpressionAttributeValues: {
                ':approved': { BOOL: true },
            },
        });
        const {Items} = await dynamoDBClient.send(scanCommand);
        if(!Items || Items.length === 0){
            return {
                statusCode: 400,
                body: JSON.stringify({msg: 'No products found'}),
            }
        }
        const products = Items.map(item => ({
            id: item.id.S,
            fileName: item.fileName.S,
            productName: item.productName.S,
            category: item.category.S,
            productPrice: parseFloat(item.productPrice.N),
            imageUrl: item.imageUrl ? item.imageUrl.S : null,
            description : item.description.S,
            quantity: parseInt(item.quantity.N),
            email: item.email.S,
            isApproved: item.isApproved.BOOL,
            createdAt: item.createdAt.S,
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({products: products}),
        };
    }catch(error){
        console.error('Error retrieving products:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({msg: 'Failed to retrieve products'}),
        }
    }
};
// END STEP 14