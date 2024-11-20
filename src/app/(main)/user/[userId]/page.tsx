// import PostList from "@/components/post/PostList";
// import { Suspense } from "react";
// import Spinner from "@/components/Spinner";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dangerousCharToSpace } from "@/lib/functions/myValidation";

const UserPage = async({
  params,
  searchParams,
}:{
  params:{userId:number}
  searchParams: { [key: string]: string | undefined }
}) => {
  //////////
  //◆【パラメーターの調整：「userId,search,sort,page」】
  //■[ userId ]
  const userId = Number(params.userId);
  if(!userId)notFound();
  //■[ search ]
  let initialSearchVal = searchParams.search ? searchParams.search : "";
  if(initialSearchVal){
    //URLに含まれる危険文字を半角スペースに変換
    initialSearchVal = dangerousCharToSpace(initialSearchVal).trim();
    //「%20,全角スペース,連続する半角スペース」→「半角スペース」
    initialSearchVal = initialSearchVal.replace(/\%20/g, ' ').replace(/ +/g, ' ');
  }
  //■[ sort ]
  const initialSortVal = searchParams.sort;
  const sort:'desc'|'asc' = initialSortVal!='desc'&&initialSortVal!='asc' ? 'desc' : initialSortVal;
  //■[ page ]
  const page = searchParams.page && !isNaN(Number(searchParams.page))  ? Number(searchParams.page) : 1;

  return (
    <div className="p-5">
      <Link
        href={`/user/${userId}/create`}
        className='mt-5 ml-5 px-2 py-1 text-white text-sm border border-blue-600 bg-blue-500 hover:bg-blue-400 rounded-sm'
      >
        createArticle
      </Link>

      {/* <Suspense fallback={<Spinner/>}>
        <PostList
          userId={userId}
          search={initialSearchVal}
          sort={sort}
          page={page}
          path={`/user/${userId}/edit/`}
        />
      </Suspense> */}
    </div>
  )
}
export default UserPage;