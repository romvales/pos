import { capitalize, debounce } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { getContactsCountFromDatabase, getContactsFromDatabase, getFullName } from '../actions'
import { RootContext } from '../App'
import { SelectorIcon } from '@heroicons/react/outline'

export { ContactSelector }

function ContactSelector(props) {
  
  const rootContext = useContext(RootContext)
  const [contacts, setContacts] = props.contactsState
  const updateSelection = props.updateSelection
  const titleHeader = props.titleHeader ?? ''
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    getContactsFromDatabase(null, 0, 12, searchQuery)
      .then(res => {
        const { data } = res
        setContacts(data ?? [])
      })
  }, [ searchQuery ])

  const onChange = debounce(ev => {
    const searchQuery = ev.target.value
    setSearchQuery(searchQuery)
  }, 800)

  return (
    <div className='modal fade' tabIndex='-1' id='contactSelection' aria-labelledby='contactSelectionModal'>
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h1 className='modal-title fs-6 fw-bold text-secondary' id='addContactModal'>{titleHeader}</h1>
            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
          </div>
          <div className='modal-body'>
            <form>
              <div className='flex-fill mb-4'>
                <input
                  name='searchQuery'
                  type='text'
                  className='form-control shadow-none'
                  placeholder='Search for someone...'
                  onChange={onChange} />
              </div>
              <ul className='list-group'>
                {
                  contacts.map((contact, i) => {
                    const placeholderUrl = 'https://placehold.co/64?text=' + contact.first_name

                    return (
                      <li key={i} className='d-flex gap-3 p-3 list-group-item'>
                        <picture>
                          <img src={placeholderUrl} className='rounded-circle' alt={'Customer\'s profile picture'} />
                        </picture>
                        <div className='flex-grow-1'>
                          <ul className='list-unstyled mb-0'>
                            <li>
                              <h4 className='fs-6 fw-bold mb-0'>{getFullName(contact)}</h4>
                            </li>
                            <li className='d-flex gap-1'>
                              <span style={{ fontSize: '0.8rem' }} className='text-secondary'>{contact.id} {capitalize(contact.contact_type)}</span>
                              <span style={{ fontSize: '0.8rem' }} className='text-secondary'>
                                (Price Level: {contact.price_level})
                              </span>
                            </li>
                          </ul>
                        </div>
                        <div className='d-grid flex-column gap-1 align-items-center'>
                          <button
                            type='button'
                            className='btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center'
                            onClick={() => updateSelection(contact)}
                            data-bs-dismiss='modal' 
                            aria-label='Close'>
                            <SelectorIcon width={18} />
                            <span className='initialism text-capitalize'>Choose</span>
                          </button>
                        </div>
                      </li>
                    )
                  })
                }
              </ul>
            </form>
          </div>
        </div>
      </div>
    </div>

  )
}