
import { createBrowserRouter } from 'react-router-dom'
import { SalesRegisterPage } from './SalesRegisterPage'
import { CustomerManagerPage } from './CustomerManagerPage'
import { ItemManagerPage } from './ItemManagerPage'
import { SalesManagerPage } from './SalesManagerPage'

export { router as PageRouter }

const router = createBrowserRouter([
  {
    path: '/', Component: SalesRegisterPage,
  },
  {
    path: '/manage/sales', Component: SalesManagerPage,
  },
  {
    path: '/manage/customers', Component: CustomerManagerPage,
  },
  {
    path: '/manage/items', Component: ItemManagerPage,
  }
])