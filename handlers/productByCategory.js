const {DynamoDBClient,ScanCommand} = require("@aws-sdk/client-dynamodb");
const dynamoDBClient = new DynamoDBClient({region: "us-east-1"});

exports.getProductsByCategory = async (event) => {
    try{
        const tableName = process.env.DYNAMODB_TABLE;
        const category = event.queryStringParameters?.category;
        if(!category){
            return {
                statusCode: 400,
                body: JSON.stringify({message: "Category query parameter is required"})
            };
        }
        const scanCommand  = new ScanCommand({
            TableName: tableName,
            FilterExpression: "category = :category AND isApproved = :approved",
            ExpressionAttributeValues: {
                ":category": {S: category},
                ":approved": {BOOL: true}
            }
        });
        const {Items} = await dynamoDBClient.send(scanCommand);
        if(!Items || Items.length === 0){
            return {
                statusCode: 404,
                body: JSON.stringify({message: "No products found for the specified category"})
            };
        }
        const products = Items.map(item => ({
            id: item.id.S,
            fileName: item.fileName.S,
            productName: item.productName.S,
            category: item.category.S,
            productPrice: parseFloat(item.productPrice.N),
            imageUrl: item.imageUrl ? item.imageUrl.S : null,
            description: item.description.S,
            quantity: parseInt(item.quantity.N),
            email: item.email.S,
            isApproved: item.isApproved.BOOL,
            createdAt: item.createdAt.S
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({products, ItemCount: Items.length})
        };

    }catch(error){
        console.error("Error fetching products by category:",error);
        return {
            statusCode: 500,
            body: JSON.stringify({message: "Internal Server Error"})
        };
    }
}