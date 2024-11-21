import { NextRequest, NextResponse } from 'next/server';
import { security } from './lib/functions/seculity';

export const middleware = async(request: NextRequest) => {
  const responseNext = NextResponse.next()

  const jwtEncoded = request.cookies.get('accessToken')?.value;
  const {result,data} = await security(jwtEncoded);
  console.log(JSON.stringify({result,data}))

  const pathName = request.nextUrl.pathname;
  const userId = Number(pathName.split('/')[2]);//「/user/<認証済みuserId>」
  console.log(`userId:${userId}`)

  // if(!result || userId!=data?.id){    
  //   const redirectUrl = request.nextUrl.clone();
  //   redirectUrl.pathname = '/auth';
  //   const response = NextResponse.redirect(redirectUrl)
  //   // if(request.cookies.has('accessToken')){
  //   //   response.cookies.delete('accessToken')//middlewareを経由してredirectする場合、このアプローチでないとcookieの削除に失敗する。
  //   // }
  //   return response;
  // }

  return responseNext;
};

export const config = {
  matcher: ['/user/:path*'],
};
