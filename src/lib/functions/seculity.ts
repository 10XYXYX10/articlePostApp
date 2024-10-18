import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { AuthUser } from '@/lib/types';
import * as jose from 'jose';//middlewareで動かす場合、jsonwebtokenではエラーとなる
const jwtKeyFromEnv = process.env.jwtHashKey as string;

//認証パスワード：6桁のランダムな数値
export const generateRandomNumber6 = ():number => {
    return Math.floor(Math.random() * 900000) + 100000;    
}

// export const jwtAccessTokenEncode = async({
//     jwtKey,
//     objectData
// }:{
//     jwtKey:string;
//     objectData:AuthUser;
// }):Promise<{
//     result:boolean;
//     messag:string;
//     data:string;
// }> => {
//     try{
//         const token = await jwt.sign(objectData, jwtKey, { expiresIn: '1h' });
//         return {
//             result:true,
//             messag:'success',
//             data:token
//         };
//     }catch(err){
//         const errMessage = err instanceof Error ?  err.message : `Internal Server Error.`;
//         return {
//             result:false,
//             messag:errMessage,
//             data:'',
//         };
//     }
// }
export const jwtAccessTokenEncode = async({
    jwtKey,
    objectData
}:{
    jwtKey:string;
    objectData:AuthUser;
}):Promise<{
    result:boolean;
    messag:string;
    data:string;
}> => {
    try{
        const jwtKeyUint8Array = new TextEncoder().encode(jwtKey);
        const token = await new jose.SignJWT(objectData)
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(jwtKeyUint8Array);
        return {
            result:true,
            messag:'success',
            data:token
        };
    }catch(err){
        const errMessage = err instanceof Error ?  err.message : `Internal Server Error.`;
        return {
            result:false,
            messag:errMessage,
            data:'',
        };
    }
}

// export const jwtAccessTokenDecode = async ({
//     jwtKey,
//     jwtEncoded
// }:{
//     jwtKey:string;
//     jwtEncoded:string;
// }):Promise<{
//     result:boolean;
//     messag:string;
//     data:string|jwt.JwtPayload;
// }> => {
//     try{
//         const jwtDecoded = await jwt.verify(jwtEncoded, jwtKey);
//         return {
//             result:true,
//             messag:'success',
//             data:jwtDecoded
//         };
//     }catch(err){
//         const errMessage = err instanceof Error ?  `decoded err.${err.message}` : `Internal Server Error.`;
//         return {
//             result:false,
//             messag:errMessage,
//             data:'',
//         };
//     }   
// }
export const jwtAccessTokenDecode = async ({
    jwtKey,
    jwtEncoded
}:{
    jwtKey:string;
    jwtEncoded:string;
}):Promise<{
    result:boolean;
    messag:string;
    data:string|jose.JWTPayload;
}> => {
    try{
        const jwtKeyUint8Array = new TextEncoder().encode(jwtKey);
        const { payload } = await jose.jwtVerify(jwtEncoded, jwtKeyUint8Array);
        return {
            result:true,
            messag:'success',
            data:payload
        };
    }catch(err){
        const errMessage = err instanceof Error ?  `decoded err.${err.message}` : `Internal Server Error.`;
        return {
            result:false,
            messag:errMessage,
            data:'',
        };
    }   
}

export const security = async (jwtEncodedStr?:string):Promise<{
    result:boolean;
    data:AuthUser|null;
    message:string,
}> => {
    try{
        // await new Promise((resolve) => setTimeout(resolve, 6000))
        
        //////////
        //■[ jwt認証 ]
        const jwtEncoded = jwtEncodedStr ? jwtEncodedStr : cookies().get('accessToken')?.value;
        if(!jwtEncoded)throw new Error('Authentication error.');

        const jwtDecodeResult = await jwtAccessTokenDecode({jwtKey:jwtKeyFromEnv,jwtEncoded});
        if(!jwtDecodeResult.result){
            if(jwtEncoded)cookies().delete('accessToken');
            throw new Error('Authentication error.' + jwtDecodeResult.messag);
        }

        const jwtDecoded = jwtDecodeResult.data;
        if(typeof jwtDecoded !== 'object'){
            if(jwtEncoded)cookies().delete('accessToken');
            throw new Error('Authentication error.');
        }
        const id = jwtDecoded.id as number;
        const name = jwtDecoded.name as string;
        if(!id || !name){
            if(jwtEncoded)cookies().delete('accessToken');
            throw new Error('Authentication error.');
        }

        //////////
        //■[ userの存在確認 ]
        //・middlewareでの認証:JWTのみチェック
        //・create,update,delete：JWT＋DBでデータチャック
        if(!jwtEncodedStr){
            const checkUser = await prisma.user.findUnique({
                where:{
                    id,
                    name,
                },
            });
            if(!checkUser){
                if(jwtEncoded)cookies().delete('accessToken');
                throw new Error('Authentication error.'); 
            }            
        }

        //////////
        //■[ return ]
        return {
            result:true,
            data:{
                id,
                name,
            },
            message:'success',
        }

    }catch(err){
        const errMessage = err instanceof Error ?  err.message : `Internal Server Error.`;
        return {
            result:false,
            data:null,
            message:errMessage,
        };
    }
}

// export const securityOnMiddleware = async (jwtEncoded:string|undefined):Promise<{
//     result:boolean;
//     authUser:AuthUser|null;
//     message:string,
// }> => {
//     try{
//         //■[ middlewareで、直で@prisma/clientを使用しようとするとエラーとなる ]
//         //・@prisma/client/edge なら可能
//         //・https://github.com/prisma/prisma/issues/21310    ←　DB セッションの代替手段としてJWTを使用することが提案されている
//         const {data} = await axios.patch<{authUser:AuthUser}>(`${apiUrl}/auth`,{jwtEncoded});//middlewareで動かす場合、直で@prisma/clientを使用しようとするとエラーとなる
//         if(!data.authUser)throw new Error('Something went wrong.');
//         return {
//             result:true,
//             authUser:data.authUser,
//             message:'success',
//         }
//     }catch(err){
//         const errMessage = err instanceof Error ?  err.message : `Internal Server Error.`;
//         return {
//             result:false,
//             authUser:null,
//             message:errMessage,
//         };
//     }
// }


export const saveAccessTokenInCookies = async({
    id,
    name,
}:{
    id:number;
    name:string;
}):Promise<{
    result:boolean;
    message:string;
}> => {
    try{
        //////////
        //■[ jwtトークン生成 ]
        const {result,messag,data} = await jwtAccessTokenEncode({jwtKey:jwtKeyFromEnv,objectData:{id,name}});
        if(!result)throw new Error(messag);
        const token = data;

        //////////
        //■[ jwtトークンをcookieに保存 ]
        cookies().set({
            name: 'accessToken',
            value: token,
            httpOnly: true, //クライアントサイドのJavaScriptでの操作を不可に
            sameSite: 'strict', //今回は、front,back共にNext.jsで作成しているので、cookieが同一サイト内のリクエストにのみ送信されるように設定
            secure: true, //セキュリティを強化のため、HTTPS接続でのみクッキーを送信
        });
        
        //////////
        //■[ return ]
        return {result:true,message:'success'}
    }catch(err){
        const errMessage = err instanceof Error ?  err.message : `Internal Server Error.`;
        return {result:false,message:errMessage}
    }
}
