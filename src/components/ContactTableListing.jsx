

import { getFullName } from '../actions'
import { Link } from 'react-router-dom'
import { Paginator } from './Paginator'
import Moment from 'moment-timezone'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { TrashIcon } from '@heroicons/react/outline'

export { ContactTableListing }

function ContactTableListing(props) {
  const locations = props.locations ?? []
  const contacts = props.contacts
  const type = props.type
  const totalContacts = props.totalContacts
  const selectedContacts = contacts[type]
  const onPaginate = props.onPaginate
  const onDeleteSelections = props.onDeleteSelections
  const [currentPage, setCurrentPage] = useState(0)
  const [itemCount, setItemCount] = useState(10)
  const [checkedContacts, setCheckedContacts] = useState({})

  const onCheckAllItems = (ev) => {
    const clonedCheckedContacts = structuredClone(checkedContacts)

    const isChecked = ev.target.checked

    if (isChecked) {
      for (const contact of selectedContacts) {
        onCheckContact(null, clonedCheckedContacts, contact)
      }

      setCheckedContacts(clonedCheckedContacts)
    } else {
      setCheckedContacts({})
    }

  }

  const onCheckContact = (ev, _checkedContacts, contact) => {
    if (_checkedContacts) {
      _checkedContacts[contact.id] = contact
      return
    }

    const isChecked = ev.target.checked

    const clonedCheckedContacts = structuredClone(checkedContacts)

    if (isChecked) {
      clonedCheckedContacts[contact.id] = contact
    } else {
      delete clonedCheckedContacts[contact.id]
    }

    setCheckedContacts(clonedCheckedContacts)
  }

  const hasItems = useMemo(() => Object.values(checkedContacts).length, [checkedContacts])

  return (
    <div className='border rounded p-2'>
      <nav className='toolbar'>
        <div className='toolbar-wrapper p-2'>
          <ul className='d-flex align-items-center list-unstyled p-0 m-0 gap-2'>
            <li className=''>
              
            </li>

            <li className='flex-grow-1'></li>

            {
              hasItems ?
                <>
                  <li>
                    <span className='d-inline-block text-secondary' style={{ fontSize: '0.9rem' }}>Selection tools:</span>
                  </li>
                  <li>
                    <button className='btn btn-sm text-danger p-1 d-flex gap-1 align-items-center' onClick={() => onDeleteSelections(checkedContacts, currentPage, itemCount)}>
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
                <input className='form-check-input' type='checkbox' value='' id='flexCheckDefault' onChange={onCheckAllItems} />
              </div>
            </th>
            <th className='text-secondary'>
              ID
            </th>
            <th className='text-secondary'>
              Full Name
            </th>
            <th className='text-secondary'>
              Store
            </th>
            <th className="text-secondary">
              Date Added
            </th>
          </tr>
        </thead>
        <tbody style={{ fontSize: '0.95rem' }}>
          {
            selectedContacts.map((contact, i) => {
              const fullName = getFullName(contact)
              const area = locations.find(location => location.id == contact.location_id) ?? { location_name: 'Unknown' }

              const ProfileRef = (
                <div className='d-flex align-items-center gap-1'>
                  <picture>
                    <img src={`https://placehold.co/28?text=${fullName.split(' ').at(0)}`} className='rounded-circle' />
                  </picture>
                  <span className={`${contact ? '' : 'text-secondary'}`}>
                    {fullName}
                  </span>
                </div>
              )

              const isChecked = checkedContacts[contact.id] != undefined

              return (
                <tr key={i}>
                  <td className='align-middle'>
                    <div className='form-check mt-1'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id='flexCheckDefault'
                        checked={isChecked}
                        onChange={ev => onCheckContact(ev, null, contact)} />
                    </div>
                  </td>

                  <td className='align-middle'>
                    {contact.id}
                  </td>
                  <td className='align-middle'>
                    <Link style={{ textDecoration: 'none' }} to={{ pathname: `/contacts/${btoa(contact.id)}` }}>
                      {ProfileRef}
                    </Link>
                  </td>
                  <td className='align-middle'>
                    {area.location_name}
                  </td>
                  <td className='align-middle'>
                    <span className='text-secondary'>{Moment(contact.date_added).format('LLL')}</span>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      <nav className='mb-4'>
        <Paginator 
          className='pagination-sm'
          totalCount={totalContacts}
          defaultItemCount={itemCount}
          onPaginate={onPaginate}
          currentPageState={[currentPage, setCurrentPage]}
          itemCountState={[itemCount, setItemCount]} />
      </nav>
    </div>
  )
}