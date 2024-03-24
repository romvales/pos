
import { createBrowserRouter } from 'react-router-dom'

import {
  SalesRegisterPageDataLoader,
  ContactManagerPageDataLoader,
  ItemManagerPageDataLoader,
  SalesManagerPageDataLoader,
  ItemManagerProductInfoPageDataLoader,
  ContactInfoManagerPageDataLoader
} from './loaders'

export { router as PageRouter }

const router = createBrowserRouter([
  {
    path: '/', 
    lazy: () => import('./SalesRegisterPage').then(val => ({ Component: val.SalesRegisterPage })),
    loader: SalesRegisterPageDataLoader,
  },
  {
    path: '/sales', 
    lazy: () => import('./SalesManagerPage').then(val => ({ Component: val.SalesManagerPage })),
    loader: SalesManagerPageDataLoader,
  },
  {
    path: '/contacts', 
    lazy: () => import('./ContactManagerPage').then(val => ({ Component: val.ContactManagerPage })),
    loader: ContactManagerPageDataLoader,
  },
  {
    path: '/contacts/:id',
    lazy: () => import('./ContactInfoManagerPage').then(val => ({ Component: val.ContactInfoManagerPage })),
    loader: ContactInfoManagerPageDataLoader,
  },
  {
    path: '/stocks', 
    lazy: () => import('./ItemManagerPage').then(val => ({ Component: val.ItemManagerPage })),
    loader: ItemManagerPageDataLoader,
  },
  {
    path: '/stocks/p/:id/:product_name',
    lazy: () => import('./ItemManagerProductInfoPage').then(val => ({ Component: val.ItemManagerProductInfoPage })),
    loader: ItemManagerProductInfoPageDataLoader,
  },
  {
    path: '/settings',
    lazy: () => import('./SettingsPage').then(val => ({ Component: val.SettingsPage })),
  }
])