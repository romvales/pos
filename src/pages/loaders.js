import { 
  getContactByIdFromDatabase,
  getContacts, 
  getContactsFromDatabase, 
  getDealers, 
  getInvoiceTypesFromDatabase, 
  getLocationsFromDatabase, 
  getProductByIdAndProductNameFromDatabase, 
  getProductCategoriesFromDatabase, 
  getProductsFromDatabase, 
  getSalesFromDatabase } from '../actions'
import { DefaultClient } from '../supabase'

// @DATALOADER: staticProducts, staticCustomers, staticLocations, staticInvoiceTypes
export async function SalesRegisterPageDataLoader() {
  const staticProducts = []
  const staticInvoiceTypes = []
  const staticCustomers = []
  const staticLocations = []

  await getProductsFromDatabase()
    .then(res => {
      const { data } = res
      staticProducts.push(...(data ?? []))
    })
    .catch()

  await getLocationsFromDatabase()
    .then(res => {
      const { data } = res
      staticLocations.push(...(data ?? []))
    })

  await getInvoiceTypesFromDatabase()
    .then(res => {
      const { data } = res
      staticInvoiceTypes.push(...(data ?? []))
    })

  await getContactsFromDatabase()
    .then(res => {
      const { data } = res
      staticCustomers.push(...(data ?? []))
    })

  return {
    staticProducts,
    staticCustomers,
    staticLocations,
    staticInvoiceTypes,
  }
}

// @DATALOADER: staticSales
export async function SalesManagerPageDataLoader() {
  const staticSales = []

  // Explanation: Gets all sales from the database along with other related data (sales, order summary items, customer)
  await getSalesFromDatabase(`
    *,
    customer:customer_id (*),
    selections (
      *,
      product:item_id (
        *,
        dealer:dealer_id(
          *
        ),
        itemPriceLevels:items_price_levels(
          price_level_id,
          priceLevel:price_level_id(
            level_name,
            price
          )
        )
      )
    )
  `)
    .then(res => {
      const { data } = res
      staticSales.push(...(data ?? []))
    })

  const { staticCustomers, staticInvoiceTypes, staticLocations } = await SalesRegisterPageDataLoader()

  return {
    staticSales,
    staticCustomers,
    staticLocations,
    staticInvoiceTypes,
  }
}

export async function ItemManagerProductInfoPageDataLoader({ params }) {
  const { id, product_name } = params

  const staticProduct = await getProductByIdAndProductNameFromDatabase(id, product_name)
    .then(res => {
      const { data } = res
      return data
    })
    .catch()

  const { staticCategories, staticProducts, staticDealers } = await ItemManagerPageDataLoader()

  return {
    staticProduct,
    staticProducts,
    staticCategories,
    staticDealers,
  }
}

// @DATALOADER: staticCategories, staticDealers, staticProducts
export async function ItemManagerPageDataLoader() {
  const staticCategories = []
  const staticDealers = (await getDealers()) ?? []
  const staticProducts = []

  await getProductCategoriesFromDatabase()
    .then(res => {
      const { data } = res
      staticCategories.push(...data)
    })
    .catch()

  await getProductsFromDatabase(0, 12)
    .then(res => {
      const { data } = res
      staticProducts.push(...data)
    })
    .catch()

  return {
    staticCategories,
    staticDealers,
    staticProducts,
  }
}

// @DATALOADER
export async function ContactManagerPageDataLoader() {
  const staticLocations = []
  const staticContacts = {
    staffs: [],
    customers: [],
    dealers: [],
  }

  await getLocationsFromDatabase()
    .then(res => {
      const { data } = res
      staticLocations.push(...data)
    })
    .catch()

  await getContacts(staticContacts)

  return {
    staticLocations,
    staticContacts,
  }
}

// @DATALOADER: staticContact
export async function ContactInfoManagerPageDataLoader({ params }) {
  const id = atob(params.id)
  const staticLocations = []
  let staticContact = {}

  await getContactByIdFromDatabase(id)
    .then(res => {
      const { data } = res
      staticContact = { ...data }
    })

  await getLocationsFromDatabase()
    .then(res => {
      const { data } = res
      staticLocations.push(...(data ?? []))
    })

  return {
    staticContact: structuredClone(staticContact),
    staticLocations,
  }
}