import Link from 'next/link'
import UserIcon from './UserIcon'
import SearchForm from './SearchForm';
import { Suspense } from 'react';

const Header = async() => {
    return (<header className='bg-slate-300 max-w-full p-3'>
        <div className='flex items-center justify-between container mx-auto max-w-screen-lg'>
            <div>
                <Link 
                    href='/'
                    className='inline-block font-bold px-2.5 py-1 text-blue-600 hover:text-blue-400 text-md sm:text-2xl'
                >
                    NextJS
                </Link>                
            </div>

            <div>
                {/* useSearchParamsを使用する場合、<suspense>でラップすることが推奨されている */}
                <Suspense fallback='…loading…'>
                    <SearchForm/>
                </Suspense>
            </div>

            <div>
                <UserIcon/>
            </div>
            
        </div>
    </header>)
}
export default Header;
