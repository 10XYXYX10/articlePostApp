import { PostWithThumbnail } from "@/lib/types";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import "@/app/github-markdown-light.css";
import { entityToDangerousChar } from "@/lib/functions/myValidation";
//import { getPostWithThumbnail } from "@/lib/functions/fetchFnc";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const getOnePost = async(postId:number):Promise<PostWithThumbnail> => {
    const res = await fetch(
        `${apiUrl}/post/${postId}`,
        {
            //cache: 'force-cache'
            cache: 'no-store'
        }
    );
    if (!res.ok) throw new Error('Failed to fetch data in server')// HTTPステータスコードが400以上の場合、エラーとして処理
    const postData:PostWithThumbnail = await res.json();
    return postData;

    // try{
    //     const res = await fetch(
    //         `${apiUrl}/post/${postId}`,
    //         {
    //             cache: 'force-cache'
    //         }
    //     );
    //     if (!res.ok) throw new Error('Failed to fetch data in server')// HTTPステータスコードが400以上の場合、エラーとして処理
    //     const postData:PostWithThumbnail = await res.json();
    //     return postData;
    // }catch(err){
    //     console.log(err instanceof Error ? err.message : `Internal Server Error.`);
    //     const {result,message,data} = await getPostWithThumbnail(Number(postId));
    //     if(!result || !data)throw new Error(message);
    //     return data;
    // }
}

const PostSingle = async({
    postId
}:{
    postId:number
}) => {
    //////////
    //■[ data fetch ]
    const post = await getOnePost(postId);
    const content = entityToDangerousChar(post.content as string);

    //////////
    //■[ 調整 ]
    const imagePath = post.Thumbnail ? process.env.NEXT_PUBLIC_MEDIA_PATH+post.Thumbnail.path : '/img/noimage.jpg';

    return (
        <div className="m-2 p-2 pb-10 bg-gray-100">
            <h3 className="text-xl text-center text-blue-500 font-bold my-5 break-all">
                {post.title}
            </h3>
            <div className="m-3">
                <Image
                    className="rounded-md"
                    src={imagePath}
                    alt={post.title}
                    width={400}
                    height={400}
                />
            </div>
            <div>
                <ReactMarkdown
                    className='markdown-body p-3'
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                >
                    {/*この処理が無いと、「\n」が開業として処理されず、そのまま出力されてしまう*/}
                    {post.content && content.replace(/\\n/g, '\n')} 
                </ReactMarkdown>
            </div>
        </div>
    )
}
export default PostSingle
