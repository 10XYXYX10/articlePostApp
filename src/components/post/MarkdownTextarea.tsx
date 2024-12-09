import { ChangeEvent, Dispatch, KeyboardEvent, MouseEvent, SetStateAction, memo, useState } from 'react'
import { MarkdownForm } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm'; //GitHub Flavored Markdown（GFM）をサポート
import "@/app/github-markdown-light.css";

const MarkdownTextarea = memo( ({
    markdownFormData,
    setMarkdownFormData,
}:{
    markdownFormData:MarkdownForm
    setMarkdownFormData:Dispatch<SetStateAction<MarkdownForm>>
}) => {
    const [showModal,setShowModal] = useState(false);
    const [dispScreenNum,setDispScreenNum] = useState<1|2>(1);
    
    const handleChange = (e:ChangeEvent<HTMLTextAreaElement>) => {
        const inputName = e.target.name;
        let inputVal = e.target.value;  
        //入力値内の改行文字(\r\n, \r, \n)を検出し、それらをエスケープシーケンスの\nに変換。これにより、改行が一貫して処理される。
        //これがないと、データベースに保存する際、改行が適切に保存できない
        inputVal = inputVal.replace(/\r\n|\r|\n/g, '\\n');
        setMarkdownFormData({...markdownFormData,[inputName]:[inputVal,'']});//setMarkdownFormData({content:[inputVal,'']})
    }

    const openModal = (e:MouseEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();//これがないと、入力欄のクリック時、モーダルウィンドウが解除されてしまう
        if(!showModal)setShowModal(true);
    }

    const closeModal = () => {
        if(showModal)setShowModal(false);
    }

    const handleKeyDown = (e:KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key == 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;//現在のカーソル位置（文字数）。「Enter」も1文字換算。
            const end = target.selectionEnd;//選択範囲の終了位置（テキストが選択されていない場合はselectionStartと同じ）

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
        e.stopPropagation();//これがないと、イベントが伝播し、上位の階層のdivにセットしたcloseModal()が意図せず実行されてしまう。
        setDispScreenNum(screenNum);
    }

    return (
        <div
            onClick={closeModal}
            className={showModal 
                ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50'
                : ''
            }
        >
            
            {!showModal?(<>
                <label className='block text-gray-700 text-md font-bold'>content<em className="text-red-500">*</em></label>
                <span className='text-xs text-gray-500'>4000字以内のcontent</span>
            </>):(
                <ul className='md:hidden flex w-full px-2'>
                    <li className='w-1/2'>
                        <a 
                            onClick={(e) => changeScreen(e,1)}
                            className={`
                                block p-1 bg-slate-500  hover:bg-slate-700 text-center border-r-2 border-white 
                                ${dispScreenNum===1 ? 'text-red-600 font-bold' : 'text-white'}
                            `}
                        >
                            入力画面
                        </a>
                    </li>
                    <li className='w-1/2'>
                        <a
                            onClick={(e) => changeScreen(e,2)}
                            className={`
                                block p-1 bg-slate-500  hover:bg-slate-700 text-center 
                                ${dispScreenNum===2 ? 'text-red-600 font-bold' : 'text-white'}
                            `}
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
                            w-full break-all bg-gray-100 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline 
                            ${markdownFormData.content[1]&&'border-red-500'}
                            ${showModal&&'h-[85vh] w-full min-w-[400px]'}
                        `}
                        onChange={(e)=>handleChange(e)}
                        onClick={(e) => openModal(e) }
                        onKeyDown={(e) => handleKeyDown(e) }
                        rows={5}
                    />
                </div>
                {showModal?(
                    <div
                        onClick={(e) => e.stopPropagation()}//イベント伝播を阻止
                        className={`
                            ${dispScreenNum===2 ? 'w-full' : 'hidden'} 
                            md:w-1/2 md:block mr-1 p-1 bg-white rounded-sm h-[85vh] overflow-auto
                        `}
                    >
                        <div className='min-w-[400px] mr-1'>
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
    )

});
MarkdownTextarea.displayName = 'MarkdownTextarea';
export default MarkdownTextarea;
