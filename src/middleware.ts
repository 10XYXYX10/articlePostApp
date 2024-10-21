import { NextRequest, NextResponse } from 'next/server';
import { security } from './lib/functions/seculity';

export const middleware = async(request: NextRequest) => {
    const response = NextResponse.next()

    const jwtEncoded = request.cookies.get('accessToken')?.value;
    const {result,data} = await security(jwtEncoded);

    const redirectUrl = request.nextUrl.clone();
    const pathName = redirectUrl.pathname;
    const userId = Number(pathName.split('/')[2]);
    if(!result || userId!=data?.id){
      redirectUrl.pathname = '/auth';
      if(request.cookies.has('accessToken')){
        const response = NextResponse.redirect(redirectUrl)
        response.cookies.delete('accessToken')//middlewareを経由してredirectする場合、このアプローチでないとcookieの削除に失敗する。
        return response;
      }
      return NextResponse.redirect(redirectUrl)
    }

    return response;
};

export const config = {
  matcher: ['/user/:path*'],
};
