
import { TrashIcon } from '@heroicons/react/outline'
import { getFullName } from '../actions'
import { Link } from 'react-router-dom'

export { ContactTableListing }

function ContactTableListing(props) {
  const locations = props.locations ?? []
  const contacts = props.contacts
  const type = props.type
  const searchQuery = props.searchQuery
  const onDeleteContact = props.onDeleteContact
  const selectedContacts = contacts[type]
    .filter(contact => new RegExp(searchQuery).test(getFullName(contact))) // Filters the contacts by search query
 
  return (  
    <>
      <table className='table table-sm'>
        <thead>
          <tr>
            <th className='text-secondary'>
              <div className='form-check'>
                <input className='form-check-input' type='checkbox' value='' id='flexCheckDefault' />
              </div>
            </th>
            <th className='text-secondary'>
              ID
            </th>
            <th className='text-secondary'>
              Full Name
            </th>
            <th className='text-secondary'>
              Stores
            </th>
            <th className="text-secondary">
              Date Added
            </th>
            <th className='text-secondary'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody style={{ fontSize: '0.95rem' }}>
          {
            selectedContacts.map((contact, i) => {
              const fullName = getFullName(contact)
              const area = locations.find(location => location.id == contact.location_id) ?? { location_name: 'Unknown' }

              return (
                <tr key={i}>
                  <td className='align-middle'>
                    <div className='form-check mt-1'>
                      <input className='form-check-input' type='checkbox' id='flexCheckDefault' />
                    </div>
                  </td>
                  <td className='align-middle'>
                    {contact.id}
                  </td>
                  <td className='align-middle'>
                    <Link style={{ textDecoration: 'none' }} className='fw-semibold' to={{ pathname: `/contacts/${btoa(contact.id)}` }}>
                      {fullName}
                    </Link>
                  </td>
                  <td className='align-middle'>
                    {area.location_name}
                  </td>
                  <td className='align-middle'>
                    {new Date(contact.date_added).toLocaleString(navigator.language, { year: 'numeric', month: 'long', day: '2-digit' })}
                  </td>
                  <td>
                    <nav>
                      <div>
                        <button className='btn border-0' onClick={() => onDeleteContact(contact, type)}>
                          <TrashIcon width={20} />
                        </button>
                      </div>
                    </nav>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
        <tfoot></tfoot>
      </table>
    </>
  )
}