'use client'
import { useFormState, useFormStatus } from "react-dom";
import { signOut } from "@/actions/authFunctions";
import { SignOutState } from "@/lib/types";
import { IconLogout2 } from "@tabler/icons-react";
import { useEffect } from "react";

const initialState:SignOutState = {
  error:'',
};

const SignOut = () => {
    //const [state, formAction,isPending ] = useActionState(signOut, initialState);//useActionStateでは、useFormStatusを用いなくとも、直接ペンディング状態を取得可能
    const [state, formAction] = useFormState(signOut, initialState);

    useEffect(()=>{
        if(!state.error)return;
        alert(state.error)
    },[state.error])

    const SubmitButton = () => {
        const { pending } = useFormStatus();//useActionStateでは、useFormStatusを用いなくとも、直接ペンディング状態を取得可能
        return (
          <button
            type="submit"
            disabled={pending}
            className={`p-2 hover:opacity-75 inline-block my-1 ${pending&&'cursor-not-allowed'}`}
          >
            <IconLogout2 size={24}/>
          </button>
        );
    };

    return (
        <form action={formAction}>
          <SubmitButton/>
        </form>
    )
}

export default SignOut
