import { getPostWithThumbnail } from "@/lib/functions/fetchFnc";
import EditedPostCc from "./EditedPostCc";
const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;

const EditedPostSc = async({
    postId
}:{
    postId:number
}) => {
    //////////
    //■[ データ取得 ]
    const {result,message,data} = await getPostWithThumbnail(postId);
    if(!result || !data)throw new Error(message);

    return <EditedPostCc post={data} apiUrl={apiUrl}/>
}

export default EditedPostSc
