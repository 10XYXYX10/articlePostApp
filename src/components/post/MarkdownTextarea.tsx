'use client'
import { ChangeEvent, Dispatch, KeyboardEvent, MouseEvent, SetStateAction, memo, useState } from 'react'
import { MarkdownForm } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

const modalClass = 'absolute top-0 left-0 right-0 bottom-0 height110vh bg-slate-900 bg-opacity-50 flex flex-col justify-center items-center modal';
const inputClassVal = "bg-gray-100 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";

type MarkdownTextareaPropsType = {
    markdownFormData:MarkdownForm
    setMarkdownFormData:Dispatch<SetStateAction<MarkdownForm>>
}

const MarkdownTextarea = memo( ({
    markdownFormData,
    setMarkdownFormData,
}:MarkdownTextareaPropsType) => {
    const [showModal,setShowModal] = useState(false);
    const [dispScreenNum,setDispScreenNum] = useState<1|2>(1);

    const handleChange = (e:ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
        const inputName = e.target.name;
        let inputVal = e.target.value;  
        //入力値内の改行文字(\r\n, \r, \n)を検出し、それらをエスケープシーケンスの\nに変換。これにより、改行が一貫して処理される。
        //これがないと、データベースに保存する際、改行げ適切に保存できない
        inputVal = inputVal.replace(/\r\n|\r|\n/g, '\\n');
        setMarkdownFormData({...markdownFormData,[inputName]:[inputVal,'']})
    }

    const openModal = (e:MouseEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();
        if(!showModal){
            setShowModal(true);
            window.scrollTo(0, 0);
        }
    }

    const closeModal = () => {
        if(showModal)setShowModal(false);
    }

    const handleKeyDown = (e:KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key == 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;//入力文字を先頭から数えての数値。「Enter」も1文字換算。
            const end = target.selectionEnd;//「確認したところtarget.selectionStart」と同じ値となった。

            //「target.value.substring(0, start)」:「12345<tab>6789」→12345
            //「target.value.substring(end)」12345<tab>6789」→6789
            target.value = target.value.substring(0, start)
                            + "\t"
                            + target.value.substring(end);

            //「tab」の1文字分、入力欄のカーソル位置を1文字前へ進める
            target.selectionStart = target.selectionEnd = start + 1;
        }
    }

    const changeScreen = (e:MouseEvent<HTMLAnchorElement>,screenNum:1|2) => {
        e.stopPropagation();
        e.preventDefault();
        setDispScreenNum(screenNum);
    }

    return (<>
        <div
            onClick={() => {
                closeModal();
            }}
            className={showModal ? modalClass : ''}
        >
            
            {!showModal?(<>
                <label className='block text-gray-700 text-md font-bold'>content<em className="text-red-500">*</em></label>
                <span className='text-xs text-gray-500'>4000字以内のcontent</span>
            </>):(
                <ul className='md:hidden flex w-full px-2'>
                    <li className='w-1/2'>
                        <a 
                            onClick={(e) => changeScreen(e,1)}
                            className={`block p-1 bg-slate-500  hover:bg-slate-700 text-center border-r-2 border-white ${dispScreenNum===1 ? 'text-red-600 font-bold' : 'text-white'}`}
                        >
                            入力画面
                        </a>
                    </li>
                    <li className='w-1/2'>
                        <a
                            onClick={(e) => changeScreen(e,2)}
                            className={`block p-1 bg-slate-500  hover:bg-slate-700 text-center ${dispScreenNum===2 ? 'text-red-600 font-bold' : 'text-white'}`}
                        >
                            確認画面
                        </a>
                    </li>
                </ul>
            )}
            <div className={`w-full ${showModal&&'mx-5 my-3 flex justify-around'}`}>
                <div
                    className={
                        `${showModal 
                            ? `${dispScreenNum===1 ? 'w-full' : 'hidden'} md:w-1/2 md:block mx-1 overflow-auto` 
                            : 'w-full'
                    }`}
                >
                        <textarea
                            name='content'
                            defaultValue={markdownFormData.content[0].replace(/\\n/g, '\n')}
                            required={true}
                            placeholder="content"
                            className={`
                                break-all
                                ${markdownFormData.content[1]&&'border-red-500'}
                                ${inputClassVal}
                                ${showModal?'height85vh w-full minWidth450':'w-full'}
                            `}
                            onChange={(e)=>handleChange(e)}
                            onClick={(e) => openModal(e) }
                            onKeyDown={(e) => handleKeyDown(e) }
                            rows={5}
                        />
                </div>
                {showModal?(
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`${dispScreenNum===2 ? 'w-full' : 'hidden'} md:w-1/2 md:block mx-1 p-1 bg-white rounded-sm height85vh overflow-auto`}
                        id="markdown"
                    >
                        <div className='minWidth450 mr-1'>
                            <ReactMarkdown
                                className='markdown-body'
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSanitize]}
                            >
                                {/*この処理が無いと、「\n」が開業として処理されず、そのまま出力されてしまう*/}
                                {markdownFormData.content[0].replace(/\\n/g, '\n')} 
                            </ReactMarkdown>
                        </div>
                    </div>
                ):(<>
                    {markdownFormData.content[1] && <span className='text-red-500 text-xs italic'>{markdownFormData.content[1]}</span>}
                </>)}
                
            </div>
        </div>
        <style>{`
            .height85vh{
                height: 85vh;
            } 
            .height110vh{
                height: 110vh;
            } 
            .minWidth450 {
                min-width:450px;
            }
        `}</style>
    </>)

});
MarkdownTextarea.displayName = 'MarkdownTextarea';
export default MarkdownTextarea;
