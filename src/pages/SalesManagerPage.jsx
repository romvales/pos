import { Link, useLoaderData } from 'react-router-dom'
import { useEffect } from 'react'
import { deleteSales, getFullName, getSalesCountFromDatabase, pesoFormatter } from '../actions'
import { TrashIcon, EyeIcon } from '@heroicons/react/outline'
import { DefaultLayout } from '../layouts/DefaultLayout'
import { uniqBy } from 'lodash'
import { useState } from 'react'
import { InvoiceForm, defaultSale } from '../components/InvoiceForm'
import { SalesManagerPageDataLoader } from './loaders'
import { Paginator } from '../components/Paginator'

export {
  SalesManagerPage,
}

const salesCount = await getSalesCountFromDatabase()

function SalesManagerPage(props) {
  const { staticSales } = useLoaderData()

  const [collectionSales, setCollectionSales] = useState(staticSales)
  const [selectedSales, setSelectedSales] = useState(structuredClone(defaultSale))
  const [selectedCustomer, setSelectedCustomer] = useState()
  const [searchQuery, setSearchQuery] = useState('')
  const [recalculate, setRecalculate] = useState()

  // @FEATURE: Deletes a sale from the database
  const onDeleteTransaction = (sale) => {
    deleteSales(sale)
      .then(
        SalesManagerPageDataLoader()
          .then(({ staticSales }) => {
            cleanUpCollection(staticSales)
          })
      )
  }

  // @FEATURE: Change the selected sales to display in the invoice form
  const onClickViewSales = (sales) => {
    setSelectedSales(sales)
    setSelectedCustomer(sales.customer)
  }

  const onSubmitSuccess = () => {
    SalesManagerPageDataLoader()
      .then(({ staticSales }) => {
        cleanUpCollection(staticSales)
      })
  }

  const onSaveSuccess = () => {
    SalesManagerPageDataLoader()
      .then(({ staticSales }) => {
        cleanUpCollection(staticSales)
      })
  }

  const filterFunc = (sales) => {
    const patt = new RegExp(searchQuery)
    return patt.test(sales.invoice_no) || (sales.customer && patt.test(getFullName(sales.customer)))
  }

  const cleanUpCollection = (collections) => {
    const cleanedCollection = structuredClone(collections).map(sales => {
      const selections = {

        // @NOTE: Added so that we could delete selections.
        toDelete: [],
      }

      // @NOTE: If selections is already transformed, don't try to retransform the sales' selections
      if (!(sales.selections instanceof Array)) {
        return sales
      }

      for (const selection of sales.selections) {
        const product = selection.product ?? {}
        product.default_item_quantity = product.item_quantity
        product.item_quantity += selection.quantity
        selections[selection.product?.id] = selection
      }

      sales.selections = selections
      return sales
    })

    setCollectionSales(cleanedCollection)
  }

  useEffect(() => {
    cleanUpCollection(collectionSales)
  }, [])

  // @PAGE_URL: /sales
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <div className='row gap-3'>
          <section className='col-xl-4 col-md-4'>
            <InvoiceForm
              persistPriceLevel={true}
              selectedCustomerState={[selectedCustomer, setSelectedCustomer]}
              salesState={[selectedSales, setSelectedSales]}
              originalState={structuredClone(collectionSales.find(sales => sales.invoice_no == selectedSales.invoice_no))}
              recalculator={[recalculate, setRecalculate]}
              onSubmitSuccess={onSubmitSuccess}
              onSaveSuccess={onSaveSuccess}
              actionType={'custom'} />

          </section>
          <section className='col-xl-7 col-md-7'>
            <h1 className='fs-3 fw-semibold mb-4'>Recent transactions</h1>

            <nav className='mb-3 row'>
              <form className='col'>
                <input value={searchQuery} className='form-control' placeholder='Search for a transaction...' onChange={ev => setSearchQuery(ev.target.value)} />
              </form>
              <div className='col-auto'>
                <Paginator totalCount={10} defaultItemCount={10}></Paginator>
              </div>
            </nav>

            <table className='table table-sm'>
              <thead>
                <tr>
                  <th className='text-secondary'>
                    <div className='form-check'>
                      <input className='form-check-input' type='checkbox' value='' id='flexCheckDefault' />
                    </div>
                  </th>
                  <th className='text-secondary'>
                    Invoice No.
                  </th>
                  <th className='text-secondary'>
                    Customer
                  </th>
                  <th className='text-secondary'>
                    Date Added
                  </th>
                  <th className='text-secondary'>
                    Status
                  </th>
                  <th className='text-secondary'>
                    Total Sale
                  </th>
                  <th>
                    <span className='d-none'>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                {
                  uniqBy(collectionSales.filter(filterFunc), 'invoice_no').map(sales => {
                    const fullName = sales.customer ? getFullName(sales.customer) : 'Unknown'

                    const selections = Object.values(sales.selections).filter(selection => selection.product)

                    const ProfileRef = (
                      <div className='d-flex align-items-center gap-1'>
                        <picture>
                          <img src={`https://placehold.co/32?text=${fullName.split(' ').at(0)}`} className='rounded-circle' />
                        </picture>
                        <span className={`fw-semibold ${sales.customer ? '' : 'text-secondary'}`}>
                          {fullName}
                        </span>
                      </div>
                    )

                    return (
                      <tr key={sales.invoice_no}>
                        <td className='align-middle'>
                          <div className='form-check mt-1'>
                            <input className='form-check-input' type='checkbox' value='' id='flexCheckDefault' />
                          </div>
                        </td>
                        <td className='align-middle'>
                          <span title={`Invoice#${sales.invoice_no}`} style={{ fontSize: '0.8rem', fontFamily: 'Consolas' }} className='text-secondary'>
                            #{sales.invoice_no.toString().slice(0, 10)}...
                          </span>
                        </td>
                        <td className='align-middle'>
                          {
                            sales.customer ?
                              <Link style={{ textDecoration: 'none' }} className='d-flex align-items-center gap-1' to={{ pathname: `/contacts/${btoa(sales.customer.id)}` }}>
                                {ProfileRef}
                              </Link>
                              :
                              ProfileRef
                          }
                        </td>
                        <td className='align-middle'>
                          <time dateTime={sales.sales_date}>
                            {new Date(sales.sales_date).toLocaleDateString('en', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                          </time>
                        </td>
                        <td className='align-middle'>
                          {
                            (() => {
                              switch (sales.sales_status) {
                                case 'in-progress':
                                  return <span className='badge text-bg-secondary bg-opacity-75 p-2 text-uppercase'>PENDING</span>
                                case 'refunded':
                                  return <span className='badge text-bg-danger bg-opacity-75 p-2'>REFUND</span>
                                case 'paid':
                                  return <span className='badge text-bg-success bg-opacity-75 p-2 text-uppercase'>PAID</span>
                                case 'return':
                                  return <span className='badge text-bg-secondary bg-opacity-75 p-2 text-uppercase'>RETURN</span>
                              }
                            })()
                          }
                        </td>
                        <td className='align-middle'>
                          <div className='d-flex flex-column'>
                            <span>
                              {pesoFormatter.format(sales.sub_total)}
                            </span>
                            <span style={{ fontSize: '0.6rem' }} className='text-secondary'>
                              {
                                selections?.length == 1 ?
                                  <>
                                    {(selections?.at(0).product?.item_name?.slice(0, 13) ?? 'Unknown') + '...'}
                                  </>
                                  :
                                  <>{selections?.length} products</>
                              }
                            </span>
                          </div>
                        </td>
                        <td className='align-middle'>
                          <div className='d-flex gap-1'>
                            <span className='d-inline-block' tabIndex='0' data-toggle='tooltip' title='View Sales'>
                              <button type={'button'} style={{ border: 0 }} className='btn p-0 text-primary' onClick={() => onClickViewSales(sales)}>
                                <EyeIcon width={18} />
                              </button>
                            </span>
                            <button type={'button'} style={{ border: 0 }} className='btn p-0 text-secondary' onClick={() => onDeleteTransaction(sales)}>
                              <TrashIcon width={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </DefaultLayout>
  )
}