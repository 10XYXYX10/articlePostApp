import { generateRandomNumber6, security } from "@/lib/functions/seculity";
import prisma from "@/lib/prisma";
import { Thumbnail } from "@prisma/client";
import { NextResponse } from "next/server";
import { deleteThumbnails } from "./thumbnailFc";
import { deleteFile, saveFile } from "@/lib/s3";

export async function POST(request: Request) {
    try{
        //////////
        //■[ セキュリティー ]
        const {result,data,message} = await security();
        if(!result || !data)return NextResponse.json( {message}, {status:401});
        const userId = data.id;

        //////////
        //■[ クエリパラメータ ]
        const { searchParams } = new URL(request.url);
        //typeVal
        const typeVal = searchParams.get('type');
        if(typeVal!=='jpg' && typeVal!=='png')return NextResponse.json( {message:'Bad request. Type is not correct'}, {status:400});
        //width,height,size
        const width = searchParams.get('width') ? Number(searchParams.get('width')) :null;
        const height = searchParams.get('height') ? Number(searchParams.get('height')) : null;
        const size = searchParams.get('size') ? Number(searchParams.get('size')) : null;
        if(!width || !height || !size)return NextResponse.json( {message:'Bad request.'}, {status:400});

        //////////
        //■[ request ]
        console.log('thumbnail-post-request')
        const formData = await request.formData();
        const fileFormForm = typeVal==='jpg' ? formData.get("jpg") : formData.get("png");
        if(!fileFormForm || !(fileFormForm instanceof Blob) )return NextResponse.json( {message:'Bad request.zz'}, {status:400});
        const file = Buffer.from(await fileFormForm?.arrayBuffer());

        // //////////
        // //◆【非同期でゴミ掃除】
        deleteThumbnails().catch((err)=>console.log(err.message));

        //////////
        //◆【uploadOriginFilePath】
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hour = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');
        const currentTimeStr = year+month+day+hour+minutes+seconds;
        const random = generateRandomNumber6();
        const fileDir = `thumbnail/${currentTimeStr}_${random}`;
        const fileName = fileDir+`.${typeVal}`;

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
            maxWait: 20000, // default: 2000
            timeout: 300000, // default: 5000, 300000=5分
        }).catch(async (err)=>{
            const message = err instanceof Error ?  `Failed transaction. ${err.message}.` : `Failed transaction. Something went wrong.`;
            throw new Error(message);
        })

        return NextResponse.json(newThumbnail, {status:200});
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
        if(!thumbnailId)return NextResponse.json( {message:'Bad request.'}, {status:400});


        //////////
        //■[ 削除対処のThumbnailを取得 ]
        const targetThumbnail = await prisma.thumbnail.findUnique({
            where:{
                id:thumbnailId
            }
        });
        if(!targetThumbnail)return NextResponse.json( {message:'Bad request.'}, {status:400});
        if(targetThumbnail.userId != userId)return NextResponse.json( {message:'No permission'}, {status:401});
        
        //////////
        //◆【transaction】
        await prisma.$transaction(async (prismaT) => {
            //対象のDB[thumbnai]削除
            await prismaT.thumbnail.delete({
                where:{id:thumbnailId}
            });
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
        
        return NextResponse.json({message:'success!!'}, {status:200});

    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return NextResponse.json({ message }, {status:500});
    }
}