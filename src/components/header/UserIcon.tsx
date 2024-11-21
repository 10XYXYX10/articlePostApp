'use client'
//import { AuthUser } from '@/lib/types';
import useStore from '@/store';
import { IconUser } from '@tabler/icons-react'
//import axios from 'axios';
import Link from 'next/link';
//import { useEffect } from 'react';
import SignOut from '../auth/SignOut';
import { usePathname } from 'next/navigation';
//import { usePathname, useRouter } from 'next/navigation';
//const apiUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:3000/api';

const UserIcon = () => {
    // const router = useRouter();
    const pathname = usePathname();
    const {user} = useStore();
    // const updateUser = useStore((state) => state.updateUser);
    // const resetUser = useStore((state) => state.resetUser);

    // useEffect(()=>{
    //     const fetchData = async () =>{
    //         try{
    //             const {data} = await axios.get<AuthUser>(`${apiUrl}/auth`);
    //             updateUser(data)
    //         }catch(err){
    //             resetUser();
    //             if(pathname.startsWith('/user')){
    //                 let message = 'Something went wrong. Please log in again.';
    //                 if (axios.isAxiosError(err) && err.response?.data.message) {
    //                     message = err.response.data.message;
    //                 } else if (err instanceof Error) {
    //                     message = err.message;
    //                 }
    //                 alert(message);
    //                 router.push('/auth');
    //             }
    //         }
    //     }
    //     fetchData();
    // },[])

    return (
        <div className='flex space-x-3'>
            {user.name && <SignOut/>}
            <Link
                href={user.id ? `/user/${user.id}` : '/user'}
                prefetch={false}//trueだと、本番環境において、middlewareでの認証が上手くいかなくなる
                className={`rounded-full p-2 hover:opacity-75 inline-block my-1 ${pathname.startsWith('/user')?'bg-red-400':'bg-gray-400'}`}
            >
                {user.name
                    ?(
                        user.name.slice(0,3)
                    ):(
                        <IconUser/>
                    )
                }
            </Link>
        </div>
    )
}
export default UserIcon;
