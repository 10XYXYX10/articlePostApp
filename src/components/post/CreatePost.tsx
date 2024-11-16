'use client'
import { ChangeEvent, useState } from "react";
import axios from "axios";
import { Thumbnail } from "@prisma/client";
import { MarkdownForm, PostForm } from "@/lib/types";
import EditedThumbnail from "./thumbnail/EditedThumbnail"
import MarkdownTextarea from "./MarkdownTextarea";
import SpinnerModal from "../SpinnerModal";
import AlertError from "../AlertError";
import useStore from "@/store";
import { useRouter } from "next/navigation";
import { inputClassVal } from "@/lib/tailwindClassValue";
import { validationForWord } from "@/lib/functions/myValidation";

const CreatePost = ({
    apiUrl,
}:{
    apiUrl:string
}) => {    
    const router = useRouter();
    const {user} = useStore();
    const resetUser = useStore((state) => state.resetUser);
    const [loadingFlag,setLoadingFlag] = useState(false);
    const [error,setError] = useState('');
    const [thumbnail,setThumbnail] = useState<Thumbnail|null>(null);
    const [formData,setFormData] = useState<PostForm>({
      title:['',''],//[値,エラー文字]
      description:['',''],//[値,エラー文字]
    });
    const [markdownFormData,setMarkdownFormData] = useState<MarkdownForm>({
      content:['',''],//[値,エラー文字]
    });

    const handleSubmit = async () => {
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
        if(alertFlag){
            setFormData({title,description});
            setMarkdownFormData({content});
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
            await axios.post(
                `${apiUrl}/user/post`,
                {
                    title:title[0],
                    description:description[0],
                    content:content[0],
                    thumbnailId:thumbnail.id,
                }
            );
            router.push(`/user/${user.id}`);
            router.refresh();//Client-side Cacheをクリア ← この記述＆この順序でないと、主にトップページで更新が即座に反映されない場合が
            console.log('router.push～router.refresh')
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

    const handleChange = (e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        const inputVal = e.target.value;
        const inputName = e.target.name;
        setFormData({...formData,[inputName]:[inputVal,'']})
    }

    return (
        <div className="flex flex-col items-center justify-center w-full mx-1 sm:mx-3">
            {loadingFlag&&<SpinnerModal/>}
            <h3 className="text-2xl text-blue-500 font-bold my-5">記事作成フォーム</h3>
            {error && (
                <div className='py-3'>
                    <AlertError errMessage={error} reloadBtFlag={false}/>
                </div>
            )}
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full" onSubmit={(e) => e.preventDefault()}>
                <div className="mb-4">
                    <label className='block text-gray-700 text-md font-bold'>title<em className="text-red-500">*</em></label>
                    <span className='text-xs text-gray-500'>100字以内のタイトル</span>
                    <input
                        name='title'
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
                <div className='flex items-center justify-between'>
                    <button
                        onClick={handleSubmit}
                        className={
                            `bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline 
                            ${loadingFlag&&'cursor-not-allowed'}
                        `}
                        disabled={loadingFlag}
                    >
                        {loadingFlag?'・・Loading・・':'create'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreatePost
