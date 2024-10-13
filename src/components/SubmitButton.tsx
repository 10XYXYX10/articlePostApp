'use client'
import { useFormStatus } from "react-dom";
 
export function SubmitButton({
    text
}:{
    text:string
}) {
  const { pending } = useFormStatus()

  return (
    <button
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${pending&&'cursor-not-allowed'}`}
        disabled={pending}
        type="submit"
    >
      {pending ? '・・Loading・・' : text}
    </button>
  )
}