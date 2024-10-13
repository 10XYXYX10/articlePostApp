'use client'
//import { useActionState } from 'react';
import { useFormState } from 'react-dom';
import AlertError from '../AlertError';
import { SignUpFormState } from '@/lib/types';
import { signUp } from '@/actions/authFunctions';
import { inputClassVal, labelClassVal } from '@/lib/tailwindClassValue';
import MailAuth from './MailAuth';
import { SubmitButton } from '../SubmitButton';

const initialState:SignUpFormState = {
    error:'',
    valueError:{
        name:'',
        email:'',
        password:'',
    },
    email:'',
};

export default function SignUp() {
    //const [state, formAction,isPending] = useActionState(signUp, initialState);
    const [state, formAction] = useFormState(signUp, initialState);

    return (<>
        <div className="flex items-center justify-center mt-5">
            <div className="flex flex-col items-center justify-center w-full max-w-md">
                {state.error && <AlertError errMessage={state.error} reloadBtFlag={false}/>}
                {!state.email
                    ?(        
                        <form 
                            action={formAction}
                            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
                        >
                            <div className="mb-4">
                                <label className={`${labelClassVal}`}>ユーザー名<em>*</em></label>
                                <span className='text-xs text-gray-500'>{`「< > % ;」`}は使用できません</span>
                                <input
                                    name='name'
                                    type='text'
                                    required={true}
                                    placeholder="ユーザー名"
                                    className={`${state.valueError.name&&'border-red-500'} ${inputClassVal}`}
                                />
                                {state.valueError.name && <span className='text-red-500 text-xs italic'>{state.valueError.name}</span>}
                            </div>
                            <div className="mb-4">
                                <label className={`${labelClassVal}`}>メールアドレス<em>*</em></label>
                                <span className='text-xs text-gray-500'>メールアドレス</span>
                                <input
                                    name='email'
                                    type='text'
                                    required={true}
                                    placeholder="メールアドレス"
                                    className={`${state.valueError.email&&'border-red-500'} ${inputClassVal}`}
                                />
                                {state.valueError.email && <span className='text-red-500 text-xs italic'>{state.valueError.email}</span>}
                            </div>
                            <div className="mb-6">
                                <label className={`${labelClassVal}`}>パスワード<em>*</em></label>
                                <span className='text-xs text-gray-500'>5文字以上の半角の英数字を入力して下さい</span>
                                <input
                                    name='password'
                                    type='password'
                                    required={true}
                                    placeholder="パスワード"
                                    className={`${state.valueError.password&&'border-red-500'} ${inputClassVal}`}
                                />
                                {state.valueError.password && <span className='text-red-500 text-xs italic'>{state.valueError.password}</span>}
                            </div>
                            <div className='flex items-center justify-between'>
                                <SubmitButton text='SignUp'/>
                            </div>
                        </form>
                    ):(
                        <MailAuth email={state.email} typeValue={'SignUp'}/>
                    )
                }
            </div>
        </div>

    </>)
}