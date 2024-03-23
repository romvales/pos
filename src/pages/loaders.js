import { DefaultClient } from '../supabase'

// @DATALOADER: staticProducts, staticCustomers, staticLocations, staticInvoiceTypes
export async function SalesRegisterPageDataLoader() {
  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'SalesRegisterPageDataLoader',
      parameters: {
        pageNumber: 0,
        itemCount: 12,
      },
    }
  })).data
}

// @DATALOADER: staticSales
export async function SalesManagerPageDataLoader({ request, params, pageNumber = 0, itemCount = 10 }) {
  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'SalesManagerPageDataLoader',
      parameters: {
        pageNumber,
        itemCount,
      },
    }
  })).data
}

export async function ItemManagerProductInfoPageDataLoader({ params }) {
  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'ItemManagerProductInfoPageDataLoader',
      parameters: {
        id: params.id,
        product_name: params.product_name,
      },
    }
  })).data
}

// @DATALOADER: staticCategories, staticDealers, staticProducts
export async function ItemManagerPageDataLoader({ params, pageNumber = 0, itemCount = 12 }) {
  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'ItemManagerPageDataLoader',
      parameters: {
        pageNumber,
        itemCount,
      },
    }
  })).data
}

// @DATALOADER
export async function ContactManagerPageDataLoader({ params, pageNumber = 0, itemCount = 10 }) {
  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'ContactManagerPageDataLoader',
      parameters: {
        pageNumber,
        itemCount,
      },
    }
  })).data
}

// @DATALOADER: staticContact
export async function ContactInfoManagerPageDataLoader({ params }) {
  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'ContactInfoManagerPageDataLoader',
      parameters: {
        id: atob(params.id),
      },
    }
  })).data
}