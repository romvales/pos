
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
  getProductByBarcodeFromDatabase,
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

  // Counters
  getSalesCountFromDatabase,
  getContactsCountFromDatabase,
  getProductsCountFromDatabase,

  deleteLocation,
  deleteContact,
  deleteProductCategory,
  deleteProductItemSelectionByIdFromDatabase,
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
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getLocationsFromDatabase',
    },
  })
}

async function getContactsFromDatabase(contactType, pageNumber = 0, itemCount = 10) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getContactsFromDatabase',
      parameters: {
        contactType,
        pageNumber,
        itemCount,
      },
    },
  })
}

async function getContactsCountFromDatabase(contactType) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getContactsCountFromDatabase',
      parameters: {
        contactType,
      },
    },
  })
}

async function getContactByIdFromDatabase(id) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getContactByIdFromDatabase',
      parameters: {
        id
      },
    },
  })
}

async function getProductCategoriesFromDatabase() {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getProductCategoriesFromDatabase',
      parameters: {},
    },
  })
}

async function getSalesFromDatabase(customSelect, pageNumber = 0, itemCount = 16) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getSalesFromDatabase',
      parameters: {
        customSelect,
        pageNumber,
        itemCount,
      },
    },
  })
}

async function getSalesCountFromDatabase() {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getSalesCountFromDatabase',
      parameters: {}
    },
  })
}

async function getSalesItemSelectionsFromDatabase(salesData) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getSalesItemSelectionsFromDatabase',
      parameters: {
        id: salesData.id,
      }
    },
  })
}

async function getInvoiceTypesFromDatabase() {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getInvoiceTypesFromDatabase',
      parameters: {},
    },
  })
}

async function deleteLocation(location) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'deleteLocation',
      parameters: {
        id: location.id,
      },
    },
  })
}

async function deleteContact(contactData) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'deleteContact',
      parameters: {
        id: contactData.id,
        profileUrl: contactData.profile_url,
      },
    },
  })
}

async function deleteProductCategory(categoryData) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'deleteProductCategory',
      parameters: {
        id: categoryData.id,
      },
    },
  })
}

async function deleteProductItemSelectionByIdFromDatabase(id) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'deleteProductItemSelectionByIdFromDatabase',
      parameters: {
        id,
      }
    },
  })
}

async function deleteProduct(product) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'deleteProduct',
      parameters: {
        id: product.id,
        itemImageUrl: product.item_image_url,
      },
    },
  })
}

async function deleteSales(salesData) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'deleteSales',
      parameters: {
        id: salesData.id,
      },
    },
  })
}

async function saveLocationToDatabase(location) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'saveLocationToDatabase',
      parameters: {
        location,
      }
    },
  })
}

async function saveContactToDatabase(contactData) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'saveContactToDatabase',
      parameters: {
        contactData,
      },
    },
  })
}

async function saveSalesToDatabase(sales) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'saveSalesToDatabase',
      parameters: {
        sales,
      },
    }, 
  })
}

async function saveProductToDatabase(productData) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'saveProductToDatabase',
      parameters: {
        productData,
      },
    },
  })
}

async function saveProductCategoryToDatabase(categoryData) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'saveProductCategoryToDatabase',
      parameters: {
        categoryData, 
      },
    },
  })
}

function getProductByIdAndProductNameFromDatabase(id, item_name) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getProductByIdAndProductNameFromDatabase',
      parameters: {
        id, item_name,
      },
    },
  })
}

function getProductByBarcodeFromDatabase(barcode) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getProductByBarcodeFromDatabase',
      parameters: {
        barcode,
      },
    },
  })
}

async function getProductsFromDatabase(pageNumber = 0, itemCount = 10) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getProductsFromDatabase',
      parameters: {
        pageNumber,
        itemCount,
      }
    },
  })
}

async function getProductsCountFromDatabase() {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getProductsCountFromDatabase',
      parameters: {},
    },
  })
}

async function getCustomers(pageNumber = 0, itemCount = 10) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getCustomers',
      parameters: {
        pageNumber,
        itemCount,
      },
    },
  })
}

async function getStaffs(pageNumber = 0, itemCount = 10) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getStaffs',
      parameters: {
        pageNumber,
        itemCount,
      },
    },
  })
}

async function getContacts(staticContacts, pageNumber = 0, itemCount = 10) {
  const res = await DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getContacts',
      parameters: {
        pageNumber,
        itemCount,
      },
    },
  })

  const { data } = res

  staticContacts.customers = data.customers
  staticContacts.staffs = data.staffs
  staticContacts.dealers = data.dealers

  return staticContacts
}

async function getDealers(pageNumber = 0, itemCount = 0) {
  return DefaultClient.functions.invoke('despos_service', {
    body: {
      funcName: 'getDealers',
      parameters: {
        pageNumber,
        itemCount,
      },
    },
  })
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

const cleanContactInfo = (contact) => {
  const dateOpen = new Date(contact.date_open)
  contact.date_open = `${dateOpen.getFullYear()}-${(dateOpen.getMonth() + 1).toString().padStart(2, '0')}-${dateOpen.getDate()}`

  const birthdate = new Date(contact.birthdate)
  contact.birthdate = `${birthdate.getFullYear()}-${(birthdate.getMonth() + 1).toString().padStart(2, '0')}-${birthdate.getDate()}`

  return contact
}