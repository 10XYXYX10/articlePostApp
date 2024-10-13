import { security } from "@/lib/functions/seculity";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { validationForWord } from "@/lib/functions/myValidation";
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

        //////////
        //■[ バリデーション ]
        //title
        let validationResult = validationForWord(title,200);
        if( !validationResult.result)return NextResponse.json( {message:`Bad request.${validationResult.message}`}, {status:400});
        //description
        validationResult = validationForWord(description,400);
        if( !validationResult.result)return NextResponse.json( {message:`Bad request.${validationResult.message}`}, {status:400});

        //////////
        //■[ 同期：Article.process=runningで新規作成 ]
        const post = await prisma.post.create({
            data:{
                title,
                description,
                content,
                userId: userId,
                thumbnailId:Number(thumbnailId),
            }
        });

        // console.log(`revalidatePath：/user/${userId}`)
        // revalidatePath(`/user/${userId}`);

        //////////
        //■[ return ]
        return NextResponse.json({postId:post.id},{status:200});

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

        //////////
        //■[ バリデーション ]
        //title
        let validationResult = validationForWord(title,200);
        if( !validationResult.result)return NextResponse.json( {message:`Bad request.${validationResult.message}`}, {status:400});
        //description
        validationResult = validationForWord(description,400);
        if( !validationResult.result)return NextResponse.json( {message:`Bad request.${validationResult.message}`}, {status:400});
                
        //////////
        //■[ 更新対象postの存在＆userIdの確認 ]
        const targetPost = await prisma.post.findUnique({where:{id:postId}});
        if(!targetPost)return NextResponse.json( {message:`Not Found.`}, {status:404});
        if(targetPost.userId != userId)return NextResponse.json( {message:'Authentication failed.'}, {status:401});

        //////////
        //■[ 新規作成 ]
        await prisma.post.update({
            where:{id:targetPost.id},
            data:{
                title,
                description,
                content,
                thumbnailId,
            }
        });

        console.log(`revalidatePath：/post/${targetPost.id}`)
        revalidatePath(`/post/${targetPost.id}`);

        //////////
        //■[ return ]
        return NextResponse.json({message:'succes!!'},{status:200});

    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return NextResponse.json({ message }, {status:500});
    }
}

export async function DELETE(request: NextRequest) {
    try{
        //////////
        //■[ クエリパラメータ ]
        const { searchParams } = new URL(request.url);
        //postId
        const postId = searchParams.get('postId') ? Number(searchParams.get('postId')) : null;
        if(!postId)return NextResponse.json( {message:`Bad request.`}, {status:400});

        //////////
        //■[ セキュリティー ]
        const {result,data,message} = await security();
        if(!result || !data)return NextResponse.json( {message}, {status:401});
        const userId = data.id;
    
        //////////
        //■[ 更新対象postの存在＆userIdの確認 ]
        const targetPost = await prisma.post.findUnique({
            where:{id:postId},
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
                const targetFilePath = targetPost.Thumbnail.path;
                const {result,message} = await deleteFile(targetFilePath)
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
        
        console.log(`revalidatePath：/post/${targetPost.id}`)
        revalidatePath(`/post/${targetPost.id}`);

        //////////
        //◆【return】
        return NextResponse.json({message:'succes!!'},{status:200});

    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return NextResponse.json({ message }, {status:500});
    }
}