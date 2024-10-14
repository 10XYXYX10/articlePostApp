import prisma from "../prisma"
import { OptionObType, PostWithThumbnail, PostWithThumbnailList, WhereObject } from "../types"
import { htmlToSpace } from "./myValidation"

export const getPostWithThumbnailList = async({
    userId,
    search,
    sort,
    page,
    fetchCount,
}:{
    userId:number|null
    search:string
    sort:'desc'|'asc'
    page:number
    fetchCount:number
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
            }
        };
        //・userId
        let whereOb:WhereObject = userId ? {userId:Number(userId)} : {}
        //・search
        let searchList:string[]|null;
        if(search){
            //urlエンコードをデコード
            let parseProcess = decodeURIComponent(search);
            //htmlエンティティを無害化したものを半角スペースに変換
            parseProcess = htmlToSpace(parseProcess).trim();
            //半角スペースで区切って配列化
            searchList = parseProcess.split(' ')
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
        //optionOb更新
        if(userId){
            optionOb = {
                ...optionOb,
                where:whereOb
            }            
        }

        //・optionObにorderBy,skip,takeを追加
        optionOb = {
            ...optionOb,
            orderBy: { createdAt:sort }
        }
        optionOb = {
            ...optionOb,
            skip: Number(fetchCount*(page-1)),
            take: fetchCount+1,
        }

        //////////
        //■[ データ取得 ]
        const productList = await prisma.post.findMany(optionOb);

        return {
            result:true,
            message:'success',
            data:productList
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

export const getPostWithThumbnail = async(postId:number):Promise<{
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
            result:true,
            message,
            data:null,
        }
    }
}

export const getAllPostIds = async():Promise<{
    result:boolean
    message:string
    data:{id:number}[]|null
}> => {
    try{
        const postIdList = await prisma.post.findMany({
            select:{
                id:true
            }
        });
        if(!postIdList)throw new Error('404,postId is not exist');
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