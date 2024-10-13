import Link from 'next/link'
import { AuthUser } from '@/lib/types'
import { IconUser } from '@tabler/icons-react'
import SignOut from './auth/SignOut'

const Header = ({
    loginUser
}:{
    loginUser:AuthUser | null
}) => {

    return (<header className='bg-slate-300 max-w-full p-3'>
        <div className='flex items-center justify-between container mx-auto max-w-screen-lg'>
            <div className='flex items-center'>
                <Link 
                    href='/'
                    className='inline-block font-bold px-2.5 py-1 text-blue-600 hover:text-blue-400 text-md sm:text-2xl'
                >
                    Next-SMS
                </Link>                
            </div>

            <div className='flex space-x-3'>
                {loginUser && <SignOut/> }
                <Link
                    href={'/'}
                    className="bg-gray-400 rounded-full p-2 hover:opacity-75 inline-block my-1"
                >
                    {loginUser
                        ?(
                            loginUser.name.slice(0,3)
                        ):(<>
                            <IconUser/>
                        </>)
                    }
                </Link>
            </div>
            
        </div>
    </header>)
}
export default Header;
