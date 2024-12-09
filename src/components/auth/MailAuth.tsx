'use client'
//import { useActionState } from 'react';
import { useFormState } from 'react-dom';
import AlertError from '../AlertError';
import { MailAuthFormState } from '@/lib/types';
import { mailAuth } from '@/actions/authFunctions';
import { SubmitButton } from '../SubmitButton';

const initialState:MailAuthFormState = { 
    error:'',
    valueError:{
        email:'',
        authenticationPassword:'',
    },
};

const MailAuth = ({
    email,
    typeValue,
}:{
    email:string
    typeValue: 'SignUp'|'SignIn',
}) => {
    const mailAuthWithTypeValue = mailAuth.bind(null, typeValue);
    //const [state, formAction,isPending] = useActionState(mailAuthWithTypeValue, initialState);
    const [state, formAction] = useFormState(mailAuthWithTypeValue, initialState);

    return(<>
        <div className="flex items-center justify-center">
            <div className="flex flex-col items-center justify-center w-full max-w-md">
                <p className='text-red-600'>
                    ✉{email}に、認証パスワードを送信しました
                </p>

                {state.error && <AlertError errMessage={state.error} reloadBtFlag={true}/>}

                <form 
                    action={formAction}
                    className="mt-3 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
                >
                    <input
                        name='email'
                        type='hidden'
                        required={true}
                        defaultValue={email}
                    />
                    <div className="mb-4">
                        <label className='block text-gray-700 text-md font-bold'>6桁認証番号<em>*</em></label>
                        <span className='text-xs text-gray-500'>6桁の半角数字を入力して下さい</span>
                        <input
                            name='authenticationPassword'
                            type='text'
                            required={true}
                            placeholder="認証パスワード"
                            className={`
                                ${state.valueError.authenticationPassword&&'border-red-500'} 
                                bg-gray-100 shadow appearance-none break-all border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline
                            `}
                        />
                        {state.valueError.authenticationPassword&& 
                            <span className='text-red-500 text-xs italic'>
                                {state.valueError.authenticationPassword}
                            </span>
                        }
                    </div>
                    <div className='flex items-center justify-between'>
                        <SubmitButton text='Submit'/>
                    </div>
                </form>
            </div>
        </div>
    </>);
}
export default MailAuth;