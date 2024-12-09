import { S3Client,DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
const bucketName = process.env.BUCKET_NAME as string;

const s3Client = new S3Client({
    region: process.env.REGION_NAME,
    credentials: {
        accessKeyId: process.env.IAM_ACCESS_KEY as string,
        secretAccessKey: process.env.IAM_SECRET_KEY as string,
    },
});

//保存
export const saveFile = async(Key:string, Body:Buffer): Promise<{result:boolean,message:string}> => {
    try{
        await s3Client.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key,
                Body,
            }),
        );
        return {result:true, message:'success'}
    }catch(err){
        const message = err instanceof Error ?  `saveFile error. ${err.message}` : `Something went wrong.`;
        return {result:false, message};
    }
}

//削除
export const deleteFile = async(Key:string): Promise<{result:boolean,message:string}> => {
    try{
        //存在しないkeyを指定したとして、エラーにはならない
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: bucketName,
                Key,
            })
        );
        return {result:true, message:'success'}
    }catch(err){
        const message = err instanceof Error ?  err.message : `Something went wrong.`;
        return {result:false, message}
    }
}
