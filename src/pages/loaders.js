import { DefaultClient } from '../supabase'

export async function AccountingPageDataLoader({}) {
  return {}
}

// @DATALOADER: staticProducts, staticCustomers, staticLocations, staticInvoiceTypes
export async function SalesRegisterPageDataLoader({ params, pageNumber = 0, itemCount = 12, searchQuery }) {
  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'SalesRegisterPageDataLoader',
      parameters: {
        pageNumber,
        itemCount,
        searchQuery,
      },
    }
  })).data
}

// @DATALOADER: staticSales
export async function SalesManagerPageDataLoader({ pageNumber = 0, itemCount = 16, searchQuery, fetchOnlySales }) {
  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'SalesManagerPageDataLoader',
      parameters: {
        pageNumber,
        itemCount,
        searchQuery,
        fetchOnlySales,
      },
    }
  })).data
}

export async function SalesManagerInvoiceInfoPageDataLoader({ params }) {
  const { invoice_no_id } = params
  const [invoiceId, id] = invoice_no_id?.split('.')

  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'SalesManagerInvoiceInfoPageDataLoader',
      parameters: {
        id,
        invoiceId,
      },
    },
  })).data
}

export async function ItemManagerProductInfoPageDataLoader({ params }) {
  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'ItemManagerProductInfoPageDataLoader',
      parameters: {
        id: params.id,
        product_name: params.product_name,
        dontPaginateContacts: true,
      },
    }
  })).data
}

// @DATALOADER: staticCategories, staticDealers, staticProducts
export async function ItemManagerPageDataLoader({ params, pageNumber = 0, itemCount = 12, searchQuery }) {
  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'ItemManagerPageDataLoader',
      parameters: {
        pageNumber,
        itemCount,
        searchQuery,
      },
    }
  })).data
}

// @DATALOADER
export async function ContactManagerPageDataLoader({ params, pageNumber = 0, itemCount = 10, searchQuery }) {
  return (await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'ContactManagerPageDataLoader',
      parameters: {
        pageNumber,
        itemCount,
        searchQuery,
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