import './App.scss'

import { RouterProvider } from 'react-router-dom'

import { PageRouter } from './pages'


export { App }

function App() {
  return (
    <>
      <RouterProvider router={PageRouter}></RouterProvider>
    </>
  )
}