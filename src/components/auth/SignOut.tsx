'use client'
import { useFormState, useFormStatus } from "react-dom";
import { signOut } from "@/actions/authFunctions";
import { SignOutState } from "@/lib/types";
import { IconLogout2 } from "@tabler/icons-react";
import { useEffect } from "react";

const SignOut = () => {
    const initialState:SignOutState = {
        error:'',
    };
    //const [state, formAction] = useActionState(signIn, initialState);
    const [state, formAction] = useFormState(signOut, initialState);

    useEffect(()=>{
        if(!state.error)return;
        alert(state.error)
    },[state.error])

    const SubmitButton = () => {
        const { pending } = useFormStatus();
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
