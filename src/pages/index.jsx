
import { createBrowserRouter } from 'react-router-dom'
import { SalesRegisterPage, SalesRegisterPageDataLoader } from './SalesRegisterPage'
import { ContactManagerPage, ContactManagerPageDataLoader } from './ContactManagerPage'
import { ItemManagerPageDataLoader, ItemManagerPage } from './ItemManagerPage'
import { SalesManagerPage, SalesManagerPageDataLoader } from './SalesManagerPage'
import { ItemManagerProductInfoPage, ItemManagerProductInfoPageDataLoader } from './ItemManagerProductInfoPage'
import { ContactInfoManagerPage, ContactInfoManagerPageDataLoader } from './ContactInfoManagerPage'

export { router as PageRouter }

const router = createBrowserRouter([
  {
    path: '/', 
    Component: SalesRegisterPage,
    loader: SalesRegisterPageDataLoader,
  },
  {
    path: '/sales', 
    Component: SalesManagerPage,
    loader: SalesManagerPageDataLoader,
  },
  {
    path: '/contacts', 
    Component: ContactManagerPage,
    loader: ContactManagerPageDataLoader,
  },
  {
    path: '/contacts/:id',
    Component: ContactInfoManagerPage,
    loader: ContactInfoManagerPageDataLoader,
  },
  {
    path: '/products', 
    Component: ItemManagerPage,
    loader: ItemManagerPageDataLoader,
  },
  {
    path: '/products/:id/:product_name',
    Component: ItemManagerProductInfoPage,
    loader: ItemManagerProductInfoPageDataLoader,
  }
])