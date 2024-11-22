import { getAllPostIds } from "@/lib/functions/fetchFnc";
import { PostWithThumbnail } from "@/lib/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/github-markdown-light.css";
import PostSingle from "@/components/post/PostSingle";

const appUrl = process.env.NEXT_PUBLIC_APP_URL as string;
const mediaPath = process.env.NEXT_PUBLIC_MEDIA_PATH as string;

export async function generateStaticParams() {
  const {result,message,data} = await getAllPostIds();
  if(!result || !data)throw new Error(message);
  return data.map(({id}) => ({
      id:id.toString()
  }));
}

const getOnePost = async(postId:number):Promise<PostWithThumbnail> => {
  const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${postId}`,
      {
          cache: 'force-cache'
          //cache: 'no-store'
      }
  );
  if(res.status===404)notFound();
  if (!res.ok) throw new Error('Failed to fetch data in server')// HTTPステータスコードが400以上の場合、エラーとして処理
  const postData:PostWithThumbnail = await res.json();
  return postData;
}

// const getOnePost = async(postId:number):Promise<PostWithThumbnail> => {
//   //■[ Next-V-14.2.14ではデフォルトがSSG。generateStaticParamsがあれば、SSGが適用される ]
//   const {result,message,data} = await getPostWithThumbnail(Number(postId));
//   if(message==='404 not found.')notFound();
//   if(!result || !data)throw new Error(message);
//   return data;

//   // //■[ SSGが適用されない場合は、「force-cache」を強引に明記して、SSGを適用させる ]
//   // try{
//   //     const res = await fetch(
//   //         `${apiUrl}/post/${postId}`,
//   //         {
//   //             cache: 'force-cache'
//   //         }
//   //     );
//   //     if (!res.ok) throw new Error('Failed to fetch data in server')// HTTPステータスコードが400以上の場合、エラーとして処理
//   //     const postData:PostWithThumbnail = await res.json();
//   //     return postData;
//   // }catch(err){
//   //     console.log(err instanceof Error ? err.message : `Internal Server Error.`);
//   //     const {result,message,data} = await getPostWithThumbnail(Number(postId));
//   //     if(!result || !data)throw new Error(message);
//   //     return data;
//   // }
// }

const PostIdPage = async({
  params
}:{
  params:{id:number}
}) => {
  //////////
  //■[ postId ]
  const postId = params.id as number;
  if(!postId)notFound();

  //////////
  //■[ data fetch ]
  const post = await getOnePost(postId);

  return <PostSingle post={post}/>
}

export async function generateMetadata({params}:{params:{id:number}}): Promise<Metadata> {
  //////////
  //■[ postId ]
  const postId = params.id as number;
  //////////
  //■[ data fetch：SSG ]
  const post = await getOnePost(postId);
  //////////
  //■[ data ]
  const title = post.title;
  const description = post.description ? post.description : '';
  const publishedTime = new Date(post.createdAt).toISOString();
  const modifiedTime = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedTime;
  
  let imagePath = `${appUrl}/img/noimage.jpg`;
  let width = 256;
  let height = 165;
  if(post.Thumbnail){
    imagePath = mediaPath+post.Thumbnail.path;
    width = post.Thumbnail.width;
    height = post.Thumbnail.height;
  }
  
  return {
      title,
      description,
      alternates: {
          canonical: `${appUrl}/post/${postId}`,//正規のURL：クエリパラメータなどを含む別URLの重複を回避
      },
      openGraph: {
          title,
          description,
          url: `${appUrl}/post/${postId}`,
          siteName: '記事投稿アプリケーション',
          images: [{
              url: imagePath,
              width,
              height,
              alt: title,
          }],
          locale: 'ja_JP',
          type: 'article',
          publishedTime, // 投稿日時
          modifiedTime, // 更新日時
          authors: ['lone_programmer'],   // 著者情報
      },
      twitter: {
          card: 'summary',//'summary_large_image','player','app'
          title,
          description,
          images: [imagePath],
          creator: '@lone_rogrammer',  // Twitter アカウントがある場合は設定
          site: '@lone_rogrammer',     // Twitter アカウントがある場合は設定
      },
      robots: {
          index: true,
          follow: true,
      },
      authors: [{ name: 'lone_programmer' }],
  };
}
export default PostIdPage;