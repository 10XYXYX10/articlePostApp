import { notFound } from "next/navigation";
import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import EditedPostSc from "@/components/post/EditedPostSc";

const MainUserEditIdPage = ({params}:{params:{postId:number}}) => {
    const postId = Number(params.postId);
    if(!postId)notFound();

    return (
        <div className="flex items-center justify-center">
            <div className="flex flex-col items-center justify-center w-full mx-1 sm:mx-3">
                <h3 className="text-2xl text-blue-500 font-bold my-5">EditedPostForm</h3>
                <Suspense fallback={<Spinner/>}>
                    <EditedPostSc postId={postId}/>
                </Suspense>
            </div>
        </div>
    )
}
export default MainUserEditIdPage
