import './App.scss'

import { RouterProvider } from 'react-router-dom'
import { PageRouter } from './pages'
import { createContext, useState } from 'react'

export { App }


export const RootContext = createContext()

function App() {
  const [barcode, setBarcode] = useState(null)
  const defaultState = {
    currentBarcodeText: barcode,
    setCurrentBarcodeText: setBarcode,
  }
  
  return (
    <RootContext.Provider value={defaultState}>
      <RouterProvider router={PageRouter}></RouterProvider>
    </RootContext.Provider>
  )
} 