import { getPostWithThumbnail } from "@/lib/functions/fetchFnc";
import EditedPostCc from "./EditedPostCc";
import { entityToDangerousChar } from "@/lib/functions/myValidation";
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
    const content = entityToDangerousChar(data.content as string);

    return <EditedPostCc post={data} content={content} apiUrl={apiUrl}/>
}

export default EditedPostSc
