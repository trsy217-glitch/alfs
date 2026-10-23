import { createContext, useContext } from 'react'
export const ConsultContext = createContext({ open: () => {} })
export const useConsult = () => useContext(ConsultContext)
