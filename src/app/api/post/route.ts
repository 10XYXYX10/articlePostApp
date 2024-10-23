import { dangerousCharToSpace } from "@/lib/functions/myValidation";
import prisma from "@/lib/prisma";
import { OptionObType, WhereObject } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

const fetchCount = process.env.NEXT_PUBLIC_FETCH_COUNT ? Number(process.env.NEXT_PUBLIC_FETCH_COUNT) : 10;

export async function GET(request: NextRequest) {
    try{
        await new Promise((resolve) => setTimeout(resolve, 5000))
        //////////
        //■[ queryParameter ]
        const { searchParams } = new URL(request.url);
        //search
        const search:string = searchParams.get('search') as string;
        //sort
        const sort = searchParams.get('sort') as string;
        const sortVal:'desc'|'asc' = !sort||(sort!='desc'&&sort!='asc') ? 'desc' : 'asc';
        //page
        const page = searchParams.get('page') as string;
        let pageNum = Number(page);
        if(!pageNum)pageNum=1;

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
        let whereOb:WhereObject = {}
        //・search
        let searchList:string[]|null;
        if(search){
            //urlエンコードをデコード
            let parseProcess = decodeURIComponent(search);
            //htmlエンティティを無害化したものを半角スペースに変換
            parseProcess = dangerousCharToSpace(parseProcess).trim();
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
            //optionOb更新
            optionOb = {
                ...optionOb,
                where:whereOb
            }
        }
        //・optionObにorderBy,skip,takeを追加
        optionOb = {
            ...optionOb,
            orderBy: { createdAt:sortVal }
        }
        optionOb = {
            ...optionOb,
            skip: Number(fetchCount*(pageNum-1)),
            take: fetchCount,
        }

        //////////
        //■[ データ取得 ]
        const postList = await prisma.post.findMany(optionOb);
        return NextResponse.json(postList,{status:200});
        
    }catch(err){
        const message = err instanceof Error ?  `${err.message}.` : `Internal Server Error.`;
        return NextResponse.json({ message }, {status:500});
    }
}
