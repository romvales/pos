import { capitalize } from 'lodash'
import { useState } from 'react'
import { getFullName } from '../actions'

export { ContactSelector }

function ContactSelector(props) {
  const contacts = props.contacts
  const updateSelection = props.updateSelection
  const titleHeader = props.titleHeader ?? ''

  const [searchQuery, setSearchQuery] = useState('')

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
                  value={searchQuery}
                  className='form-control shadow-none'
                  placeholder='Search for someone...'
                  onChange={ev => setSearchQuery(ev.target.value)} />
              </div>
              <ul className='list-group'>
                {
                  contacts.filter(contact => new RegExp(searchQuery).test(getFullName(contact))).map((contact, i) => {
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