import { entityToDangerousChar } from "@/lib/functions/myValidation";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import "@/app/github-markdown-light.css";
import Image from "next/image";
import { PostWithThumbnail } from "@/lib/types";

const PostSingle = async({
    post
}:{
    post:PostWithThumbnail
}) => {
    //////////
    //■[ 調整 ]
    const content = entityToDangerousChar(post.content as string);
    let imagePath='/img/noimage.jpg';
    let width = 250;
    let height = 165;
    if(post.Thumbnail){
        imagePath = process.env.NEXT_PUBLIC_MEDIA_PATH+post.Thumbnail.path;
        width = post.Thumbnail.width;
        height = post.Thumbnail.height;
    }

    return (
        <div className="m-2 p-2 pb-10 bg-gray-100">
            <h1 className="text-xl text-center text-blue-500 font-bold my-5 break-all">
            {post.title}
            </h1>
            <div className="m-3">
                <Image
                    className="rounded-md"
                    src={imagePath}
                    alt={post.title}
                    width={width}
                    height={height}
                    quality={100}
                />
            </div>
            <div>
                <ReactMarkdown
                    className='markdown-body p-3'
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                >
                    {/*この処理が無いと、「\n」が改行として処理されず、そのまま出力されてしまう*/}
                    {post.content && content.replace(/\\n/g, '\n')} 
                </ReactMarkdown>
            </div>
        </div>
    )
}

export default PostSingle;
