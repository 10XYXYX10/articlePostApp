import { NextRequest, NextResponse } from 'next/server';
import { securityOnMiddleware } from './lib/functions/seculity';

export const middleware = async(request: NextRequest) => {
    const response = NextResponse.next()

    const jwtEncoded = request.cookies.get('accessToken')?.value;
    const {result} = await securityOnMiddleware(jwtEncoded);

    if(!result){
      const redirectUrl = request.nextUrl.clone();
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
