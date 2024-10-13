import { getAllPostIds } from "@/lib/functions/fetchFnc";
import { PostWithThumbnail } from "@/lib/types";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function generateStaticParams() {
    const {result,message,data} = await getAllPostIds();
    if(!result || !data)throw new Error(message);
    return data.map(({id}) => ({
        id: id.toString()
    }));
}

const getOnePost = async(postId:number):Promise<PostWithThumbnail> => {
    const res = await fetch(
        `${apiUrl}/post/${postId}`,
        {
            cache: 'force-cache'
        }
    );
    if (!res.ok) throw new Error('Failed to fetch data in server')// HTTPステータスコードが400以上の場合、エラーとして処理
    const postData:PostWithThumbnail = await res.json();
    return postData;
}

const PostSingle = async({
    postId
}:{
    postId:number
}) => {
    //////////
    //■[ data fetch ]
    const post = await getOnePost(postId);

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
                    {post.content && post.content.replace(/\\n/g, '\n')} 
                </ReactMarkdown>
            </div>
        </div>
    )
}

export default PostSingle
