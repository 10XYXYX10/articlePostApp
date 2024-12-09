import { security } from "@/lib/functions/seculity";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { dangerousCharToEntity, validationForWord } from "@/lib/functions/myValidation";
import { deleteFile } from "@/lib/s3";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
    try{        
        //////////
        //■[ セキュリティー ]
        const {result,data,message} = await security();
        if(!result || !data)return NextResponse.json( {message}, {status:401});
        const userId = data.id;

        //////////
        //■[ request ]
        const requestBody = await request.json();
        const {title,description,content,thumbnailId} = requestBody;
        if(!title || !description || !content || !thumbnailId )return NextResponse.json( {message:`Bad request.`}, {status:400});
        const thumbnailIdNum = Number(thumbnailId);

        //////////
        //■[ バリデーション ]
        //title
        let validationResult = validationForWord(title,200);
        if( !validationResult.result)return NextResponse.json( {message:`Bad request.${validationResult.message}`}, {status:400});
        //description
        validationResult = validationForWord(description,400);
        if( !validationResult.result)return NextResponse.json( {message:`Bad request.${validationResult.message}`}, {status:400});
        //content
        if(content.length>5000)return NextResponse.json( {message:`Bad request. The content is limited to 5000 characters.`}, {status:400});
        const contentRe = dangerousCharToEntity(content);
        // thumbnailId
        if(isNaN(thumbnailIdNum))return NextResponse.json( {message:`Bad request. The thumbnailId is not correct.`}, {status:400});
        const thumbnail = await prisma.thumbnail.findUnique({
            where:{
                id:thumbnailIdNum
            }
        });
        if(!thumbnail)return NextResponse.json( {message:`Bad request. The thumbnailId is not correct.`}, {status:400});

        //////////
        //■[ 同期：Article.process=runningで新規作成 ]
        const post = await prisma.post.create({
            data:{
                title,
                description,
                content:contentRe,
                userId,
                thumbnailId:thumbnailIdNum,
            }
        });

        //////////
        //■[ return ]
        return NextResponse.json({postId:post.id},{status:201});

    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return NextResponse.json({ message }, {status:500});
    }
}


export async function PUT(request: NextRequest) {
    try{
        //////////
        //■[ セキュリティー ]
        const {result,data,message} = await security();
        if(!result || !data)return NextResponse.json( {message}, {status:401});
        const userId = data.id;
    
        //////////
        //■[ request ]
        const requestBody = await request.json();
        const {title,description,content,thumbnailId,postId} = requestBody;
        if(!title || !description || !content || !thumbnailId || !postId )return NextResponse.json( {message:`Bad request.`}, {status:400});
        const thumbnailIdNum = Number(thumbnailId);

        //////////
        //■[ バリデーション ]
        //title
        let validationResult = validationForWord(title,200);
        if( !validationResult.result)return NextResponse.json( {message:`Bad request.${validationResult.message}`}, {status:400});
        //description
        validationResult = validationForWord(description,400);
        if( !validationResult.result)return NextResponse.json( {message:`Bad request.${validationResult.message}`}, {status:400});
        //content
        if(content.length>5000)return NextResponse.json( {message:`Bad request. The content is limited to 5000 characters.`}, {status:400});
        const contentRe = dangerousCharToEntity(content);
        // thumbnailId
        if(isNaN(thumbnailIdNum))return NextResponse.json( {message:`Bad request. The thumbnailId is not correct.`}, {status:400});
        const thumbnail = await prisma.thumbnail.findUnique({
            where:{
                id:thumbnailIdNum,
                userId,
            }
        });
        if(!thumbnail)return NextResponse.json( {message:`Bad request. The thumbnailId is not correct.`}, {status:400});
                
        //////////
        //■[ 更新対象postの存在＆userIdの確認 ]
        const targetPost = await prisma.post.findUnique({where:{id:postId}});
        if(!targetPost)return NextResponse.json( {message:`Not Found.`}, {status:404});
        if(targetPost.userId != userId)return NextResponse.json( {message:'Authentication failed.'}, {status:401});

        //////////
        //■[ 更新 ]
        await prisma.post.update({
            where:{id:targetPost.id},
            data:{
                title,
                description,
                content:contentRe,
                thumbnailId,
            }
        });
        revalidatePath(`/post/${targetPost.id}`);

        //////////
        //■[ return ]
        return NextResponse.json({message:'succes!!'},{status:200});//204,,,response返してるから今回は200番で

    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return NextResponse.json({ message }, {status:500});
    }
}

export async function DELETE(request: NextRequest) {
    try{
        //////////
        //■[ セキュリティー ]
        const {result,data,message} = await security();
        if(!result || !data)return NextResponse.json( {message}, {status:401});
        const userId = data.id;

        //////////
        //■[ クエリパラメータ ]
        const { searchParams } = new URL(request.url);
        //postId
        const postId = searchParams.get('postId') ? Number(searchParams.get('postId')) : null;
        if(!postId)return NextResponse.json( {message:`Bad request.`}, {status:400});

    
        //////////
        //■[ 更新対象postの存在＆userIdの確認 ]
        const targetPost = await prisma.post.findUnique({
            where:{
                id:postId,
                userId,
            },
            include:{
                Thumbnail:true,
            }
        });
        if(!targetPost)return NextResponse.json( {message:`Not Found.`}, {status:404});
        if(targetPost.userId != userId)return NextResponse.json( {message:'Authentication failed.'}, {status:401});
    
        //////////
        //■[ transaction ]
        await prisma.$transaction(async (prismaT) => {
            //////////
            //■[ targetPost削除 ]
            await prismaT.post.delete({where:{id:postId}});
        
            //////////
            //■[ Thumbnail.pathに対応するS3オブジェクトを削除 ]
            if(targetPost.Thumbnail && targetPost.thumbnailId){
                //Thumbnailを削除                
                await prismaT.thumbnail.delete({where:{id:targetPost.thumbnailId}});
                //S3オブジェクトを削除
                const {result,message} = await deleteFile(targetPost.Thumbnail.path)
                if(!result)throw new Error(`Failed to delete the targetS3File. ${message}`);
            }
        },
        {
            maxWait: 10000, // default: 2000
            timeout: 25000, // default: 5000
        }).catch(async (err)=>{
            const message = err instanceof Error ?  `Failed transaction. ${err.message}.` : `Failed transaction. Something went wrong.`;
            throw new Error(message);
        });
        
        //////////
        //■[ revalidate ]
        revalidatePath(`/post/${targetPost.id}`);

        //////////
        //■[ return ]
        return NextResponse.json({message:'succes!!'},{status:200});

    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return NextResponse.json({ message }, {status:500});
    }
}