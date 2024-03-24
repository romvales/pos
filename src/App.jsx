import './App.scss'

import { RouterProvider } from 'react-router-dom'
import { PageRouter } from './pages'
import { createContext, useEffect, useState } from 'react'

export { App }

export const RootContext = createContext()

function App() {
  const [isVisible, setVisiblity] = useState(true)
  const [barcode, setBarcode] = useState()
  const defaultState = {
    currentBarcodeText: barcode,
    setCurrentBarcodeText: setBarcode,

    loadingBarState: [isVisible, setVisiblity],
    currentPageState: useState(0),
    pageNumberState: useState(0),
    itemCountState: useState(0),
  }

  useEffect(() => {
    let scheduledVsibilityChange;

    const observer = new PerformanceObserver((list) => {
      setVisiblity(true)

      list.getEntries().forEach((entry) => {
        if (scheduledVsibilityChange) {
          clearInterval(scheduledVsibilityChange)
        }

        scheduledVsibilityChange = setInterval(() => {
          setVisiblity(false)
        }, 1e3)
      });
    });

    observer.observe({ type: 'resource', buffered: true });
  }, [])

  return (
    <RootContext.Provider value={defaultState}>
      <RouterProvider router={PageRouter}></RouterProvider>
    </RootContext.Provider>
  )
} 