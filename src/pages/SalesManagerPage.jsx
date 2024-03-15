import { Link, useLoaderData } from 'react-router-dom'
import { useEffect } from 'react'
import { deleteSales, getFullName, getSalesFromDatabase, pesoFormatter, saveSalesToDatabase } from '../actions'
import { TrashIcon, ReceiptRefundIcon, CashIcon } from '@heroicons/react/outline'
import { DefaultLayout } from '../layouts/DefaultLayout'
import { capitalize, uniqBy } from 'lodash'
import { useState } from 'react'

export {
  SalesManagerPage,
  SalesManagerPageDataLoader
}

// @DATALOADER: staticSales
async function SalesManagerPageDataLoader() {
  const staticSales = []

  // Explanation: Gets all sales from the database along with other related data (sales, order summary items, customer)
  await getSalesFromDatabase(`
    *,
    customer:customer_id ( id, contact_type, first_name, last_name, middle_initial ),
    selections (
      *,
      product:item_id (*)
    )
  `)
    .then(res => {
      const { data } = res

      staticSales.push(...(data ?? []))
    })

  return {
    staticSales,
  }
}

function SalesManagerPage(props) {
  const { staticSales } = useLoaderData()

  const [sales, setSales] = useState(staticSales)
  const [searchQuery, setSearchQuery] = useState('')

  // @FEATURE: Deletes a sale from the database
  const onDeleteTransaction = (sale) => {
    deleteSales(sale)
      .then(
        SalesManagerPageDataLoader()
          .then(({ staticSales }) => {
            setSales(staticSales)
          })
      )
  }

  // @FEATURE: Change the status of a sale to PAID
  const onClickPaid = (sale) => {
    const cloneSale = structuredClone(sale)

    cloneSale.sales_status = 'paid'

    saveSalesToDatabase(cloneSale)
      .then(async () => {
        const { staticSales } = await SalesManagerPageDataLoader()
        setSales(staticSales)
      })
  }

  // @FEATURE: Change the status of a sale to REFUNDED
  const onClickRefund = (sale) => {
    const cloneSale = structuredClone(sale)
    
    cloneSale.sales_status = 'refunded'

    saveSalesToDatabase(cloneSale)
      .then(async () => {
        const { staticSales } = await SalesManagerPageDataLoader()
        setSales(staticSales)
      })
  }

  const filterFunc = (sale) => {
    const patt = new RegExp(searchQuery)

    return patt.test(sale.invoice_no) || (sale.customer && patt.test(getFullName(sale.customer)))
  }

  // @PAGE_URL: /sales
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <div className='row'>
          <section className='col-xl-7 col-md-7'>
            <h1 className='fs-3 fw-semibold mb-4'>Recent transactions</h1>

            <nav className='mb-3 row'>
              <form>
                <input value={searchQuery} className='form-control' placeholder='Search for a transaction...' onChange={ev => setSearchQuery(ev.target.value)} />
              </form>
            </nav>

            <table className='table table-sm'>
              <thead>
                <tr>
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
                  uniqBy(sales.filter(filterFunc), 'invoice_no').map(sale => {
                    const fullName = sale.customer ? getFullName(sale.customer) : 'Unknown'

                    const ProfileRef = (
                      <div className='d-flex align-items-center gap-1'>
                        <picture>
                          <img src={`https://placehold.co/32?text=${fullName.split(' ').at(0)}`} className='rounded-circle' />
                        </picture>
                        <span className={`fw-semibold ${sale.customer ? '' : 'text-secondary'}`}>
                          {fullName}
                        </span>
                      </div>
                    )

                    return (
                      <tr key={sale.invoice_no}>
                        <td className='align-middle'>
                          <span title={`Invoice#${sale.invoice_no}`} style={{ fontSize: '0.8rem', fontFamily: 'Consolas' }} className='text-secondary'>
                            #{sale.invoice_no.toString().slice(0, 10)}...
                          </span>
                        </td>
                        <td className='align-middle'>
                          {
                            sale.customer ?
                              <Link style={{ textDecoration: 'none' }} className='d-flex align-items-center gap-1' to={{ pathname: `/contacts/${btoa(sale.customer.id)}` }}>
                                {ProfileRef}
                              </Link>
                              :
                              ProfileRef  
                          }
                        </td>
                        <td className='align-middle'>
                          <time dateTime={sale.sales_date}>
                            {new Date(sale.sales_date).toLocaleDateString('en', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                          </time>
                        </td>
                        <td className='align-middle'>
                          {
                            (() => {
                              const status = capitalize(sale.sales_status)

                              switch (sale.sales_status) {
                                case 'in-progress':
                                  return <span className='badge text-bg-secondary bg-opacity-75 p-2 text-uppercase'>PENDING</span>
                                case 'refunded':
                                  return <span className='badge text-bg-danger bg-opacity-75 p-2'>REFUND</span>
                                case 'paid':
                                  return <span className='badge text-bg-success bg-opacity-75 p-2 text-uppercase'>PAID</span>
                              }
                            })()
                          }
                        </td>
                        <td className='align-middle'>
                          <div className='d-flex flex-column'>
                            <span>
                              {pesoFormatter.format(sale.sub_total)}
                            </span>
                            <span style={{ fontSize: '0.6rem' }} className='text-secondary'>
                              {
                                sale.selections.length == 1 ?
                                  <>
                                    {sale.selections.at(0).product?.item_name.slice(0, 13) + '...'}
                                  </>
                                  :
                                  <>{sale.selections.length} items</>
                              }
                            </span>
                          </div>
                        </td>
                        <td className='align-middle'>
                          <div className='d-flex gap-1'>
                            <span className='d-inline-block' tabIndex='0' data-toggle='tooltip' title='Paid'>
                              <button type={'button'} style={{ border: 0 }} className='btn p-0 text-secondary' onClick={() => onClickPaid(sale)}>
                                <CashIcon width={18} />
                              </button>
                            </span>
                            <span className='d-inline-block' tabIndex='0' data-toggle='tooltip' title={`Refund ${sale.invoice_no}`}>
                              <button type={'button'} style={{ border: 0 }} className='btn p-0 text-secondary' onClick={() => onClickRefund(sale)}>
                                <ReceiptRefundIcon width={18} />
                              </button>
                            </span>
                            <button type={'button'} style={{ border: 0 }} className='btn p-0 text-secondary' onClick={() => onDeleteTransaction(sale)}>
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
          <section className='col-xl-4 col-md-5'>

          </section>
        </div>
      </div>
    </DefaultLayout>
  )
}