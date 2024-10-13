import { getPostWithThumbnailList } from "@/lib/functions/fetchFnc"
import { IconArrowBigLeftLine, IconArrowBigRightLine } from "@tabler/icons-react";
import Link from "next/link";
import Post from "./Post";

const PostList = async({
    userId,
    search,
    sort,
    page,
    fetchCount,
    path,
}:{
    userId:number|null
    search:string
    sort:'desc'|'asc'
    page:number
    fetchCount:number
    path:string
}) => {
  //////////
  //■[ データ取得 ]
  const {result,message,data} = await getPostWithThumbnailList({userId,search,sort,page,fetchCount,});
  if(!result || !data)throw new Error(message);

  //////////
  //■[ next,prev ]
  let queryParameter:string = `?page=${page}`;
  queryParameter+=`&sort=${sort}&`;
  if(search)queryParameter+=`&search=${search}`;
  const url = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/user/${userId}?${queryParameter}`);
  const params = new URLSearchParams(url.search);
  let nextPageUrl='';
  let prevPageUrl='';
  if(page>1){
      //□offset更新：-1
      params.set('page', String(page-1));
      url.search = params.toString();
      prevPageUrl = url.toString();
  }
  if(data.length>fetchCount){
      //□offset更新：+1
      params.set('page', String(page+1));
      url.search = params.toString();
      nextPageUrl = url.toString();
  }

  return (<>
  <div className="p-1 mt-5 sm:p-5 sm:mt-0">
    <div className="sm:flex sm:flex-wrap sm:items-stretch container mx-auto">
      {data.slice(0,fetchCount).map( (post) => <Post post={post} path={path} key={post.id}/> )}
    </div>
  </div>

    <div className="flex justify-between items-center mt-10">
          <span>
            {prevPageUrl && (
                <Link href={prevPageUrl} className="hover:opacity-65">
                    <IconArrowBigLeftLine width={35} height={35}/>
                </Link>
            )}
          </span>
          <span className='font-bold text-lg'>{page}</span>
          <span>
            {nextPageUrl && (
                <Link href={nextPageUrl} className="hover:opacity-65">
                    <IconArrowBigRightLine width={35} height={35}/>
                </Link>
            )}
          </span>
      </div>
  </>)
}

export default PostList
