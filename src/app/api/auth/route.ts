import { security } from "@/lib/functions/seculity";
import { NextResponse } from "next/server";

//ログインチェック
export async function GET() {
    try{
        //////////
        //■[ セキュリティー ]
        const {result,data,message} = await security();
        if(!result)return NextResponse.json( {message}, { status: 401});
        if(!data)throw new Error('Something went wrong.')

        //////////
        //■[ return ]
        return NextResponse.json( data , { status: 200});
    }catch(err){
        const message = err instanceof Error ?  err.message : `Internal Server Error.`;
        return NextResponse.json( {message}, { status: 500});
    }
}

