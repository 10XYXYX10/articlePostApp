import PostList from "@/components/post/PostList";
import Spinner from "@/components/Spinner";
import { dangerousCharToSpace } from "@/lib/functions/myValidation";
import { Suspense } from "react";

const MainPage = ({
  searchParams, //searchParamsに渡されるクエリパラメータは、デコード済みの状態で提供される＝decodeURIComponentは不要
}:{
  searchParams: { [key: string]: string | undefined }
}) => {
  //////////
  //■[ パラメーターの調整：「search,sort,page」 ]
  //・search
  let initialSearch = searchParams.search ? searchParams.search : "";
  if(initialSearch){
    //URLに含まれる危険文字を半角スペースに変換
    initialSearch = dangerousCharToSpace(initialSearch.trim());
    //「%20,全角スペース,連続する半角スペース」→「半角スペース」
    initialSearch = initialSearch.replace(/\%20/g, ' ').replace(/　/g, ' ').replace(/ +/g, ' ');
  }
  //・sort
  const initialSort = searchParams.sort;
  const sort:'desc'|'asc' = initialSort!='desc'&&initialSort!='asc' ? 'desc' : initialSort;
  //・page
  const page = searchParams.page && !isNaN(Number(searchParams.page))  ? Number(searchParams.page) : 1;
  
  return (
    <div>
      <Suspense fallback={<Spinner/>}>
        <PostList
          userId={null}
          search={initialSearch}
          sort={sort}
          page={page}
          path={`/post/`}
        />
      </Suspense>
    </div>
  )
}

export default MainPage;
