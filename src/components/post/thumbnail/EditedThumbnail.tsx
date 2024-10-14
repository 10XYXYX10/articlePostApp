'use client'
import { Thumbnail } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChangeEvent, Dispatch, MouseEvent, SetStateAction, memo, useEffect, useRef, useState } from "react"

const imagesize = async (file:File): Promise<{ width:number, height:number, src:string }|null> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            const size = {
                width: img.naturalWidth,
                height: img.naturalHeight,
                src: img.src
            };
            resolve(size);
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl); // エラーが発生した場合オブジェクトURLを解放
            reject(null);
        };
        img.src = objectUrl;
    });
}

const EditedThumbnail = memo( ({
    apiUrl,
    thumbnail,
    setThumbnail,
    resetUser,
}:{
    apiUrl:string
    thumbnail:Thumbnail|null,
    setThumbnail:Dispatch<SetStateAction<Thumbnail|null>>
    resetUser: () => void
}) => {
    const router = useRouter();
    const [error, setError] = useState(!thumbnail ? 'サムネイル画像を選択して下さい。' : '');
    const [loadingFlag,setLoadingFlag] = useState(false);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [selectedFile,setSelectedFile] = useState<File|null>(null);
    const [imageData,setImageData] = useState<{width:number,height:number,src:string,type:string}|null>(null);

    useEffect(()=>{
        if(thumbnail){
            setImageData({
                width:thumbnail.width,
                height:thumbnail.height,
                src:process.env.NEXT_PUBLIC_MEDIA_PATH+thumbnail.path,
                type:thumbnail.type,
            });
            fetch(process.env.NEXT_PUBLIC_MEDIA_PATH+thumbnail.path)
                .then(res => res.blob())
                .then(blob => {
                    if(thumbnail.type==='jpg'){
                        const file = new File([blob], "image.jpg", { type: "image/jpeg" });
                        setSelectedFile(file);                        
                    }else{
                        const file = new File([blob], "image.png", { type: "image/png" });
                        setSelectedFile(file);   
                    }
                });
        }else{
            setError('サムネイル画像を選択して下さい。');
            if(imageData){
                if(imageData.src)URL.revokeObjectURL(imageData.src);
                setImageData(null);
            }
            setSelectedFile(null);
        }

        return () => {
            if(imageData && imageData.src)URL.revokeObjectURL(imageData.src);
        };
    },[thumbnail]);

    const handleFileChange = async (e:ChangeEvent<HTMLInputElement>) => {
        setError('');
        if(!e.target.files)return;
        const file = e.target.files[0];
        if (!file) return;

        if(imageData && imageData.src)URL.revokeObjectURL(imageData.src);
    
        const fileNAmeSplit = file.name.split('.');
        const fileType = fileNAmeSplit[fileNAmeSplit.length-1]
        if(fileType!=='jpg' && fileType!=='png'){
            alert('*.jpg または .png のみアップロード可能です');
            if(inputFileRef.current)inputFileRef.current.value="";
            return;
        }
      
        const maxSizeJpg = 100 * 1024; // 100KB
        if(file.size>maxSizeJpg){
            alert('アップロード可能サイズは100KBまでです');
            if(inputFileRef.current)inputFileRef.current.value="";
            return;
        }
    
        try{
            const result = await imagesize(file);
            if(result===null){
                setSelectedFile(null);
                if(inputFileRef.current)inputFileRef.current.value="";
                const errMessage = '*画像の解析に失敗しました。もう一度お試し下さい。';
                setError(errMessage);
                alert(errMessage);
                return;
            }
            if(result.width<200 || result.width>500){
                setSelectedFile(null);
                if(inputFileRef.current)inputFileRef.current.value="";
                let errMessage = '*widthが200px以上の画像をアップロードして下さい。';
                if(result.width>500)errMessage = '*widthが500px以下の画像をアップロードして下さい。';
                setError(errMessage);
                alert(errMessage);
                return;
            }
            if(result.height<200 || result.width>500){
                setSelectedFile(null);
                if(inputFileRef.current)inputFileRef.current.value="";
                let errMessage = '*heightが200px以上の画像をアップロードして下さい。';
                if(result.height>500)errMessage = '*heightが500px以下の画像をアップロードして下さい。';
                setError(errMessage);
                alert(errMessage);
                return;
            }
            setSelectedFile(file);
            setImageData({...result,type:fileType});
        }catch(err){
            const message = err instanceof Error ? err.message : '';
            setSelectedFile(null);
            if(inputFileRef.current)inputFileRef.current.value="";
            const errMessage = `*ファイルの読み込みに失敗しました。ファイルに問題がないかご確認ください.${message}`;
            setError(errMessage);
            return alert(errMessage);
        }
    };

    const handleSubmit = async (e:MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(error)setError('');
        setLoadingFlag(true);
        //////////
        //◆【画像データのバリデーション】
        if (!selectedFile){
            setLoadingFlag(false);
            return alert("ファイルを選択して下さい");
        }
        if(!imageData){
            setSelectedFile(null);
            if(inputFileRef.current)inputFileRef.current.value="";
            const errMessage = '予期せぬエラーが発生しました。もう一度ファイルを選択してください';
            setError(errMessage);
            setLoadingFlag(false);
            return alert(errMessage);
        }
        const {width,height,type} = imageData;
        let errFlag = false;
        if(!width || !height || !type)errFlag=true;
        if(errFlag){
          setSelectedFile(null);
          if(inputFileRef.current)inputFileRef.current.value="";
          const errMessage = '予期せぬエラーが発生しました。もう一度ファイルを選択してください';
          setError(errMessage);
          setLoadingFlag(false);
          return alert(errMessage);
        }
    
        try {
            const formData = new FormData();
            //////////
            //◆【新規作成】
            if(imageData.type==='jpg'){
                formData.append('jpg', selectedFile);
                const {data} = await axios.post<Thumbnail>(
                    `${apiUrl}/user/post/thumbnail?type=jpg&width=${width}&height=${height}&size=${Math.floor(selectedFile.size)}`,
                    formData
                );
                setThumbnail(data);
            }else{
                formData.append('png', selectedFile);
                const {data} = await axios.post<Thumbnail>(
                    `${apiUrl}/user/post/thumbnail?type=jpg&width=${width}&height=${height}&size=${Math.floor(selectedFile.size)}`,
                    formData
                );
                setThumbnail(data);
            }
            if(inputFileRef.current)inputFileRef.current.value="";
            alert('success');
        } catch (err) { 
            let message = 'Something went wrong. Please try again.';
            if (axios.isAxiosError(err)) {
                if(err.response?.data.message)message = err.response.data.message+'：error-a';
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
                message = err.message+'：error-b';
            }
            alert(message);
            setError(message);
        }
        setLoadingFlag(false); 
    };

    const handleDelete = async(e:MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(!thumbnail)return;
        try {
            setLoadingFlag(true);
            await axios.delete(`${apiUrl}/user/post/thumbnail?thumbnailId=${thumbnail.id}`);
            setThumbnail(null);//useEffectが発火→ URL.revokeObjectURL(imageData.src) → setImageData(null)
            if(inputFileRef.current)inputFileRef.current.value="";
            alert('OK');
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

    return(<>
        <label className='block text-gray-700 text-md font-bold mt-6'>thumbnail(jpg/png画像)<em className="text-red-500">*</em></label>
        <div className="mb-5 bg-gray-100 shadow-md rounded px-8 pt-1 pb-8 w-full max-w-md">
            
            {imageData && imageData.src && (
                <div className="p-3">
                    <img src={imageData.src} width={'200px'}/>
                </div>
            )}

            {!thumbnail?(<>
                <div>
                    <div className="mb-4">
                        <span className='text-xs text-gray-500'>
                            ・横:500px, 縦:400px、までのjpg画像をアップロード可能です<br/>
                            ・最大100KBまでが許容サイズです
                        </span>
                        <input
                            placeholder='thumbnail image'
                            ref={inputFileRef}
                            type="file"
                            accept=".jpg, .png"
                            onChange={handleFileChange}
                        />
                        {error && <p><span className='text-red-500 font-bold text-xs italic'>{error}</span></p>}
                    </div>
                    <div className='flex items-center justify-between'>
                        <button
                            className={`bg-green-400 hover:bg-green-600 text-sm text-white font-bold px-2 py-1 rounded focus:outline-none focus:shadow-outline ${!selectedFile||loadingFlag&&'cursor-not-allowed'}`}
                            onClick={(e)=>handleSubmit(e)}
                            disabled={!selectedFile || loadingFlag}
                        >
                            upload
                        </button>
                    </div>
                </div>
            </>):(<>
                <div id='myFormExcutionBt' className="textAlignCenter">
                    <button
                        className={`bg-gray-500 hover:bg-gray-600 text-sm text-white font-bold px-2 py-1 rounded focus:outline-none focus:shadow-outline ${loadingFlag&&'cursor-not-allowed'}`}
                        onClick={(e)=>handleDelete(e)}
                        disabled={loadingFlag}
                    >
                        delete
                    </button>
                </div>
            </>)}
        </div>
    </>);
} );
EditedThumbnail.displayName = 'EditedThumbnail';
export default EditedThumbnail;