import { Link, useLoaderData } from 'react-router-dom'
import { deleteSales, getFullName, getSalesFromDatabase, pesoFormatter } from '../actions'
import { PencilAltIcon, TrashIcon } from '@heroicons/react/outline'
import { DefaultLayout } from '../layouts/DefaultLayout'
import { capitalize } from 'lodash'
import { useState } from 'react'

export {
  SalesManagerPage,
  SalesManagerPageDataLoader
}

async function SalesManagerPageDataLoader() {
  const staticSales = []

  await getSalesFromDatabase(`
    *,
    customer:customer_id ( id, contact_type, first_name, last_name, middle_initial ),
    selections (
      *,
      item:item_id (*)
    )
  `)
    .then(res => {
      const { data } = res

      staticSales.push(...data)
    })

  return {
    staticSales,
  }
}

function SalesManagerPage(props) {
  const { staticSales } = useLoaderData()

  const [sales, setSales] = useState(staticSales)

  const onDeleteTransaction = (sale) => {
    deleteSales(sale)
      .then(
        SalesManagerPageDataLoader()
          .then(({ staticSales }) => {
            setSales(staticSales)
          })
      )
  }

  // @PAGE_URL: /sales
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <div className='row'>
          <section className='col-xl-7 col-md-7'>
            <h1 className='fs-3 fw-semibold mb-4'>Recent transactions</h1>

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
                  sales.map(sale => {
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
                            {new Date(sale.sales_date).toLocaleDateString('en', { month: '2-digit', day: '2-digit', year: 'numeric', hour12: true, hour: '2-digit', minute: '2-digit' })}
                          </time>
                        </td>
                        <td className='align-middle'>
                          {
                            (() => {
                              const status = capitalize(sale.sales_status)

                              switch (sale.sales_status) {
                              case 'in-progress':
                                return <span className='badge text-bg-secondary bg-opacity-75 p-2 text-uppercase'>Pending</span>
                              case 'refund':
                                return <span className='badge text-bg-danger bg-opacity-75 p-2'>{status}</span>
                              case 'paid':
                                return <span className='badge text-bg-success bg-opacity-75 p-2 text-uppercase'>{status}</span>
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
                                    {sale.selections.at(0).item.item_name.slice(0, 13) + '...'}
                                  </>
                                  :
                                  <>{sale.selections.length} items</>
                              }
                            </span>
                          </div>
                        </td>
                        <td className='align-middle'>
                          <div className='d-flex gap-1'>
                            <button type={'button'} style={{ border: 0 }} className='btn p-0 text-secondary'>
                              <PencilAltIcon width={18} />
                            </button>
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