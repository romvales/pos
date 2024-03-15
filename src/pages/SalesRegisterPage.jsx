import { createRef, useEffect, useMemo, useRef, useState } from 'react'
import { DefaultLayout } from '../layouts/DefaultLayout'

import {
  CashIcon,
  PencilAltIcon,
  SelectorIcon,
  CalculatorIcon,
  BookmarkIcon,
  XIcon,
} from '@heroicons/react/outline'

import { OrderSummaryItem } from '../components/OrderSummaryItem'
import { NewContactPopup } from '../components/NewContactPopup'
import {
  getContactsFromDatabase,
  getFullName,
  getInvoiceTypesFromDatabase,
  getLocationsFromDatabase,
  getProductsFromDatabase,
  pesoFormatter,
  saveSalesToDatabase
} from '../actions'
import { useLoaderData } from 'react-router-dom'
import { ProductListing } from '../components/ProductListing'
import { ContactSelector } from '../components/ContactSelector'
import { CashPaymentForm } from '../components/CashPaymentForm'

export {
  SalesRegisterPage,
  SalesRegisterPageDataLoader
}

async function SalesRegisterPageDataLoader() {
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

const generateInvoiceNo = () => {
  const a = new Uint32Array(2)
  return crypto.getRandomValues(a).reduce((a, b) => a + b).toString() + a.at(0).toString().slice(0, 5)
}

const defaultSale = {
  customer_id: '',
  sales_date: new Date(),
  sales_status: 'in-progress',
  is_cancelled: false,
  discount_amount: 0,
  tax_amount: 0,
  sub_total: 0,
  total_due: 0,
  amount_paid: 0,
  change_due: 0,
  invoice_no: generateInvoiceNo(),
  payment_method: '',

  //
  selections: {},
  length: 0,
}

function SalesRegisterPage(props) {
  const formRef = createRef()
  const {
    staticProducts,
    staticCustomers,
    staticLocations } = useLoaderData()

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [products, setProducts] = useState(staticProducts)
  const [contacts, setContacts] = useState(staticCustomers)
  const [recalculate, setRecalculate] = useState(false)
  const [sales, setSales] = useState(structuredClone(defaultSale))

  const onSubmit = (ev) => {
    ev.preventDefault()

    sales.customer_id = selectedCustomer.id
    sales.sales_status = 'paid'

    saveSalesToDatabase(sales)
      .then(() => {
        SalesRegisterPageDataLoader().then(({ staticProducts }) => setProducts(staticProducts))
        onDiscard()
      })
      .catch()
  }

  const onSave = () => {
    sales.customer_id = selectedCustomer.id
    saveSalesToDatabase(sales)
      .then(() => { })
      .catch()
  }

  const onDiscard = () => {
    const clonedDefaultSale = structuredClone(defaultSale)

    clonedDefaultSale.invoice_no = generateInvoiceNo()

    setSales(clonedDefaultSale)
    setSelectedCustomer(null)
    formRef.current.reset()
  }

  const recalculateSales = () => {
    const clone = structuredClone(sales)

    clone.customer_id = selectedCustomer?.id,
    clone.sub_total = 0
    clone.discount_amount = 0
    clone.tax_amount = 0
    clone.total_due = 0

    for (const selection of Object.values(sales.selections)) {
      clone.sub_total += selection.price
    }

    clone.total_due = clone.sub_total + clone.tax_amount - clone.discount_amount
    setSales(clone)
  }

  const addProductToSelection = (product) => {
    const clone = structuredClone(sales)
    clone.selections[product.id] = {
      item_index: clone.length,
      product: structuredClone(product),
      item_id: product.id,
      price_level_id: null,
      quantity: 1,
      cost: product.item_cost,
      price: product.item_cost,
    }

    clone.length++
    setSales(clone)
    setRecalculate(!recalculate)
  }

  const deselectProductFromSelection = (id) => {
    const clone = structuredClone(sales)
    delete clone.selections[id]
    clone.length--
    setSales(clone)
    setRecalculate(!recalculate)
  }

  // Sorts the items in the summary
  const sortFn = (a, b) => a.item_index < b.item_index

  const isValid = useMemo(() => {
    let valid = false

    if (sales.payment_method.length && selectedCustomer != null &&
      Object.keys(sales.selections).length && sales.amount_paid >= sales.total_due) valid = true

    return valid
  }, [sales])

  useEffect(() => { recalculateSales() }, [recalculate, selectedCustomer])

  // @PAGE_URL: /
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <div className='row'>
          <section className='col-xl-7 col-md-7'>
            <ProductListing
              deselectProductFromSelection={deselectProductFromSelection}
              sales={sales}
              addProductToSelection={addProductToSelection}
              products={products} />
          </section>

          <section className='col-xl-4 col-md-5'>
            <form ref={formRef} className='row' onSubmit={onSubmit}>
              {
                selectedCustomer ?
                  <section className='d-flex gap-3 py-3 rounded border shadow-sm mb-2 bg-white'>
                    <picture>
                      <img src={`https://placehold.co/64?text=${selectedCustomer.first_name}`} className='rounded-circle' alt={'Customer\'s profile picture'} />
                    </picture>
                    <div className='flex-grow-1'>
                      <ul className='list-unstyled mb-0'>
                        <li>
                          <h4 className='fs-5 fw-bold mb-0'>{getFullName(selectedCustomer)}</h4>
                        </li>
                        <li className='d-flex gap-1'>
                          <span style={{ fontSize: '0.8rem' }} className='text-secondary'>{selectedCustomer.id}</span>
                          <span style={{ fontSize: '0.8rem' }} className='text-secondary'>
                            (Price Level: {selectedCustomer.price_level})
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className='d-grid flex-column gap-1 align-items-center'>
                      <button
                        type='button'
                        className='btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center'
                        data-bs-toggle='modal'
                        data-bs-target='#contactSelection'>
                        <SelectorIcon width={18} />
                        <span className='initialism text-capitalize'>Choose</span>
                      </button>
                      <button
                        type='button'
                        className='btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center'
                        data-bs-toggle='modal'
                        data-bs-target='#addContact'>
                        <PencilAltIcon width={18} />
                        <span className='initialism text-capitalize'>Edit</span>
                      </button>
                    </div>
                  </section>
                  :
                  <section className='d-flex gap-3 py-3 rounded border shadow-sm mb-2 bg-white'>
                    <picture>
                      <img src={'https://placehold.co/64?text=Customer'} className='rounded-circle' alt={'Customer\'s profile picture'} />
                    </picture>
                    <div className='flex-grow-1'>
                      <ul className='list-unstyled mb-0'>
                        <li>
                          <h4 className='fs-6 fw-bold mb-0'>No Customer</h4>
                        </li>
                        <li>
                          <span style={{ fontSize: '0.8rem' }} className='text-secondary'></span>
                        </li>
                      </ul>
                    </div>
                    <div className='d-grid flex-column gap-1 align-items-center'>
                      <button
                        type='button'
                        className='btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center'
                        data-bs-toggle='modal'
                        data-bs-target='#contactSelection'>
                        <SelectorIcon width={18} />
                        <span className='initialism text-capitalize'>Choose</span>
                      </button>
                    </div>
                  </section>
              }

              <div className='shadow-sm rounded py-3 mb-3 border bg-white'>
                <div className='mb-4'>
                  <div className='d-flex mb-1 justify-content-between'>
                    <div>
                      <h3 className='fs-5 m-0 fw-bold mb-1 text-capitalize'>Order Summary</h3>
                      <p style={{ fontSize: '0.8rem' }} className='text-secondary'>Invoice#{sales.invoice_no}</p>
                    </div>
                    <nav className=''>
                      <ul className='d-flex gap-2 list-unstyled p-0'>
                        {
                          isValid ?
                            <li className=''>
                              <button
                                type='button'
                                style={{ border: 0 }}
                                className='btn d-flex p-0 text-secondary flex-column align-items-center'
                                onClick={onSave}>
                                <BookmarkIcon width={18} />
                                <span style={{ fontSize: '0.6rem' }}>Save</span>
                              </button>
                            </li>
                            :
                            <></>
                        }
                        <li className=''>
                          <button type='button' style={{ border: 0 }} className='btn d-flex p-0 text-danger opacity-75 flex-column align-items-center' onClick={onDiscard}>
                            <XIcon width={18} />
                            <span style={{ fontSize: '0.6rem' }}>Discard</span>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>

                  <ul className='d-flex flex-column gap-1 list-unstyled mb-0'>
                    {
                      Object.values(sales.selections).sort(sortFn).map((selection, i) => {
                        return (
                          <OrderSummaryItem
                            key={i}
                            sales={sales}
                            setSales={setSales}
                            productData={selection.product}
                            recalculator={[recalculate, setRecalculate]}
                            deselectProductFromSelection={deselectProductFromSelection}
                            selectedCustomer={selectedCustomer} />
                        )
                      })
                    }
                  </ul>
                </div>

                <div>
                  <dl className='grid'>
                    <div className='d-flex justify-content-between'>
                      <dt className='text-secondary fw-semibold'>
                        Subtotal
                      </dt>
                      <dd>
                        {pesoFormatter.format(sales.sub_total)}
                      </dd>
                    </div>

                    <div className='d-flex justify-content-between'>
                      <dt className='text-secondary fw-semibold'>
                        Tax
                      </dt>
                      <dd>
                        {pesoFormatter.format(sales.tax_amount)}
                      </dd>
                    </div>

                    <div className='d-flex justify-content-between'>
                      <dt className='text-secondary fw-semibold'>
                        Discount
                      </dt>
                      <dd>
                        {pesoFormatter.format(sales.discount_amount)}
                      </dd>
                    </div>

                    <hr className='border-secondary' />

                    <div className='d-flex justify-content-between'>
                      <dt>
                        Total
                      </dt>
                      <dd className='fs-5'>
                        {pesoFormatter.format(sales.total_due)}
                      </dd>
                    </div>
                  </dl>
                </div>


                <fieldset className=''>
                  <label htmlFor='' className='fs-6 fw-semibold mb-3 text-secondary'>Payment Method</label>
                  <div className='row'>
                    <div className='col'>
                      <div className=''>
                        {
                          (() => {
                            const checkboxRef = createRef()

                            const onChange = () => {

                              if (checkboxRef.current.checked) {
                                sales.payment_method = 'cash'
                              } else {
                                sales.payment_method = ''
                              }

                              setSales(structuredClone(sales))
                            }

                            return (
                              <div className='btn-group' role='group' aria-label='Cash payment method'>
                                <input
                                  ref={checkboxRef}
                                  checked={sales.payment_method != ''}
                                  type='checkbox'
                                  className='btn-check'
                                  id='cashPaymentMethod' autoComplete='off' onChange={onChange} />
                                <label className='btn btn-outline-primary px-2' htmlFor='cashPaymentMethod'>
                                  <CashIcon width={20} /><br />
                                  <span className='initialism text-capitalize fw-semibold'>Cash</span>
                                </label>
                              </div>
                            )
                          })()
                        }
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>

              {sales.payment_method == 'cash' ? <CashPaymentForm isValid={isValid} sales={sales} setSales={setSales} /> : <> </>}

              <div className='d-grid p-0'>
                <button
                  type='submit'
                  className='btn btn-primary btn-pill p-3 d-flex justify-content-center align-items-center gap-1'
                  disabled={!isValid}>
                  <span className='fs-5'>Finish Transaction</span>
                </button>
              </div>
            </form>

            {
              selectedCustomer ?
                <NewContactPopup
                  isReadOnlyCustomerType={true}
                  locations={staticLocations}
                  contacts={contacts}
                  updateContacts={setContacts}
                  existingContact={selectedCustomer}
                  updateExistingContact={setSelectedCustomer}></NewContactPopup>
                :
                <></>
            }
            <ContactSelector
              contacts={contacts}
              updateSelection={setSelectedCustomer}></ContactSelector>

          </section>
        </div>
      </div>
    </DefaultLayout>
  )
}

