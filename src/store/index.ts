import { AuthUser } from '@/lib/types'
import { create } from 'zustand'

const initialData: AuthUser = {
    id: 0,
    name: '',
}

type State = {
  user: AuthUser
  updateUser: (payload: AuthUser) => void
  resetUser: () => void
}

const useStore = create<State>((set) => ({
  user: initialData,
  updateUser: (payload) =>
    set({
      user: payload,
   }
  ),
  resetUser: () => set({ user: initialData }),
}))

export default useStore