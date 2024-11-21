import prisma from "../prisma"
import { OptionObType, PostWithThumbnail, PostWithThumbnailList, WhereObject } from "../types"
import { cache } from 'react'//https://ja.next-community-docs.dev/docs/app/building-your-application/caching
const fetchCount = process.env.NEXT_PUBLIC_FETCH_COUNT ? Number(process.env.NEXT_PUBLIC_FETCH_COUNT) : 10;

//cache：Request Memoization！重複排除！ ← 「generateMetaData内でも、2重にデータ取得!」の様な実装はしてないので、省略可
export const getPostWithThumbnailList = cache(async({
    userId,
    search,
    sort,
    page,
}:{
    userId:number|null
    search:string
    sort:'desc'|'asc'
    page:number
}):Promise<{
    result:boolean
    message:string
    data:PostWithThumbnailList|null
}> =>{
    try{
        //////////
        //■[ Prismaを用いたデート取得のためのパラメータを調整 ]
        let optionOb:OptionObType = {
            select:{
                id: true,
                title: true,
                description: true,
                thumbnailId: true,
                Thumbnail:true,
                userId: true,
                createdAt: true,
                updatedAt: true,
            }
        };
        //・userId
        let whereOb:WhereObject = userId ? {userId:Number(userId)} : {}
        //・search
        if(search){
            //半角スペースで区切って配列化
            let searchList:string[] = search.split(' ');//dangerousCharToSpace(search).trim();
            searchList = searchList.filter((val) => val!=''); 
            //whereOb
            whereOb = {
                ...whereOb,
                AND:searchList.map((search) => ({
                    OR: [
                        { title:{ contains: search } },
                        { description:{ contains: search } },
                        { content: {contains: search } },
                    ]
                })) 
            }
        }
        //・optionObにorderBy,skip,takeを追加
        optionOb = {
            ...optionOb,
            where:whereOb,
            orderBy: { createdAt:sort },
            skip: Number(fetchCount*(page-1)),
            take: fetchCount+1,
        }

        //////////
        //■[ データ取得 ]
        const postList = await prisma.post.findMany(optionOb);

        return {
            result:true,
            message:'success',
            data:postList
        }
    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return {
            result:false,
            message,
            data:null,
        }
    }
});

//cache：Request Memoization！重複排除！
export const getPostWithThumbnail = cache(async(postId:number):Promise<{
    result:boolean
    message:string
    data:PostWithThumbnail|null
}> => {
    try{
        const post:PostWithThumbnail|null = await prisma.post.findUnique({
            where:{
                id:postId
            },
            include:{
                Thumbnail:true,
            }
        });
        if(!post)throw new Error('404 not found');
        return {
            result:true,
            message:'success',
            data:post,
        }
    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return {
            result:false,
            message,
            data:null,
        }
    }
});

// ■[ 「Can't reach database server at `aws・・・」のエラーについて ]
// ・supabaseの無料利用枠を利用していて、リクエストが集中すると、このエラーが発生する。
// 	これは、記事数が多くなってきた状態で、「npm run build」を実行すると度々生じる。
// ・ビルド時にSSGを適用する記事数に上限を設ければ回避可能
// ・所詮は無料利用枠と割り切るべき
export const getAllPostIds = async():Promise<{
    result:boolean
    message:string
    data:{id:number}[]|null
}> => {
    try{
        const postIdList = await prisma.post.findMany({
            select:{
                id:true
            },
            take:5
        });
        return {
            result:true,
            message:'success',
            data:postIdList,
        }
    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return {
            result:false,
            message,
            data:null,
        }
    }
}