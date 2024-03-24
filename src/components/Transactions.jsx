
import { RootContext } from '../App'
import { TrashIcon, EyeIcon } from '@heroicons/react/outline'
import { uniqBy } from 'lodash'
import { getFullName, getSalesFromDatabase, pesoFormatter } from '../actions'
import { Link } from 'react-router-dom'
import { useContext, useEffect, useMemo } from 'react'
import Moment from 'moment'

export { Transactions }

function Transactions(props) {
  const rootContext = useContext(RootContext)
  const onClickViewSales = props.onClickViewSales
  const [collectionSales] = props.collectionSalesState
  const refreshCollections = props.refreshCollections

  const [currentPage] = rootContext.currentPageState
  const [itemCount] = rootContext.itemCountState

  useEffect(() => {
    if (itemCount < 10) return
    refreshCollections()
  }, [ currentPage, itemCount ])

  return (
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
            Categories
          </th>
          <th className='text-secondary'>
            Status
          </th>
          <th className='text-secondary'>
            Total Sale
          </th>
          <th colSpan={2} className='text-secondary'>
            
          </th>
        </tr>
      </thead>
      <tbody style={{ fontSize: '0.9rem' }}>
        {
          uniqBy(collectionSales, 'invoice_no').map(sales => {
            const fullName = sales.customer ? getFullName(sales.customer) : 'Unknown'
            const selections = Object.values(sales.selections).filter(selection => selection.product)

            const categories = selections.map(selection => selection.product.category.class)

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
                  <span style={{ fontSize: '0.7rem' }}>{categories.join(', ')}</span>
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
                  <time dateTime={sales.sales_date} className='text-secondary'>
                    {Moment(sales.sales_date).format('LLL')}
                  </time>
                </td>

                <td className='align-middle'>
                  <button className='btn btn-sm btn-outline-secondary' style={{ border: 0 }} onClick={() => onClickViewSales(sales)}>Edit</button>
                </td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
  )
}