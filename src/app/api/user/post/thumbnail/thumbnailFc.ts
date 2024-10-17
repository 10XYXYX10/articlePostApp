import prisma from "@/lib/prisma";
import { deleteFile } from "@/lib/s3";

export const deleteThumbnails = async():Promise<void> => {
    try{
        //////////
        //◆【(Thumbnail.Post.length===0 && Thumbnail.createdAt=60min以上経過)で全権取得】
        const targetThumbnails = await prisma.thumbnail.findMany({
            where:{
                Post: {
                    none: {} 
                },
                createdAt: {
                    lt: new Date(Date.now() - 1000 * 60 * 60 * 1)
                }
            }
        });
        //////////
        //◆【ループ処理で削除】
        for(let i=0; i<targetThumbnails.length; i++){
            const targetThumbnail = targetThumbnails[i];
            //////////
            //◆【transaction】
            await prisma.$transaction(async (prismaT) => {
                //対象のDB[Thumbnail]削除
                await prismaT.thumbnail.delete({
                    where:{id:targetThumbnail.id}
                });
                //S3から対象の画像を削除
                const {result,message} = await deleteFile(targetThumbnail.path);
                if(!result)throw new Error(message);
            },
            {
                maxWait: 10000, // default: 2000
                timeout: 25000, // default: 5000,
            }).catch(async (err)=>{
                const message = err instanceof Error ?  `Failed transaction. ${err.message}.` : `Failed transaction. Something went wrong.`;
                throw new Error(message);
            });
        }
        //console.log('success!!deleteThumnails')
    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Something went wrong.`;
        console.log( message);
    }
}