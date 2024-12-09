import { security } from "@/lib/functions/seculity";
import { v4 } from 'uuid';//v4は、完全にランダムな値でuuidを生成//v1は、時間ベースでuuidを生成
import prisma from "@/lib/prisma";
import { Thumbnail } from "@prisma/client";
import { NextResponse } from "next/server";
import { deleteFile, saveFile } from "@/lib/s3";
import { deleteThumbnails } from "./thumbnailFc";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    try{
        //////////
        //■[ セキュリティー ]
        const {result,data,message} = await security();
        if(!result || !data)return NextResponse.json( {message}, {status:401});//HTTP 401 Unauthorized
        const userId = data.id;

        //////////
        //■[ クエリパラメータ ]
        const { searchParams } = new URL(request.url);
        //typeVal
        const typeVal = searchParams.get('type');
        if(typeVal!=='jpg')return NextResponse.json( {message:'Bad request. Type is not correct'}, {status:400});
        //width,height,size
        const width = searchParams.get('width') ? Number(searchParams.get('width')) :null;
        const height = searchParams.get('height') ? Number(searchParams.get('height')) : null;
        const size = searchParams.get('size') ? Number(searchParams.get('size')) : null;
        if(!width || !height || !size)return NextResponse.json( {message:'Bad request.'}, {status:400});

        //////////
        //■[ request ]
        const formData = await request.formData();
        const fileFormForm = formData.get("jpg");
        if(!fileFormForm || !(fileFormForm instanceof Blob) )return NextResponse.json( {message:'Bad request.'}, {status:400});
        const file = Buffer.from(await fileFormForm?.arrayBuffer());

        // //////////
        // //◆【非同期でゴミ掃除】
        deleteThumbnails().catch((err)=>console.log(err.message));

        //////////
        //◆【uploadOriginFilePath】
        const uuid = v4();
        const fileName = `thumbnail/${uuid}_${userId}.${typeVal}`;

        //////////
        //◆【transaction】
        let newThumbnail:Thumbnail|null = null;
        await prisma.$transaction(async (prismaT) => {
            //Thumbnail新規作成
            newThumbnail = await prismaT.thumbnail.create({
                data:{
                    path:fileName,
                    type:typeVal,
                    width:width,
                    height:height,
                    size:size,
                    userId,
                }
            });
            //S3に保存
            const {result,message} = await saveFile(fileName,file);
            if(!result)throw new Error(message);
        },
        {
            maxWait: 10000, // default: 2000
            timeout: 25000, // default: 25000
        }).catch(async (err)=>{
            const message = err instanceof Error ?  `Failed transaction. ${err.message}.` : `Failed transaction. Something went wrong.`;
            throw new Error(message);
        })

        return NextResponse.json(newThumbnail, {status:201});
    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return NextResponse.json({ message }, {status:500});
    }
}

export async function DELETE(request: Request) {
    try{
        //////////
        //■[ セキュリティー ]
        const {result,data,message} = await security();
        if(!result || !data)return NextResponse.json( {message}, {status:401});
        const userId = data.id;

        //////////
        //■[ クエリパラメータ ]
        const { searchParams } = new URL(request.url);
        //thumbnailId
        const thumbnailId = searchParams.get('thumbnailId') ? Number(searchParams.get('thumbnailId')) :null;
        if(!thumbnailId)return NextResponse.json( {message:'Bad request. ThumbnailId is not exist.'}, {status:400});


        //////////
        //■[ 削除対処のThumbnailを取得 ]
        const targetThumbnail = await prisma.thumbnail.findUnique({
            where:{
                id:thumbnailId
            },
            include:{
                Post:true
            }
        });
        if(!targetThumbnail)return NextResponse.json( {message:'Bad request.'}, {status:400});
        if(targetThumbnail.userId != userId)return NextResponse.json( {message:'No permission'}, {status:401});
        const targetPost = targetThumbnail.Post[0];
        
        //////////
        //■[ transaction ]
        await prisma.$transaction(async (prismaT) => {
            //対象のDB[thumbnai]削除
            await prismaT.thumbnail.delete({
                where:{id:thumbnailId}
            });
            //紐づいたPostを更新
            if(targetPost){
                await prismaT.post.update({
                    where:{
                        id:targetPost.id
                    },
                    data:{
                        thumbnailId:null
                    }
                })
            }
            //S3から対象の画像を削除
            const {result,message} = await deleteFile(targetThumbnail.path);
            if(!result)throw new Error(message);
        },
        {
            maxWait: 20000, // default: 2000
            timeout: 300000, // default: 5000, 300000=5分
        }).catch(async (err)=>{
            const message = err instanceof Error ?  `Failed transaction. ${err.message}.` : `Failed transaction. Something went wrong.`;
            throw new Error(message);
        });
        
        //////////
        //■[ revalidate ]
        if(targetPost)revalidatePath(`/post/${targetPost.id}`);

        //////////
        //■[ return ]
        return NextResponse.json({message:'success!!'}, {status:200});

    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return NextResponse.json({ message }, {status:500});
    }
}