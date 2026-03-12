// STEP 2 
// UPLOAD NG IMAGE SA DATABASE
const {S3Client,PutObjectCommand} = require('@aws-sdk/client-s3');
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner');
// END UPLOAD NG IMAGE SA DATABASE
// STORE TO TABLE
const {DynamoDBClient,PutItemCommand} = require('@aws-sdk/client-dynamodb');
// END STORE TO TABLE
// UUID
const crypto = require('crypto');
// END UUID

const s3Client = new S3Client({region: 'us-east-1'});
const dynamoDBClient = new DynamoDBClient({region: 'us-east-1'});

// YUNG EVENT BODY AY JSON STRING, KAYA KINAKAILANGAN I-PARSE PARA MAGING OBJECT
exports.getUploadUrl = async (event) => {
    try{
        const bucketName = process.env.BUCKET_NAME;
        const {fileName, fileType, productName, productPrice, description, quantity, category, email} = JSON.parse(event.body);
        if(!fileName || !fileType || !productName || !productPrice || !description || !quantity || !category || !email){
            return {
                statusCode: 400,
                body: JSON.stringify({error: 'ALL FIELDS ARE REQUIRED'}),
            }
        }

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            ContentType: fileType,
         });
        const signedUrl = await getSignedUrl(s3Client, command, {expiresIn: 3600});
        const productId = crypto.randomUUID();
        const putItemCommand = new PutItemCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
                id: { S: productId },
                fileName : { S: fileName },
                productName: { S: productName },
                category: { S: category },
                productPrice: { N: productPrice.toString() },
                description: { S: description },
                quantity: { N: quantity.toString() },
                email: { S: email },
                isApproved: { BOOL: false },
                createdAt: { S: new Date().toISOString() },
            }
        });

        await dynamoDBClient.send(putItemCommand);

        return {
            statusCode: 201,
            body: JSON.stringify({uploadUrl: signedUrl}),
        }
    }catch(error){
        console.error('Error generating signed URL:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({error: error.message}),
        }
    }
}
// END STEP 2