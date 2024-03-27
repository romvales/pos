
import { RootContext } from '../App'
import { EyeIcon, PencilAltIcon, TrashIcon } from '@heroicons/react/outline'
import { getFullName } from '../actions'
import { Link } from 'react-router-dom'
import { createRef, useMemo, useState } from 'react'
import Moment from 'moment-timezone'
import { CurrencyFormatter } from '../locales/currencies'

export { Transactions }

function Transactions(props) {
  const searchRef = createRef()
  const onClickViewSales = props.onClickViewSales
  
  const [collectionSales] = props.collectionSalesState
  const [checkedSales, setCheckedSales] = useState({})

  const [currentPage] = props.currentPageState
  const [itemCount] = props.itemCountState

  const onChangeSelectAll = (ev) => {
    if (!ev.target.checked) {
      setCheckedSales({})
      return
    }

    const clonedCollectionSales = structuredClone(collectionSales)
    const clonedCheckedSales = structuredClone(checkedSales)
    clonedCollectionSales.forEach(sales => onChangeCheck(ev, sales, clonedCheckedSales))
    setCheckedSales(clonedCheckedSales)
  }

  const onDeleteSelections = () => {
    const cloned = structuredClone(checkedSales)

    props.onDeleteSelections(cloned, currentPage, itemCount).then(() => {
      // Clear out the checkedSales to hide the selection tools
      setCheckedSales({})
    })
  }

  const onChangeCheck = (ev, sales, _clonedCheckedSales) => {
    const isChecked = ev.target.checked
    const clonedCheckedSales = _clonedCheckedSales ?? structuredClone(checkedSales)

    if (isChecked) {
      clonedCheckedSales[sales.id] = sales
    } else {
      delete clonedCheckedSales[sales.id]
    }

    if (_clonedCheckedSales) return
    setCheckedSales(clonedCheckedSales)
  }

  const hasItems = useMemo(() => Object.values(checkedSales).length, [ checkedSales ])

  return (
    <div className='border rounded p-2'>
      <nav className='toolbar'>
        <div className='toolbar-wrapper p-2'>
          <ul className='d-flex align-items-center list-unstyled p-0 m-0 gap-2'>
            <li className=''>
              <Link to={{ pathname: '/' }} class='btn btn-sm btn-outline-secondary text-capitalize'>
                New Sales
              </Link>
            </li>

            <li className='flex-grow-1'></li>

            {
              hasItems ?
                <>
                  <li>
                    <span className='d-inline-block text-secondary' style={{ fontSize: '0.9rem' }}>Selection tools:</span>
                  </li>
                  <li>
                    <button className='btn btn-sm text-danger p-1 d-flex gap-1 align-items-center' onClick={() => onDeleteSelections()}>
                      <TrashIcon width={16} /> Delete
                    </button>
                  </li>
                </>
                :
                <></>
            }
          </ul>
        </div>
      </nav>

      <table className='table table-sm'>
        <thead>
          <tr>
            <th className='text-secondary'>
              <div className='form-check'>
                <input ref={searchRef} className='form-check-input' type='checkbox' value='' id='flexCheckDefault' onChange={onChangeSelectAll} />
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
            collectionSales.map((sales, i) => {
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

              const isChecked = checkedSales[sales.id]?.id == sales.id

              return (
                <tr key={i}>
                  <td className='align-middle'>
                    <div className='form-check mt-1'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        checked={isChecked}
                        id='flexCheckDefault'
                        onChange={ev => onChangeCheck(ev, sales)} />
                    </div>
                  </td>

                  <td className='align-middle'>
                    <div className='d-flex flex-column align-items-start'>
                      <span title={`Invoice#${sales.invoice_no}`} style={{ fontSize: '0.8rem', fontFamily: 'Consolas' }} className='text-secondary'>
                        #{sales.invoice_no.toString().slice(0, 10)}...
                      </span>
                      <Link
                        style={{ border: 0, fontSize: '0.7rem' }}
                        className='btn p-0 text-primary d-flex gap-1 align-items-center'
                        to={{ pathname: `/sales/i/${sales.invoice_no}.${sales.id}` }}>
                        <EyeIcon width={10} /> View
                      </Link>
                    </div>
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
                    <button
                      className='btn btn-sm btn-outline-secondary d-flex align-items-center'
                      style={{ border: 0, gap: '0.151rem' }}
                      onClick={() => onClickViewSales(sales)}>
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
    </div>
  )
}