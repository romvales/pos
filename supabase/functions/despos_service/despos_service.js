export {

  ContactInfoManagerPageDataLoader,
  ContactManagerPageDataLoader,
  ItemManagerPageDataLoader,
  ItemManagerProductInfoPageDataLoader,
  SalesManagerPageDataLoader,
  SalesRegisterPageDataLoader,
  SettingsPageDataLoader,
  AccountingPageDataLoader,
  SalesManagerInvoiceInfoPageDataLoader,

  saveLocationToDatabase,
  saveContactToDatabase,
  saveProductCategoryToDatabase,
  saveProductToDatabase,
  saveSalesToDatabase,

  getInvoiceTypesFromDatabase,
  getProductByBarcodeFromDatabase,
  getProductByIdAndProductNameFromDatabase,
  getProductCategoriesFromDatabase,
  getProductsFromDatabase,
  getLocationsFromDatabase,
  getContactByIdFromDatabase,
  getContactsFromDatabase,
  getSalesFromDatabase,
  getSalesItemSelectionsFromDatabase,
  getSalesByInvoiceAndIdFromDatabase,
  getCustomers,
  getStaffs,
  getDealers,
  getContacts,

  // Counters
  getSalesCountFromDatabase,
  getContactsCountFromDatabase,
  getContactsCountByTypeFromDatabase,
  getProductsCountFromDatabase,

  deleteLocation,
  deleteContact,
  deleteContactSelections,
  deleteProductCategory,
  deleteProductItemSelectionByIdFromDatabase,
  deleteProduct,
  deleteSales,
  deleteSalesSelections,

  refreshContacts,

}

async function ContactInfoManagerPageDataLoader(DefaultClient, parameters) {
  const { id } = parameters

  const staticLocations = []
  let staticContact = {}

  await getContactByIdFromDatabase(DefaultClient, { id })
    .then(res => {
      const { data } = res
      staticContact = { ...data }
    })

  await getLocationsFromDatabase(DefaultClient)
    .then(res => {
      const { data } = res
      staticLocations.push(...(data ?? []))
    })

  return {
    data: {
      staticContact: structuredClone(staticContact),
      staticLocations
    }
  }
}

async function ContactManagerPageDataLoader(DefaultClient, parameters) {
  const staticLocations = []
  const staticContacts = (await getContacts(DefaultClient, parameters)).data

  await getLocationsFromDatabase(DefaultClient)
    .then(res => {
      const { data } = res
      staticLocations.push(...data)
    })
    .catch()

  return {
    data: {
      staticLocations,
      staticContacts,
      counts: (await getContactsCountByTypeFromDatabase(DefaultClient)).data,
    }
  }
}

async function ItemManagerPageDataLoader(DefaultClient, parameters) {
  const staticCategories = []
  const staticDealers = (await getDealers(DefaultClient, parameters)).data ?? []
  const staticProducts = []

  await getProductCategoriesFromDatabase(DefaultClient, parameters)
    .then(res => {
      const { data } = res
      staticCategories.push(...data)
    })
    .catch()

  await getProductsFromDatabase(DefaultClient, parameters)
    .then(res => {
      const { data } = res
      staticProducts.push(...data)
    })
    .catch()

  return {
    data: {
      staticCategories,
      staticDealers,
      staticProducts,
    }
  }
}

async function ItemManagerProductInfoPageDataLoader(DefaultClient, parameters) {
  const { id, product_name } = parameters

  const staticProduct = await getProductByIdAndProductNameFromDatabase(DefaultClient, {
    id, item_name: product_name,
  })
    .then(res => {
      const { data } = res
      return data
    })
    .catch()

  const { staticCategories, staticProducts, staticDealers } = (await ItemManagerPageDataLoader(DefaultClient, parameters)).data

  return {
    data: {
      staticProduct,
      staticProducts,
      staticCategories,
      staticDealers,
    }
  }
}

async function SalesManagerPageDataLoader(DefaultClient, parameters) {
  const { fetchOnlySales } = parameters
  const staticSales = []

  // Explanation: Gets all sales from the database along with other related data (sales, order summary items, customer)
  await getSalesFromDatabase(DefaultClient, {
    ...parameters,
    customSelect: `
      *,
      customer:customer_id (*),
      selections (
        *,
        product:item_id (
          *,
          dealer:dealer_id(
            *
          ),
          category:item_type_id(
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
    `
  })
    .then(res => {
      const { data } = res
      staticSales.push(...(data ?? []))
    })

  if (fetchOnlySales) {
    return {
      data: {
        staticSales,
      },
    }
  }

  const { staticCustomers, staticInvoiceTypes, staticLocations } = (await SalesRegisterPageDataLoader(DefaultClient, parameters)).data

  return {
    data: {
      staticSales,
      staticCustomers,
      staticLocations,
      staticInvoiceTypes,
    }
  }
}

async function SalesRegisterPageDataLoader(DefaultClient, parameters) {
  const staticProducts = []
  const staticInvoiceTypes = []
  const staticCustomers = []
  const staticLocations = []

  await getProductsFromDatabase(DefaultClient, parameters)
    .then(res => {
      const { data } = res
      staticProducts.push(...(data ?? []))
    })
    .catch()

  await getLocationsFromDatabase(DefaultClient, parameters)
    .then(res => {
      const { data } = res
      staticLocations.push(...(data ?? []))
    })

  await getInvoiceTypesFromDatabase(DefaultClient, parameters)
    .then(res => {
      const { data } = res
      staticInvoiceTypes.push(...(data ?? []))
    })

  await getContactsFromDatabase(DefaultClient, parameters)
    .then(res => {
      const { data } = res
      staticCustomers.push(...(data ?? []))
    })

  return {
    data: {
      staticProducts,
      staticCustomers,
      staticLocations,
      staticInvoiceTypes,
    }
  }
}

function SettingsPageDataLoader(DefaultClient, parameters) {
  return { data: {} }
}

function AccountingPageDataLoader(DefaultClient, parameters) {
  return { data: {} }
}

async function SalesManagerInvoiceInfoPageDataLoader(DefaultClient, parameters) {
  const salesData = (await getSalesByInvoiceAndIdFromDatabase(DefaultClient, parameters)).data

  return {
    data: {
      salesData,
    },
  }
}

function getLocationsFromDatabase(DefaultClient) {
  return DefaultClient.from('locations').select()
}

function getContactsFromDatabase(DefaultClient, parameters) {
  const { contactType, pageNumber, itemCount, searchQuery, dontPaginateContacts } = parameters

  let query;

  if (!contactType) {
    query = DefaultClient.from('contacts').select(`*, full_name, approved_by(id, full_name)`)
  } else {
    query = DefaultClient.from('contacts').select(`*, full_name, approved_by(id, full_name)`).match({ contact_type: contactType })
  }

  if (searchQuery && searchQuery.length) {
    query = query.or(`full_name.like.%${searchQuery}%`)
  }

  if (!dontPaginateContacts)
    query = query
      .range(pageNumber * (itemCount - 1) + (pageNumber > 0 ? 1 : 0), itemCount * (pageNumber + 1) - 1)

  query = query.order('date_added', { ascending: false })

  return query.then(res => {
    res.data = res.data?.map(cleanContactInfo)
    return res
  })
}

async function getContactsCountFromDatabase(DefaultClient, parameters) {
  const { contactType } = parameters

  if (!contactType) {
    return {
      data: (await DefaultClient.from('contacts').select('id', { count: 'exact', head: true })).count ?? 0
    }
  }

  return {
    data: (await DefaultClient.from('contacts').select('id', { count: 'exact', head: true }).match({ contact_type: contactType })).count ?? 0
  }
}

async function getContactsCountByTypeFromDatabase(DefaultClient) {
  return {
    data: {
      customersCount: (await getContactsCountFromDatabase(DefaultClient, { contactType: 'customer' })).data,
      staffsCount: (await getContactsCountFromDatabase(DefaultClient, { contactType: 'staff' })).data,
      dealersCount: (await getContactsCountFromDatabase(DefaultClient, { contactType: 'dealer' })).data,
    }
  }
}

async function getContactByIdFromDatabase(DefaultClient, parameters) {
  const { id } = parameters

  const res = await DefaultClient.from('contacts').select(`*, full_name, approved_by(id, full_name)`).match({ id }).single()
  res.data = cleanContactInfo(res.data)
  return res
}

function getProductCategoriesFromDatabase(DefaultClient) {
  return DefaultClient.from('item_types').select()
}

function getSalesFromDatabase(DefaultClient, parameters) {
  const { customSelect, pageNumber, itemCount, searchQuery, invoiceId, id } = parameters

  let query = DefaultClient.from('sales')
    .select(customSelect ?? '*')

  if (invoiceId && id) {
    return query.match({ id, invoice_no: invoiceId }).single()
  }

  if (searchQuery && searchQuery.length) {

  }

  query = query
    .range(pageNumber * (itemCount - 1) + (pageNumber > 0 ? 1 : 0), itemCount * (pageNumber + 1) - 1)
    .order('sales_date', { ascending: false })

  return query
}

async function getSalesCountFromDatabase(DefaultClient) {
  return {
    data: (await DefaultClient.from('sales').select('id', { count: 'exact', head: true })).count ?? 0
  }
}

function getSalesItemSelectionsFromDatabase(DefaultClient, parameters) {
  const { id } = parameters

  return DefaultClient.from('selections').select().match({
    sales_id: id,
  })
}

function getSalesByInvoiceAndIdFromDatabase(DefaultClient, parameters) {
  return getSalesFromDatabase(DefaultClient, {
    ...parameters,
    customeSelect: `
      *,
      customer:customer_id (*),
      selections (
        *,
        product:item_id (
          *,
          dealer:dealer_id(
            *
          ),
          category:item_type_id(
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
    `
  })
}

function getInvoiceTypesFromDatabase(DefaultClient) {
  return DefaultClient.from('invoice_types').select()
}

function deleteLocation(DefaultClient, parameters) {
  const { id } = parameters

  return DefaultClient.from('locations')
    .delete({ count: 1 })
    .eq('id', id)
}

function deleteContact(DefaultClient, parameters) {
  const { id, profileUrl } = parameters

  return DefaultClient.from('contacts')
    .delete({ count: 1 })
    .eq('id', id)
    .then(res => {
      if (profileUrl.length == 0) return
      return DefaultClient.storage.from('images').remove(profileUrl)

      return res
    })
}

function deleteContactSelections(DefaultClient, parameters) {
  const { contacts } = parameters

  return DefaultClient.from('contacts')
    .delete()
    .in('id', contacts.map(contact => contact.id))
    .then(res => {

      // Delete all profile pictures
      contacts.forEach(contact => {
        DefaultClient.storage.from('images').remove(contact.profile_url)
      })

      return res
    })
}

function deleteProductCategory(DefaultClient, parameters) {
  const { id } = parameters

  return DefaultClient.from('item_types')
    .delete({ count: 1 })
    .eq('id', id)
}

function deleteProductItemSelectionByIdFromDatabase(DefaultClient, parameters) {
  const { id } = parameters
  return DefaultClient.from('selections').delete().eq('id', id)
}

function deleteProduct(DefaultClient, parameters) {
  const { id, itemImageUrl } = parameters

  return DefaultClient.from('items')
    .delete({ count: 1 })
    .eq('id', id)
    .then(res => {
      if (itemImageUrl.length == 0) return
      DefaultClient.storage.from('images').remove(itemImageUrl)
      return res
    })
}

function deleteSales(DefaultClient, parameters) {
  const { id } = parameters

  return DefaultClient.from('sales')
    .delete({ count: 1 })
    .eq('id', id)
}

function deleteSalesSelections(DefaultClient, parameters) {
  const { sales } = parameters

  return DefaultClient.from('sales')
    .delete()
    .in('id', sales.map(sales => sales.id))
}

function saveLocationToDatabase(DefaultClient, parameters) {
  const { location } = parameters

  return DefaultClient.from('locations').upsert(location, { onConflict: 'id' })
}

function saveContactToDatabase(DefaultClient, parameters) {
  const { contactData } = parameters

  if (contactData.birthdate == '') delete contactData.birthdate
  else contactData.birthdate = new Date(contactData.birthdate)
  contactData.date_open = new Date(contactData.date_open)

  delete contactData.full_name

  if (contactData.approved_by && !contactData.approved_by?.length) {
    delete contactData.approved_by
  }

  return DefaultClient.from('contacts').upsert(contactData, { onConflict: 'id' }).select().single().then(res => {
    console.log(res)
    res.data = cleanContactInfo(res.data)
    return res
  })
}

function saveSalesToDatabase(DefaultClient, parameters) {
  const { sales } = parameters

  // Save the sales to the database
  const clonedSales = structuredClone(sales)

  // Delete all fields not related to the sales schema.
  delete clonedSales.customer
  delete clonedSales.selections
  delete clonedSales.length

  return DefaultClient.from('sales').upsert(clonedSales, { onConflict: 'id' }).select()
    .then(async res => {
      const { data } = res

      const [savedSales] = data
      const toPerform = []

      if (sales.selections) {
        // Delete all selections stored in sales.selections.toDelete
        for (const selection of (sales.selections.toDelete) ?? []) {
          const product = selection.product ?? {}

          product.item_sold = product.default_item_sold - selection.deducted_quantity
          product.item_quantity = product.default_item_quantity + selection.deducted_quantity

          // Delete unrelated fields
          delete product.category
          delete product.dealer
          delete product.itemPriceLevels
          delete product.default_item_quantity
          delete product.default_item_sold

          toPerform.push(
            saveProductToDatabase(DefaultClient, { productData: product }),
            deleteProductItemSelectionByIdFromDatabase(DefaultClient, { id: selection.id })
          )
        }

        // Remove the unnecessary property from the sales.selections
        delete sales.selections.toDelete

        // Save selected items (if any) to the database.
        for (const selection of Object.values(sales.selections)) {
          const toSave = structuredClone(selection)
          const product = toSave.product ?? {}
          toSave.sales_id = savedSales.id

          // @FEATURE: When sale is already paid, make sure that the product quantities are updated.
          // Reset the product quantity and sold stats
          if (savedSales.sales_status == 'paid') {
            product.item_sold += clonedSales.id ? toSave.added_quantity : toSave.quantity
            product.item_quantity -= clonedSales.id ? toSave.added_quantity : toSave.quantity

            if ((toSave.deducted_quantity -= toSave.added_quantity) < 0) {
              toSave.deducted_quantity = 0
            }
          } else if (savedSales.sales_status == 'refunded') {
            product.item_sold -= toSave.quantity
            product.item_quantity = product.default_item_quantity + toSave.quantity
          } else if (savedSales.sales_status == 'return') {
            product.item_sold = product.default_item_sold - toSave.deducted_quantity
            product.item_quantity = product.default_item_quantity + toSave.deducted_quantity

            if ((toSave.added_quantity -= toSave.deducted_quantity) < 0) {
              toSave.added_quantity = 0
            }
          }

          // Delete unrelated fields
          delete product.category
          delete product.dealer
          delete product.itemPriceLevels
          delete product.default_item_quantity
          delete product.default_item_sold

          if (product.id) {
            toPerform.push(saveProductToDatabase(DefaultClient, { productData: product }))
          }

          // Delete unnecessary fields
          delete toSave.product
          delete toSave.item_index
          delete toSave.item

          toPerform.push(DefaultClient.from('selections').upsert(toSave, { onConflict: 'id' }))
        }

      }

      await Promise.all(toPerform)
      return res
    })
    .catch()
}

function saveProductToDatabase(DefaultClient, parameters) {
  const { productData } = parameters

  const clonedProduct = structuredClone(productData ?? {})
  const priceLevels = productData.priceLevels ?? []

  delete clonedProduct.priceLevels

  if (!clonedProduct.date_added) clonedProduct.date_added = new Date()

  return DefaultClient.from('items').upsert(clonedProduct, { onConflict: 'id' })
    .then(async res => {
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
                await DefaultClient.from('items_price_levels').upsert(itemPriceLevel, { onConflict: 'id' })
              })
          )
        }
      }

      await Promise.all(toPerform)

      return res
    })
}

function saveProductCategoryToDatabase(DefaultClient, parameters) {
  const { categoryData } = parameters
  return DefaultClient.from('item_types').upsert(categoryData, { onConflict: 'id' })
}

function getProductByIdAndProductNameFromDatabase(DefaultClient, parameters) {
  const { id, item_name } = parameters

  return DefaultClient.from('items').select(`
    *,
    dealer:dealer_id(*),
    itemPriceLevels:items_price_levels (
      *,
      priceLevel:price_level_id (*)
    )
  `).single().match({ id, item_name })
}

function getProductByBarcodeFromDatabase(DefaultClient, parameters) {
  const { barcode } = parameters

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
  `).single().match({ barcode })
}

function getProductsFromDatabase(DefaultClient, parameters) {
  const { pageNumber, itemCount, searchQuery } = parameters

  let query = DefaultClient.from('items')
    .select(`
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
    .eq('is_variant', false)

  if (searchQuery && searchQuery.length) {
    query = query.or(`item_name.like.%${searchQuery}%, code.like.%${searchQuery}%, barcode.eq.${searchQuery}`)
  }

  query = query.range(pageNumber * (itemCount - 1) + (pageNumber > 0 ? 1 : 0), itemCount * (pageNumber + 1) - 1)
    .order('date_added', { ascending: false })

  return query
}

async function getProductsCountFromDatabase(DefaultClient) {
  return {
    data: (await DefaultClient.from('items').select('id', { count: 'exact', head: true })).count ?? 0
  }
}

async function getCustomers(DefaultClient, parameters) {
  const customers = []

  await getContactsFromDatabase(DefaultClient, { contactType: 'customer', ...parameters })
    .then(res => {
      const { data } = res
      customers.push(...data.map(cleanContactInfo))
    })
    .catch()

  return { data: customers }
}

async function getStaffs(DefaultClient, parameters) {
  const staffs = []

  await getContactsFromDatabase(DefaultClient, { contactType: 'staff', ...parameters })
    .then(res => {
      const { data } = res
      staffs.push(...data.map(cleanContactInfo))
    })
    .catch()

  return { data: staffs }
}

async function getDealers(DefaultClient, parameters) {
  const dealers = []

  await getContactsFromDatabase(DefaultClient, { contactType: 'dealer', ...parameters })
    .then(res => {
      const { data } = res
      dealers.push(...data.map(cleanContactInfo))
    })
    .catch()

  return { data: dealers }
}

async function getContacts(DefaultClient, parameters) {
  const staticContacts = {}

  await getCustomers(DefaultClient, parameters).then(customers => staticContacts.customers = customers?.data ?? [])
  await getStaffs(DefaultClient, parameters).then(staffs => staticContacts.staffs = staffs?.data ?? [])
  await getDealers(DefaultClient, parameters).then(dealers => staticContacts.dealers = dealers?.data ?? [])

  return { data: staticContacts }
}

async function refreshContacts(DefaultClient, parameters) {
  const { contactTypes } = parameters

  const types = new Set(contactTypes)
  const contacts = {}

  if (types.has('customers')) {
    await getCustomers(DefaultClient, parameters).then(customers => {
      contacts.customers = customers.data
    })
      .catch()
  }

  if (types.has('staffs')) {
    await getStaffs(DefaultClient, parameters).then(staffs => {
      contacts.staffs = staffs.data
    })
      .catch()
  }

  if (types.has('dealers')) {
    await getDealers(DefaultClient, parameters).then(dealers => {
      contacts.dealers = dealers.data
    })
      .catch()
  }


  return { data: contacts }
}

const cleanContactInfo = (contact) => {
  const dateOpen = new Date(contact.date_open)
  contact.date_open = `${dateOpen.getFullYear()}-${(dateOpen.getMonth() + 1).toString().padStart(2, '0')}-${dateOpen.getDate()}`

  const birthdate = new Date(contact.birthdate)
  contact.birthdate = `${birthdate.getFullYear()}-${(birthdate.getMonth() + 1).toString().padStart(2, '0')}-${birthdate.getDate()}`

  return contact
}