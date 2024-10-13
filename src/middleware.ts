import { NextRequest, NextResponse } from 'next/server';
import { securityOnMiddleware } from './lib/functions/seculity';

export const middleware = async(request: NextRequest) => {
    const response = NextResponse.next()

    const redirectUrl = request.nextUrl.clone();
    const pathName = redirectUrl.pathname;
    const jwtEncoded = request.cookies.get('accessToken')?.value;
    const {result,authUser} = await securityOnMiddleware(jwtEncoded);

    if(result && pathName.startsWith('/auth') && authUser){
      redirectUrl.pathname = `/user/${authUser.id}`;
      return NextResponse.redirect(redirectUrl)

    }else if(!result && pathName.startsWith('/user')){
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
  matcher: ['/user/:path*','/auth/:path*'],
};
