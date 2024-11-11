import { security } from "@/lib/functions/seculity";
import { NextResponse } from "next/server";

//ログインチェック
export async function GET() {
    try{
        //////////
        //■[ セキュリティー ]
        const {result,data,message} = await security();
        if(!result)throw new Error(message)
        if(!data)throw new Error('Something went wrong.')

        //////////
        //■[ return ]
        return NextResponse.json( data , { status: 200});
    }catch(err){
        const message = err instanceof Error ?  err.message : `Internal Server Error.`;
        return NextResponse.json( {message}, { status: 500});
    }
}

//ログインチェック:middleware
// export async function PATCH(request: NextRequest) {
//     try{
//         //////////
//         //■[ request ]
//         const requestBody = await request.json();
//         const jwtEncoded = requestBody.jwtEncoded as string;
//         if(!jwtEncoded)throw new Error('Authentication error.');

//         //////////
//         //■[ セキュリティー ]
//         const {result,data,message} = await security(jwtEncoded);
//         if(!result || !data)throw new Error(message)

//         //////////
//         //■[ return ]
//         return NextResponse.json( {authUser:data} , { status: 200});
//     }catch(err){
//         const messag = err instanceof Error ?  err.message : `Internal Server Error.`;
//         console.log(`err.message-api:${messag}`)
//         return NextResponse.json( {messag}, { status: 500});
//     }
// }