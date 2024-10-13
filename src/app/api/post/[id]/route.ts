import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request,{params}:{params:{id:string}}) {
    try{
        //////////
        //■[ クエリパラメータprocessの値で処理を分岐 ]
         const postId = Number(params.id);

        //////////
        //■[ データ取得～return ]
        const post = await prisma.post.findUnique({
            where:{
                id:postId
            },
            select:{
                id: true,
                title: true,
                description: true,
                content:true,
                thumbnailId: true,
                Thumbnail:true,
                userId: true,
                createdAt: true,
            }
        });
        if(!post)return NextResponse.json( {message:'Not Found.'}, {status:400});
        return NextResponse.json(post,{status:200});
        
    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return NextResponse.json({ message }, {status:500});
    }
}