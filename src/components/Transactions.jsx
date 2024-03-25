
import { RootContext } from '../App'
import { PencilAltIcon } from '@heroicons/react/outline'
import { uniqBy } from 'lodash'
import { getFullName } from '../actions'
import { Link } from 'react-router-dom'
import { createRef, useContext, useEffect } from 'react'
import Moment from 'moment-timezone'
import { CurrencyFormatter } from '../locales/currencies'

export { Transactions }

function Transactions(props) {
  const searchRef = createRef()
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
              <input ref={searchRef} className='form-check-input' type='checkbox' value='' id='flexCheckDefault' />
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
            Gross Sales
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
                <span className={`${sales.customer ? '' : 'text-secondary'}`}>
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

                <td>
                  <span style={{ fontSize: '0.7rem' }}>{categories.join(', ')}</span>
                </td>

                <td className='align-middle'>
                  <div className='d-flex flex-column'>
                    <span>
                      {CurrencyFormatter.format(sales.sub_total)}
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
                    {Moment(sales.sales_date).tz('Asia/Manila').format('LLL')}
                  </time>
                </td>

                <td className='align-middle'>
                  <button className='btn btn-sm btn-outline-secondary d-flex align-items-center' style={{ border: 0, gap: '0.151rem' }} onClick={() => onClickViewSales(sales)}>
                    <PencilAltIcon width={16} />
                    Edit
                  </button>
                </td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
  )
}