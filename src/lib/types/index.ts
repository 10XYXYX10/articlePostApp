import { Thumbnail } from "@prisma/client"

//////////
//■[ 認証 ]
export type AuthUser = {
    id:number
    name:string
}

//////////
//■[ ServerActions ]
export interface SignUpFormState {
    error:string
    valueError:{
        name:string
        email:string
        password:string
    }
    email:string
}
export interface SignInFormState {
    error:string
    valueError:{
        email:string
        password:string
    }
    email:string
}
export interface MailAuthFormState {
    error:string
    valueError:{
        email:string
        authenticationPassword:string
    }
}
export interface SignOutState {
    error:string
}

//////////
//■[ PostForm ]
export type PostForm = {
    title:[string,string]//値,err文字
    description:[string,string]//値,err文字
}
export type MarkdownForm = {
    content:[string,string]//値,err文字
}

//////////
//■[ prisma fetch data ]
export type PostWithThumbnail =  {
    id: number;
    title: string;
    description: string;
    content?: string;
    thumbnailId: number | null;
    Thumbnail: Thumbnail | null;
    userId: number;
    createdAt: Date;
}
export type PostWithThumbnailList =  PostWithThumbnail[]
export type WhereObject = {
    userId?:number
    AND?: {
        OR: {
            title?: {
              contains: string;
            };
            description?: {
              contains: string;
            };
            content?: {
              contains: string;
            };
        }[]
    }[];
};
export type OptionObType = {
    select: {
        id: true,
        title: true,
        description: true,
        thumbnailId: true,
        Thumbnail:true,
        userId: true,
        createdAt: true,
    }
    where?:WhereObject
    orderBy?: { createdAt: 'desc'|'asc' }
    skip?: number
    take?: number
}
