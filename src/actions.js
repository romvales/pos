
import { DefaultClient } from './supabase'

export {
  saveLocationToDatabase,
  saveContactToDatabase,
  saveProductCategoryToDatabase,
  saveProductToDatabase,
  saveSalesToDatabase,

  getFullName, // Does not connect/query the database.
  getDealerName, // 
  getInvoiceTypesFromDatabase,
  getProductByIdAndProductNameFromDatabase,
  getProductCategoriesFromDatabase,
  getProductsFromDatabase,
  getLocationsFromDatabase,
  getContactByIdFromDatabase,
  getContactsFromDatabase,
  getSalesFromDatabase,
  getSalesItemSelectionsFromDatabase,
  getCustomers,
  getStaffs,
  getDealers,
  getContacts,
  
  deleteLocation,
  deleteContact,
  deleteProductCategory,
  deleteProduct,
  deleteSales,

  uploadFileToServer,
  createPublicUrlForPath,

  pesoFormatter,
}

const getFullName = (contact) => {
  return [contact.first_name, contact.middle_initial, contact.last_name].join(' ').replace(/\s\s+/g, ' ')
}

const getDealerName = (dealer) => {
  const fullName = getFullName(dealer)
  const companyName = dealer.company_name

  if (companyName.length) {
    return fullName + ` (${companyName})`
  }

  return fullName
}

async function getLocationsFromDatabase() {
  return DefaultClient.from('locations').select()
}

async function getContactsFromDatabase(contactType) {
  if (!contactType) {
    return DefaultClient.from('contacts').select().order('date_added', { ascending: false })
  }

  return DefaultClient.from('contacts').select().match({
    contact_type: contactType,
  }).order('date_added', { ascending: false })
}

async function getContactByIdFromDatabase(id) {
  return DefaultClient.from('contacts').select().single().match({ id })
}

async function getProductCategoriesFromDatabase() {
  return DefaultClient.from('item_types').select()
}

async function getSalesFromDatabase(customSelect) {
  return DefaultClient.from('sales').select(customSelect ?? '*').order('sales_date', { ascending: false })
}

async function getSalesItemSelectionsFromDatabase(salesData) {
  return DefaultClient.from('selections').select().match({
    sales_id: salesData.id,
  })
}

async function getInvoiceTypesFromDatabase() {
  return DefaultClient.from('invoice_types').select()
}

async function deleteLocation(location) {
  return DefaultClient.from('locations')
    .delete({ count: 1 })
    .eq('id', location.id)
}

async function deleteContact(contactData) {
  return DefaultClient.from('contacts')
    .delete({ count: 1 })
    .eq('id', contactData.id)
}

async function deleteProductCategory(categoryData) {
  return DefaultClient.from('item_types')
    .delete({ count: 1 })
    .eq('id', categoryData.id)
}

async function deleteProduct(product) {
  return DefaultClient.from('items')
    .delete({ count: 1 })
    .eq('id', product.id)
}

async function deleteSales(salesData) {
  return DefaultClient.from('sales')
    .delete({ count: 1 })
    .eq('id', salesData.id)
}

async function saveLocationToDatabase(location) {
  return DefaultClient.from('locations').upsert(location, { onConflict: 'id' })
}

async function saveContactToDatabase(contactData) {
  const now = new Date()

  // yields to yyyy-mm-dd
  const dateOpen = `${now.getFullYear()}-${now.getMonth().toString().padStart(2, '0')}-${now.getDate()}`

  if (contactData.birthdate == '') delete contactData.birthdate
  contactData.date_open = dateOpen
  return DefaultClient.from('contacts').upsert(contactData, { onConflict: 'id' })
}

async function saveSalesToDatabase(sales) {

  // Save the sales to the database
  const clonedSales = structuredClone(sales)

  // Delete all fields not related to the sales schema.
  delete clonedSales.customer
  delete clonedSales.selections
  delete clonedSales.length

  // Just delete the sales from the database if its total is zero
  if (clonedSales.total_due == 0) {
    return deleteSales(clonedSales).catch()
  }

  return DefaultClient.from('sales').upsert(clonedSales, { onConflict: 'id' }).select()
    .then(async res => {
      const { data } = res

      const [ savedSales ] = data
      const toPerform = []

      if (sales.selections) {
        // Save selected items (if any) to the database.
        for (const selection of Object.values(sales.selections)) {
          const toSave = structuredClone(selection)
          const product = toSave.product ?? {}
          toSave.sales_id = savedSales.id

          // @FEATURE: When sale is already paid, make sure that the product quantities are updated.
          if (savedSales.sales_status == 'paid') {
            product.item_sold += toSave.quantity
            product.item_quantity -= toSave.quantity

            if (!product.id) continue

            // Delete unrelated fields
            delete product.category
            delete product.dealer
            delete product.itemPriceLevels
            
            toPerform.push(saveProductToDatabase(product))
          }

          // Delete unrelated fields
          delete toSave.product
          delete toSave.item_index
          delete toSave.item

          toPerform.push(
            DefaultClient.from('selections').upsert(toSave, { onConflict: 'id' })
          )
        }
        
      }

      await Promise.all(toPerform)
    })
    .catch()
}

async function saveProductToDatabase(productData) {
  const clonedProduct = structuredClone(productData)
  const priceLevels = productData.priceLevels

  delete clonedProduct.priceLevels

  return DefaultClient.from('items').upsert(clonedProduct, { onConflict: 'id' })
    .then(async () => {
      const toPerform = []

      if (priceLevels) {
        for (const levelData of priceLevels) {
          const { priceLevel, itemPriceLevel } = levelData

          // First, save the price level to the database
          toPerform.push(
            DefaultClient.from('price_levels')
              .upsert(priceLevel, { onConflict: 'id' })
              .select()
              .single()
              .then(async res => {
                const { data } = res
                const savedPriceLevel = data

                itemPriceLevel.price_level_id = savedPriceLevel.id

                // and then the itemPriceLevels collection.
                await DefaultClient.from('items_price_levels').upsert(itemPriceLevels, { onConflict: 'id' })
              })
          )
        }
      }

      await Promise.all(toPerform)
    })
}

async function saveProductCategoryToDatabase(categoryData) {
  return DefaultClient.from('item_types').upsert(categoryData, { onConflict: 'id' })
}

function getProductByIdAndProductNameFromDatabase(id, item_name) {
  return DefaultClient.from('items').select(`
    *,
    dealer:dealer_id(*),
    itemPriceLevels:items_price_levels (
      *,
      priceLevel:price_level_id (*)
    )
  `).single().match({ id, item_name })
}

async function getProductsFromDatabase() {
  return DefaultClient.from('items').select(`
    *,
    dealer:dealer_id(*),
    category:item_type_id(*),
    itemPriceLevels:items_price_levels(
      price_level_id,
      priceLevel:price_level_id(
        level_name,
        price
      ) 
    )
  `)
}

async function getCustomers() {
  const customers = []

  await getContactsFromDatabase('customer')
    .then(res => {
      const { data } = res
      customers.push(...data)
    })
    .catch()

  return customers
}

async function getStaffs() {
  const staffs = []

  await getContactsFromDatabase('staff')
    .then(res => {
      const { data } = res
      staffs.push(...data)
    })
    .catch()

  return staffs
}

async function getContacts(staticContacts) {
  await getCustomers().then(customers => staticContacts.customers = customers)
  await getStaffs().then(staffs => staticContacts.staffs = staffs)
  await getDealers().then(dealers => staticContacts.dealers = dealers)
}

async function getDealers() {
  const staffs = []

  await getContactsFromDatabase('dealer')
    .then(res => {
      const { data } = res
      staffs.push(...data)
    })
    .catch()

  return staffs
}

async function uploadFileToServer(file) {
  const fileExtension = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExtension}`


  return DefaultClient.storage.from('images').upload(fileName, file, {
    contentType: file.type,
    upsert: true,
  })
}

function createPublicUrlForPath(path, config) {
  if (!config) config = {}
  return DefaultClient.storage.from('images').getPublicUrl(path, config).data.publicUrl
}

const pesoFormatter = Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'PHP',
})

