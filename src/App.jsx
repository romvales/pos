import './App.scss'

import { RouterProvider } from 'react-router-dom'
import { PageRouter } from './pages'
import { createContext, useEffect } from 'react'
import { DefaultClient } from './supabase'

export { App }

export const RootContext = createContext()

function App() {

  return (
    <RouterProvider router={PageRouter}></RouterProvider>
  )
} 