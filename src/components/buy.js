import { createContext, useContext } from 'react'

// 주문서(구매하기) 창을 어디서든 열 수 있게 하는 컨텍스트.
export const BuyContext = createContext({ open: () => {}, close: () => {} })
export const useBuy = () => useContext(BuyContext)
