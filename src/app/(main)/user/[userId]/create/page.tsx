import CreatePost from "@/components/post/CreatePost";
const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;

const MainUserCreatePage = () => {
    return (
        <div className="p-5">
            <CreatePost apiUrl={apiUrl}/>
        </div>
    )
}

export default MainUserCreatePage;
