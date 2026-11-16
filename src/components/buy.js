import { createContext, useContext } from 'react'

// 주문서(구매하기) 창을 어디서든 열 수 있게 하는 컨텍스트.
// buy.open(item) 처럼 상품을 넘기면 그 상품으로 주문서가 열리고,
// 값 없이 buy.open() 하면 기본 상품(오륜미네랄)으로 열립니다.
export const BuyContext = createContext({ open: () => {}, close: () => {} })
export const useBuy = () => useContext(BuyContext)
