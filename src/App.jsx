import './App.scss'

import { RouterProvider } from 'react-router-dom'
import { PageRouter } from './pages'
import { createContext, useState } from 'react'

export { App }


export const RootContext = createContext()

function App() {
  return (
    <RouterProvider router={PageRouter}></RouterProvider>
  )
} 