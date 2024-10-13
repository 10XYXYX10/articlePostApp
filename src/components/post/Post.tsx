import { PostWithThumbnail } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

const Post = ({
    post,
    path,
}:{
    post:PostWithThumbnail
    path:string
}) => {
    //image
    let imagePath='';
    if(post.Thumbnail){
        imagePath = process.env.NEXT_PUBLIC_MEDIA_PATH+post.Thumbnail.path;
    }else{
        imagePath = '/img/noimage.jpg';
    }

    return (<div className={`mb-3 sm:w-1/2 p-1`}>
        <div className="bg-white shadow-md rounded h-full">
            <Link
                className="shadow-md hover:shadow-none"
                href={path+post.id}
                prefetch={true}
            >
                <h2 
                    className='text-center text-lg bg-slate-200 hover:bg-slate-300'
                >
                    {post.title.length>30 ? post.title.substring(0, 30)+'…' : post.title}
                </h2>
            </Link>
            <div className='py-2.5 px-1 h-' style={{padding:'10px 5px'}}>
                {imagePath && (<div className="pt-2">
                    <Link
                        className="block"
                        href={path+post.id}
                        prefetch={true}
                    >
                        <Image
                            src={imagePath}
                            width={400}
                            height={400}
                            alt={post.title}
                            quality={80}
                            className='mx-auto hover:opacity-75'
                        />
                    </Link>
                </div>)}
            </div>
        </div>
    </div>)
}

export default Post;
