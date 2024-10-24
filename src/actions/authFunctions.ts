'use server'
import { validationForAuthenticationPassword, validationForPassword, validationForEmail, validationForWord } from "@/lib/functions/myValidation";
import { generateRandomNumber6, saveAccessTokenInCookies } from "@/lib/functions/seculity";
import { sendMail } from "@/lib/nodemailer";
import prisma from "@/lib/prisma";
import { SignUpFormState, SignInFormState, SignOutState, MailAuthFormState} from "@/lib/types";
import * as bcrypt from 'bcrypt';
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

//新規User作成
export const signUp = async (state: SignUpFormState, formData: FormData) => {
    try{
        //////////
        //■[ formDataから値を取得 ]
        //・name
        const name = formData.get('name') as string;
        if(!name)state.valueError.name='Name is required';
        //・email
        const email = formData.get('email') as string;
        if(!email)state.valueError.email='email is required';
        //・password
        const password = formData.get('password') as string;
        if(!password)state.valueError.password='Password is required';
        //＊
        if(!name || !email || !password){
            state.error = 'Bad request error.'
            return state;
        }

        //////////
        //■[ validation ]
        //・name
        let result = validationForWord(name);
        if(!result.result){
            state.valueError.name=result.message;
        }else if(state.valueError.name){
            state.valueError.name='';
        }
        //・email
        result = validationForEmail(email);
        if(!result.result){
            state.valueError.email=result.message;
        }else if(state.valueError.email){
            state.valueError.email='';
        }
        //・password
        result = validationForPassword(password);
        if(!result.result){
            state.valueError.password=result.message;
        }else if(state.valueError.password){
            state.valueError.password='';
        }
        //＊
        if(state.valueError.name || state.valueError.email || state.valueError.password){
            state.error = 'Bad request error.';
            return state;
        }else if(state.error){
            state.error='';
        }

        //////////
        //■[ 不要データの削除 ]
        prisma.user.deleteMany({
            where: {
                verifiedEmail:false,
                createdAt: {
                    lt: new Date(Date.now() - 1000 * 60 * 4)//4分経過
                }
            }
        }).catch((err)=>console.log(err.message));

        //////////
        //■[ パスワードをハッシュ化 ]
        const hashed = await bcrypt.hash(password, 11);

        //////////
        //■[ 6桁の認証パスワードを生成 ]
        const randomNumber6 = generateRandomNumber6();

        //////////
        //■[ transaction ]
        await prisma.$transaction(async (prismaT) => {
            //新規User作成
            await prismaT.user.create({
                data: {
                    name,
                    email,
                    hashedPassword: hashed,
                    verifiedEmail:false,
                    authenticationPassword:randomNumber6,
                },
            });
            //認証メール送信
            const {result,message} = await sendMail({
                toEmail: email,
                subject: '二段階認証パスワード',
                text: '以下のパスワードを入力し、メールアドレス認証を完了させて下さい。有効期限は3分です。',
                html:`
                    <p>以下のパスワードを入力し、メールアドレス認証を完了させて下さい。有効期限は3分です。</p>
                    <br/>
                    <p>${randomNumber6}</p>
                `
            });
            if(!result)throw new Error(message);
        },
        {
            maxWait: 10000, // default: 2000
            timeout: 25000, // default: 5000
        }).catch((err)=>{
            throw err;
        });
        
        //////////
        //■[ return(処理成功) ]
        state.email = email;
        return state
        
    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        state.error = err instanceof Error ?  err.message : `Internal Server Error.`;
        return state;
    }
};


//ログイン
export const signIn = async (state: SignInFormState, formData: FormData) => {
    try{
        //////////
        //■[ formDataから値を取得 ]
        //・email
        const email = formData.get('email') as string;
        if(!email)state.valueError.email='email is required';
        //・password
        const password = formData.get('password') as string;
        if(!password)state.valueError.password='Password is required';
        //＊
        if(!email || !password){
            state.error = 'Bad request error.'
            return state;
        }

        //////////
        //■[ validation ]
        //・email
        let result = validationForEmail(email);
        if(!result.result){
            state.valueError.email=result.message;
        }else if(state.valueError.email){
            state.valueError.email='';
        }
        //・password
        result = validationForPassword(password);
        if(!result.result){
            state.valueError.password=result.message;
        }else if(state.valueError.password){
            state.valueError.password='';
        }
        //＊
        if(state.valueError.email || state.valueError.password){
            state.error = 'Bad request error.'
            return state;
        }else if(state.error){
            state.error='';
        }

        //////////
        //■[ 認証:メールアドレス,パスワード ]
        //・メールアドレス
        const checkUser = await prisma.user.findFirst({
            where:{
                email,
                verifiedEmail:true
            }
        });
        if(!checkUser){
            state.valueError.email = 'Your email or password is incorrect.';
            state.error = 'Your email or password is incorrect.'
            return state;
        }
        //・パスワード
        try{
            const result = await bcrypt.compare(password, checkUser.hashedPassword);
            if(!result){
                state.valueError.password = 'Your email or password is incorrect.';
                state.error = 'Your email or password is incorrect.'
                return state;
            }
        }catch(err){
            throw err;
        }

        //////////
        //■[ SMS認証 ]◆
        //・6桁の乱数を生成
        const randomNumber6 = generateRandomNumber6();
        //・User の authenticationPassword & updatedAt を更新
        await prisma.user.update({
            where:{id:checkUser.id},
            data:{
                authenticationPassword:randomNumber6,
                updatedAt: new Date()
            }
        });
        //・認証メール送信
        const sendMailResult = await sendMail({
            toEmail: email,
            subject: '2段階認証パスワード',
            text: '以下のパスワードを入力し、メールアドレス認証を完了させて下さい。有効期限は3分です。',
            html:`
                <p>以下のパスワードを入力し、メールアドレス認証を完了させて下さい。有効期限は3分です。</p>
                <br/>
                <p>${randomNumber6}</p>
            `
        });
        if(!sendMailResult.result)throw new Error(sendMailResult.message);
        
        //////////
        //■[ return(処理成功) ]
        state.email = email;
        return state
        
    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        state.error = err instanceof Error ?  err.message : `Internal Server Error.`;
        return state;
    }
};


//「signUp or signIn」→ SMS認証
export const mailAuth = async (
    typeValue: 'SignUp'|'SignIn',
    state: MailAuthFormState,
    formData: FormData
) => {
    let userId:number = 0;
    try{
        //////////
        //■[ formDataから値を取得 ]
        //email
        const email = formData.get('email') as string;
        //authenticationPassword
        const authenticationPassword = formData.get('authenticationPassword') as string;
        if(!authenticationPassword)state.valueError.authenticationPassword='authenticationPassword is required';
        //＊
        if(!email || !authenticationPassword){
            state.error = 'Bad request error.'
            return state;
        }

        //////////
        //■[ validation ]
        //・email
        let result = validationForEmail(email);
        if(!result.result){
            state.valueError.email=result.message;
        }else if(state.valueError.email){
            state.valueError.email='';
        }
        //・authenticationPassword
        result = validationForAuthenticationPassword(authenticationPassword);
        if(!result.result){
            state.valueError.authenticationPassword=result.message;
        }else if(state.valueError.authenticationPassword){
            state.valueError.authenticationPassword='';
        }
        //＊
        if(state.valueError.email || state.valueError.authenticationPassword){
            state.error = 'Bad request error.'
            return state;
        }else if(state.error){
            state.error='';
        }

        //////////
        //■[ userチェック～経過時間の検証 ]
        const checkUser = await prisma.user.findUnique({
          where:{
            email,
          }
        });
        //Userが存在しない
        if(!checkUser)throw new Error(`something went wrong. Please try again.`);
        userId = checkUser.id;
        //ログインを試みたが、メールアドレスの認証が未完了
        if(typeValue=='SignIn' && !checkUser.verifiedEmail)throw new Error('That user is disabled. SMS authentication has not been completed.');
        //認証パスワードが違う
        if(checkUser.authenticationPassword!==Number(authenticationPassword))throw new Error(`Authentication password is incorrect.`);
        //経過時間の検証：3分以上経過していたらエラーとする
        const beforeTime = checkUser.updatedAt;
        const currentTime = new Date();
        const elapsedMilliseconds = currentTime.getTime() - beforeTime.getTime();// beforeTimeから現在の日時までの経過時間(ミリ秒単位)を計算
        const elapsedMinutes = elapsedMilliseconds / (1000 * 60);// 経過時間を分単位に変換
        if (elapsedMinutes >= 3){
          if(typeValue==='SignUp')await prisma.user.delete({where:{id:userId}});//User新規作成時、3分超過により認証が失敗した場合は、Userを削除
          throw new Error(`More than 3 minutes have passed. Please try again.`);
        }

        //////////
        //■[ 新規作成時のSMS認証なら、verifiedemail:true に更新 ]
        if(typeValue==='SignUp'){
            await prisma.user.update({
                where:{id:userId},
                data:{
                    verifiedEmail:true
                }
            });
        }

        //////////
        //■[ accessToken をサーバーサイドcookiesに保存 ]
        const savedResult = await saveAccessTokenInCookies({id:userId, name:checkUser.name});
        if(!savedResult.result)throw new Error(savedResult.message);
        
    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        state.error = err instanceof Error ?  err.message : `Internal Server Error.`;
        return state;
    }

    //////////
    //■[ 処理成功 ]
    redirect(`/user/${userId}`);
}


export const signOut = async(state: SignOutState) => {
    try{
        //////////
        //■[ jwtをサーバーサイドcookieから削除 ]
        const judge = cookies().get('accessToken');
        if(judge)cookies().delete('accessToken');

    }catch(err){
        //////////
        //■[ return(処理失敗) ]
        state.error = err instanceof Error ?  err.message : `Internal Server Error.`;
        return state;
    }
    
    //////////
    //■[ 処理成功 ]
    redirect('/auth');
} 