
import { createBrowserRouter } from 'react-router-dom'

import {
  SalesRegisterPageDataLoader,
  ContactManagerPageDataLoader,
  ItemManagerPageDataLoader,
  SalesManagerPageDataLoader,
  ItemManagerProductInfoPageDataLoader,
  ContactInfoManagerPageDataLoader,
  SalesManagerInvoiceInfoPageDataLoader,
  AccountingPageDataLoader
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
    path: '/sales/i/:invoice_no_id',
    lazy: () => import('./SalesManagerInvoiceInfoPage').then(val => ({ Component: val.SalesManagerInvoiceInfoPage })),
    loader: SalesManagerInvoiceInfoPageDataLoader,
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
  },
  {
    path: '/accounting',
    lazy: () => import('./AccountingPage').then(val => ({ Component: val.AccountingPage })),
    loader: AccountingPageDataLoader,
  },
])  