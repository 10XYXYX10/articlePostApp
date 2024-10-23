'use client'
import { dangerousCharToSpace } from "@/lib/functions/myValidation";
import useStore from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

const modalClass = 'absolute top-0 left-0 right-0 bottom-0 bg-slate-900 bg-opacity-50 flex justify-center items-center modal';

const SearchForm = () => {
    const {user} = useStore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const formRef = useRef<HTMLFormElement>(null);
    const [showModal,setShowModal] = useState(false);
    const [windowWidht, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 300);
    
    useEffect(() => {
        //////////
        //◆【width】
        const handleResize = () => {
          setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);

        ///////////
        //◆【queryParameters】
        const currentForm = formRef.current;
        if(currentForm){
            //search
            let initialSearchVal = searchParams.get("search") ? searchParams.get("search")+"" : "";
            if(initialSearchVal)initialSearchVal = dangerousCharToSpace(initialSearchVal);
            const currentInputSearch:HTMLInputElement|null = currentForm.querySelector("input[name='search']");
            if(currentInputSearch)currentInputSearch.value = initialSearchVal.trim();   
            //sort   
            let initialSortVal = searchParams.get('sort') ? searchParams.get('sort') : "desc";
            if(initialSortVal!='desc' && initialSortVal!='asc')initialSortVal = 'desc';
            const currentSelect:HTMLSelectElement|null = currentForm.querySelector("select[name='sort']");
            if(currentSelect)currentSelect.value = initialSortVal; 
        }

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    },[]);

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
        if(windowWidht<=620 && !showModal){
            setShowModal(true);
            const currentForm = formRef.current;
            if(currentForm){
                const currentInputSearch:HTMLInputElement|null = currentForm.querySelector("input[name='search']");
                if(currentInputSearch)currentInputSearch.style.width = `${windowWidht*0.7}px`;
            }
        }
    }
    const closeModal = () => {
        if(windowWidht<=620 && showModal){
            setShowModal(false);
            const currentForm = formRef.current;
            if(currentForm){
                const currentInputSearch:HTMLInputElement|null = currentForm.querySelector("input[name='search']");
                if(currentInputSearch)currentInputSearch.style.width='';
            }
        }
    }

    return(<>
        <div className="mx-3">
            <form
                id='globalForm'
                ref={formRef}
                onSubmit={(e)=>handleSubmit(e)}
                onClick={() => {
                    closeModal();
                }}
                className={showModal ? modalClass : 'flex items-center space-x-1'}
            >
                <div className={showModal ? 'bg-white p-5 rounded-lg' : ''} onClick={(e)=>e.stopPropagation()}>
                    <input
                        name='search'
                        type="text"
                        className={`border border-black-300 p-1 rounded-md w-1/2 sm:w-80 md:w-96`}
                        onClick={()=>{
                            openModal();
                        }}
                    />
                    <input 
                        type="submit" 
                        value="🔍" 
                        className="bg-blue-500 text-white p-1 rounded-md cursor-pointer hover:bg-blue-600"
                    />
                    <select
                        name='sort'
                        className="mx-1 border border-black-300 p-1"
                        onChange={handleSubmit}
                    >
                        {[['desc','新着順'],['asc','古い順']].map((val)=>(
                            <option key={val[0]} value={val[0]}>{val[1]}</option>
                        ))}
                    </select>
                </div>
            </form>
        </div>
    </>);
};
export default SearchForm;