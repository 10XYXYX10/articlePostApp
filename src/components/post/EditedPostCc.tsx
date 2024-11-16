'use client'
import { MarkdownForm, PostForm, PostWithThumbnail } from "@/lib/types"
import AlertError from "../AlertError"
import { ChangeEvent, useState } from "react"
import { useRouter } from "next/navigation"
import useStore from "@/store"
import { Thumbnail } from "@prisma/client"
import SpinnerModal from "../SpinnerModal"
import { inputClassVal } from "@/lib/tailwindClassValue"
import MarkdownTextarea from "./MarkdownTextarea"
import EditedThumbnail from "./thumbnail/EditedThumbnail"
import { validationForWord } from "@/lib/functions/myValidation"
import axios from "axios"
import { IconPencil, IconTrash } from "@tabler/icons-react"

const EditedPostCc = ({
    post,
    content,
    apiUrl,
}:{
    post:PostWithThumbnail
    content:string
    apiUrl:string
}) => {
    const router = useRouter();
    const {user} = useStore();
    const resetUser = useStore((state) => state.resetUser);
    const [loadingFlag,setLoadingFlag] = useState(false);
    const [error,setError] = useState('');
    const [thumbnail,setThumbnail] = useState<Thumbnail|null>(post.Thumbnail);
    const [formData,setFormData] = useState<PostForm>({
        title:[post.title,''],
        description:[post.description,''],
    });
    const [markdownFormData,setMarkdownFormData] = useState<MarkdownForm>({
        content:[content, ''],
    });

    const handleUpdate = async () => {
        if(error)setError('');
    
        ///////////
        //◆【formDataのバリデーション】
        const {title,description} = formData;
        const {content} = markdownFormData;
        let alertFlag = false;
        //title
        let result = validationForWord(title[0],200);
        if( !result.result ){
            title[1]=result.message;
            alertFlag = true;
        }
        //description
        result = validationForWord(description[0],400);
        if( !result.result ){
          description[1]=result.message;
          alertFlag = true;
        }
        //content
        if(content[0].length>4000){
            content[1]=`4000字以内でお願いします！(* +${content[0].length-4000})`;
            alertFlag = true;
        }
        //title,description,contentのvalidation結果を反映
        setFormData({title,description});
        setMarkdownFormData({content});
        if(alertFlag){
          setError('入力内容に問題があります');
          return alert('入力内容に問題があります');
        }
        //thumbnail
        if(!thumbnail){
            setError('サムネイルが未選択です');
            return alert('サムネイルが未選択です');
        }

        //////////
        //◆【通信】
        setLoadingFlag(true);
        try {
            await axios.put<{articleId:number}>(
                `${apiUrl}/user/post`,
                {
                    title:title[0],
                    description:description[0],
                    content:content[0],
                    thumbnailId:thumbnail.id,
                    postId:post.id,
                }
            );
            router.refresh();//Router Cacheをクリア
            alert('success');
        } catch (err) { 
            let message = 'Something went wrong. Please try again.';
            if (axios.isAxiosError(err)) {
                if(err.response?.data.message)message = err.response.data.message;
                //401,Authentication failed.
                if(err.response?.status){
                    if(err.response.status===401){
                        setLoadingFlag(false);
                        alert(message);
                        resetUser();
                        router.push('/auth');
                        return;
                    }
                }
            } else if (err instanceof Error) {
                message = err.message;
            }
            alert(message);
            setError(message);
        }
        setLoadingFlag(false);
    }

    const handleDelete = async () => {
        if(error)setError('');
    
        const confirmVal = confirm('本当に削除しますか？？');
        if(!confirmVal)return;
    
        setLoadingFlag(true);
        try{
            await axios.delete<{message:string}>(`${apiUrl}/user/post?postId=${post.id}`);
            router.push(`/user/${user.id}`);
            router.refresh();//この記述＆この順序でないと、削除が即座に反映されない場合が
            //console.log('router.push～router.refresh');
        }catch(err){
            let message = 'Something went wrong. Please try again.';
            if (axios.isAxiosError(err)) {
                if(err.response?.data.message)message = err.response.data.message;
                //401,Authentication failed.
                if(err.response?.status){
                    if(err.response.status===401){
                        setLoadingFlag(false);
                        alert(message);
                        resetUser();
                        router.push('/auth');
                        return;
                    }
                }
            } else if (err instanceof Error) {
                message = err.message;
            }
            alert(message);
            setError(message);
        }
        setLoadingFlag(false); 
    };

    const handleChange = (e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        const inputVal = e.target.value;
        const inputName = e.target.name;
        setFormData({...formData,[inputName]:[inputVal,'']})
    }

    return (
        <div className="flex flex-col items-center justify-center w-full mx-1 sm:mx-3">
            {loadingFlag && <SpinnerModal/>}
            {error && (
                <div className='py-3'>
                    <AlertError errMessage={error} reloadBtFlag={false}/>
                </div>
            )}
            <form onSubmit={(e) => e.preventDefault()} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full">
                <div className="mb-4">
                    <label className='block text-gray-700 text-md font-bold'>title<em className="text-red-500">*</em></label>
                    <span className='text-xs text-gray-500'>100字以内のタイトル</span>
                    <input
                        name='title'
                        defaultValue={formData.title[0]}
                        type='text'
                        required={true}
                        placeholder="タイトル"
                        className={`${formData.title[1]&&'border-red-500'} ${inputClassVal}`}
                        onChange={(e)=>handleChange(e)}
                    />
                    {formData.title[1] && <span className='text-red-500 text-xs italic'>{formData.title[1]}</span>}
                </div>

                <div className="mb-4">
                    <label className='block text-gray-700 text-md font-bold'>description<em className="text-red-500">*</em></label>
                    <span className='text-xs text-gray-500'>300字以内のdescription</span>
                    <textarea
                        name='description'
                        defaultValue={formData.description[0]}
                        required={true}
                        placeholder="description"
                        className={`${formData.description[1]&&'border-red-500'} ${inputClassVal}`}
                        onChange={(e)=>handleChange(e)}
                        rows={5}
                    />
                    {formData.description[1] && <span className='text-red-500 text-xs italic'>{formData.description[1]}</span>}
                </div>
                <div className="mb-4">
                    <MarkdownTextarea
                        markdownFormData={markdownFormData}
                        setMarkdownFormData={setMarkdownFormData}
                    />
                </div>
                <EditedThumbnail
                    apiUrl={apiUrl}
                    thumbnail={thumbnail}
                    setThumbnail={setThumbnail}
                    resetUser={resetUser}
                />
                <div className='flex items-center space-x-3'>
                    <button
                        disabled={loadingFlag}
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loadingFlag&&'cursor-not-allowed'}`}
                        onClick={handleUpdate}
                    >
                        <span className="flex items-center">
                            {loadingFlag?'・・Loading・・': <><IconPencil/>update</>}
                        </span>
                    </button>
                    <button
                        disabled={loadingFlag}
                        className={`bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loadingFlag&&'cursor-not-allowed'}`}
                        onClick={handleDelete}
                    >
                        <span className="flex items-center">
                            {loadingFlag?'・・Loading・・': <><IconTrash/>delete</>}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditedPostCc
