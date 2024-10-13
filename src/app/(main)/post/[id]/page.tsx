import PostSingle from "@/components/post/PostSingle";
import Spinner from "@/components/Spinner";
import { notFound } from "next/navigation";
import { Suspense } from "react";


const PostIdPage = async({
    params
  }:{
    params:{id:number}
  }) => {
    //////////
    //■[ postId ]
    const postId = params.id as number;
    if(!postId)notFound();

    return (
        <Suspense fallback={<Spinner/>}>
            <PostSingle postId={postId}/>
        </Suspense>
    )
}

export default PostIdPage;
