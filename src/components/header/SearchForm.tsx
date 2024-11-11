'use client'
import { dangerousCharToSpace } from "@/lib/functions/myValidation";
import useStore from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

const SearchForm = () => {
    const {user} = useStore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const formRef = useRef<HTMLFormElement>(null);
    const [showModal,setShowModal] = useState(false);
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    
    useEffect(() => {
        ///////////
        //◆【queryParameters】
        const currentForm = formRef.current;
        if(currentForm){
            //search
            let currentSearchVal = search ?? "";
            if(currentSearchVal){
                currentSearchVal = dangerousCharToSpace(currentSearchVal);
                currentSearchVal = currentSearchVal.replace(/\%20/g, ' ').replace(/　/g, ' ').replace(/ +/g, ' ');
                currentSearchVal = currentSearchVal.trim();
            }
            const currentInputSearch:HTMLInputElement|null = currentForm.querySelector("input[name='search']");
            if(currentInputSearch)currentInputSearch.value = currentSearchVal.trim();   
            //sort   
            let initialSortVal = sort ?? "desc";
            if(initialSortVal!='desc' && initialSortVal!='asc')initialSortVal = 'desc';
            const currentSelect:HTMLSelectElement|null = currentForm.querySelector("select[name='sort']");
            if(currentSelect)currentSelect.value = initialSortVal; 
        }

    },[search,sort]);

    const handleSubmit = (e:FormEvent<HTMLFormElement>| ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        //////////
        //◆【遷移先URL】
        let pushUrl = '/';
        if(pathname.startsWith('/user') && user.id)pushUrl = `/user/${user.id}`;
        const currentForm = formRef.current;
        if(currentForm){
            //sort
            const currentSelect:HTMLSelectElement|null = currentForm.querySelector("select[name='sort']");
            if(currentSelect){
                let currentSort = currentSelect.value;
                if(currentSort!='desc' && currentSort!='asc')currentSort = 'desc';
                pushUrl += `?sort=${currentSort}`;
            } 
            //search
            const currentInputSearch:HTMLInputElement|null = currentForm.querySelector("input[name='search']");
            if(currentInputSearch){
                let currentSearch = currentInputSearch.value;
                currentSearch = dangerousCharToSpace(currentSearch);
                currentSearch = currentSearch.replace(/\%20/g, ' ').replace(/　/g, ' ').replace(/ +/g, ' ');
                currentSearch = currentSearch.trim();
                if(currentSearch)pushUrl += `&search=${currentSearch}`;
                if(showModal){
                    setShowModal(false);
                    currentInputSearch.style.width='';
                }
            }
            //遷移
            router.push(pushUrl)
        }
    }

    const openModal = () => {
        if(showModal)return;
        const currentForm =formRef.current;
        if(currentForm){
            const inputSearch = currentForm.querySelector("input[name='search']") as HTMLInputElement;
            if(inputSearch.clientWidth<=150){
                setShowModal(true);
                //■[ 検索候補(ブラウザのオートコンプリート)が元の位置に表示される問題 ]
                //・原因：モーダル表示時にinput要素の位置が変更されても、ブラウザのオートコンプリートの表示位置が更新されない。
                //・解決策：現在のフォーカスを無効にしたのち、再設定。
                setTimeout(() => {
                    if (inputSearch){
                        inputSearch.blur(); // 現在のフォーカスを外す
                        inputSearch.focus(); // 再度フォーカスを設定
                    }
                }, 1);
            }
        }
    }

    const closeModal = () => {
        if(!showModal)return;
        const currentForm =formRef.current;
        if(currentForm)setShowModal(false);
    }

    return(<>
        <div className="mx-3">
            <form
                id='globalForm'
                ref={formRef}
                onSubmit={(e)=>handleSubmit(e)}
                onClick={closeModal}
                className={
                    showModal 
                        ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50'
                        : 'flex items-center space-x-1'
                }
            >
                <div className={showModal ? 'bg-white p-5 rounded-lg w-[99%]' : 'flex'} onClick={(e)=>e.stopPropagation()}>
                    <div onClick={openModal} className="flex">
                        <input
                            name='search'
                            type="text"
                            className={`border border-black-300 p-1 rounded-md ${showModal ? 'w-full' : 'w-2/3 sm:w-80 md:w-96'}`}
                        />
                        <input 
                            type="submit" 
                            value="🔍" 
                            className="bg-blue-500 text-white p-1 rounded-md cursor-pointer hover:bg-blue-600 mr-1"
                        />
                    </div>
                    <select
                        name='sort'
                        className={`
                            mx-1 border border-black-300 p-1 rounded-md sm:inline
                            ${showModal ? 'mt-1.5 ml-0 inline' : 'hidden'}
                        `}
                        onChange={handleSubmit}
                    >
                        {[['desc','new'],['asc','old']].map((val)=>(
                            <option key={val[0]} value={val[0]}>{val[1]}</option>
                        ))}
                    </select>
                </div>
            </form>
        </div>
    </>);
};
export default SearchForm;