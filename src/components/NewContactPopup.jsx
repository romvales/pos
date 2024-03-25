
import { capitalize, result } from 'lodash'
import { createRef, useContext, useEffect, useMemo, useState } from 'react'
import { getContacts, getContactsFromDatabase, refreshContacts, saveContactToDatabase } from '../actions'
import { RootContext } from '../App'

export { NewContactPopup }

const contactTypes = ['customer', 'staff', 'dealer']
const civilStatuses = ['unknown', 'single', 'divorced', 'widow', 'married']

const createEmptyContact = () => {
  const now = new Date()

  const dateOpen = `${now.getFullYear()}-${now.getMonth().toString().padStart(2, '0')}-${now.getDate()}`

  return {
    contact_type: 'customer',
    info_type: 'personal',
    first_name: '',
    middle_initial: '',
    last_name: '',
    price_level: 1,
    address_line: '',
    birthdate: null,
    birthplace: '',
    sex: 'male',
    citizenship: 'Filipino',
    occupation: '',
    tin_no: '',
    company_name: '',
    company_address: '',
    business_nature: '',
    date_added: new Date(),
    date_open: dateOpen,
    approved_by: null,
    remarks: '',
  }
}

function NewContactPopup(props) {
  const titleHeader = props.title
  const formRef = createRef()
  const closePopup = createRef()
  const rootContext = useContext(RootContext)
  const isReadOnlyCustomerType = props.isReadOnlyCustomerType
  const locations = props.locations ?? []
  const [contacts, setContacts] = props.contactsState
  const [contact, setContact] = useState(createEmptyContact())
  const [searchQuery] = props.searchQueryState ?? useState('')
  const updateExistingContact = props.updateExistingContact
  const [currentPage] = props.currentPageState ?? rootContext.currentPageState
  const [itemCount] = props.itemCountState ?? rootContext.itemCountState

  const onSubmit = (ev) => {  
    ev.preventDefault()

    const formData = new FormData(formRef.current)

    const existingContact = structuredClone(contact)
    let contactData = Object.fromEntries(formData)

    contactData.date_added = new Date()
    contactData.approved_by = null

    if (existingContact) {
      for (const key of Object.keys(contactData)) {
        existingContact[key] = contactData[key]
      } 

      contactData = existingContact
    }

    saveContactToDatabase(contactData)
      .then(async (res) => {
        const { data } = res
        const url = new URL(document.URL)

        const toUpdateContactTypes = `${contactData.contact_type}s`

        // @NOTE: When the pathname is /contacts, assume that updateContacts is an object
        if (url.pathname == '/contacts') {
          refreshContacts([ toUpdateContactTypes ], currentPage, itemCount, searchQuery)
            .then(res => {
              const clonedContacts = structuredClone(contacts)
              const { data } = res
              clonedContacts[toUpdateContactTypes] = data[toUpdateContactTypes]
              setContacts(clonedContacts)
            })
        } else if (url.pathname == '/') {
          refreshContacts([ 'customers', 'staffs', 'dealers' ], 0, 8)
            .then(res => {
              const { data } = res
              setContacts(Object.values(data).flat())
            })
        }

        if (updateExistingContact) updateExistingContact(data)
      })
      .catch()
      

    closePopup.current.click()
    onDiscard()
  }

  const onDiscard = () => {
    formRef.current.reset()
  }

  const onValueChange = (targetValue, key) => {
    const clonedContact = structuredClone(contact)
    clonedContact[key] = targetValue
    setContact(clonedContact)
  }

  useEffect(() => {
    if (props.existingContact) {
      setContact(structuredClone(props.existingContact))
    }
  }, [ props.existingContact ])

  return (
    <div className='modal fade' id='addContact' tabIndex='-1' aria-labelledby='addContactModal' data-bs-backdrop='static' data-bs-keyboard='false'>
      <form ref={formRef} onSubmit={onSubmit}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h1 className='modal-title fs-6 fw-bold text-secondary' id='addContactModal'>{titleHeader}</h1>
              <button ref={closePopup} type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' onClick={() => onDiscard()}></button>
            </div>
            <div className='modal-body'>
              <fieldset className='mb-3'>
                <legend className='fs-6 fw-bold text-primary'>Personal</legend>

                <div className='input-group input-group-sm mb-2'>
                  <span className='input-group-text input-group-text disabled fw-semibold'>ID</span>
                  <input className='form-control form-control-sm' placeholder='Auto-generated' disabled defaultValue={contact?.id} />
                </div>

                <div className='form-floating mb-2'>
                  <select id='contactType' className='form-select' name='contact_type' disabled={isReadOnlyCustomerType} defaultValue={contact?.contact_type}>
                    {
                      contactTypes.map(type => (
                        <option value={type} key={type}>
                          {capitalize(type)}
                        </option>
                      ))
                    }
                  </select>
                  <label htmlFor='contactType'>Contact Type</label>
                </div>

                <div className='d-flex gap-2 mb-2'>
                  <div className='col'>
                    <div className='form-floating'>
                      <select id='areaLocated' className='form-select' name='location_id' defaultValue={contact?.location_id}>
                        {
                          locations.map(location => (
                            <option value={location.id} key={location.id}>
                              {location.location_name}
                            </option>
                          ))
                        }
                      </select>
                      <label htmlFor='areaLocated' className='form-label fs-6'>Store</label>
                    </div>
                  </div>
                  <div className='col'>
                    <div className='form-floating'>
                      <input 
                        type='number' 
                        name='price_level'
                        min={1} max={100}
                        value={contact?.price_level.toLocaleString()}
                        className='form-control' id='priceLevelInput'
                        onChange={ev => { onValueChange(ev.target.valueAsNumber, 'price_level') }}
                        required />
                      <label htmlFor='priceLevelInput'>Price Level</label>
                    </div>
                  </div>
                </div>

                <div className='mb-1'>
                  <label className='form-label fs-6 fw-semibold text-secondary'>Info Type</label>
                  <div className='row'>
                    <div className='col'>
                      <div className='form-check'>
                        <input className='form-check-input' value={'personal'} type='radio' name='info_type' id='personalRadioButton' defaultChecked={contact?.info_type === 'personal'} />
                        <label className='form-check-label' htmlFor='personalRadioButton'>
                          Personal
                        </label>  
                      </div>
                    </div>
                    <div className='col'>
                      <div className='form-check'>
                        <input className='form-check-input' value={'corporate'} type='radio' name='info_type' id='coporateRadioButton' defaultChecked={contact?.info_type === 'corporate'} />
                        <label className='form-check-label' htmlFor='coporateRadioButton'>
                          Corporate
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

              </fieldset>

              <fieldset className='mb-2'>
                <legend className='fs-6 fw-bold text-primary'>Personal Information</legend>

                <div className='d-flex gap-2 mb-2'>
                  <div className='col'>
                    <div className='form-floating'>
                      <input name='first_name' className='form-control' id='firstNameInput' required defaultValue={contact?.first_name} />
                      <label htmlFor='firstNameInput'>*First Name</label>
                    </div>
                  </div>
                  <div className='col'>
                    <div className='form-floating'>
                      <input name='middle_initial' className='form-control' id='middleInitialInput' maxLength={1} defaultValue={contact?.middle_initial} />
                      <label htmlFor='middleInitialInput'>Middle Initial</label>
                    </div>
                  </div>
                </div>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input name='last_name' className='form-control' id='lastNameInput' defaultValue={contact?.last_name} />
                    <label htmlFor='lastNameInput'>*Last Name</label>
                  </div>
                </div>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input name='address_line' className='form-control' id='addressInput' defaultValue={contact?.address_line} />
                    <label htmlFor='addressInput'>Address</label>
                  </div>
                </div>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input type='date' name='birthdate' className='form-control' id='birthdateInput' defaultValue={contact?.birthdate} />
                    <label htmlFor='birthdateInput'>Birthdate</label>
                  </div>
                </div>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input name='birthplace' className='form-control' id='birthplaceInput' defaultValue={contact?.birthplace} />
                    <label htmlFor='birthplaceInput'>Birthplace</label>
                  </div>
                </div>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <select id='civilStatusInput' className='form-select' name='civil_status' defaultValue={contact?.civil_status}>
                      {
                        civilStatuses.map(status => (
                          <option key={status} value={status}>
                            {capitalize(status)}
                          </option>
                        ))
                      }
                    </select>
                    <label htmlFor='civilStatusInput' className='form-label fs-6'>Civil Status</label>
                  </div>
                </div>

                <div className='row mb-1'>
                  <div className='col'>
                    <label htmlFor='areaLocated' className='form-label fs-6 fw-semibold text-secondary'>Sex</label>
                    <div className='row'>
                      <div className='col'>
                        <div className='form-check'>
                          <input className='form-check-input' value={'male'} type='radio' name='sex' id='maleRadioButton' defaultChecked={contact?.sex == 'male'} />
                          <label className='form-check-label' htmlFor='maleRadioButton'>
                            Male
                          </label>
                        </div>
                      </div>
                      <div className='col'>
                        <div className='form-check'>
                          <input className='form-check-input' value={'female'} type='radio' name='sex' id='femaleRadioButton' defaultChecked={contact?.sex == 'female'} />
                          <label className='form-check-label' htmlFor='femaleRadioButton'>
                            Female
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col'>
                    <div className='mb-2'>
                      <div className='form-floating'>
                        <input name='citizenship' className='form-control' id='citizenshipInput' defaultValue={contact?.citizenship} />
                        <label htmlFor='citizenshipInput'>Citizenship</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input name='occupation' className='form-control' id='occupationInput' defaultValue={contact?.occupation} />
                    <label htmlFor='occupationInput'>Occupation</label>
                  </div>
                </div>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input name='tin_no' className='form-control' id='tinNoInput' defaultValue={contact?.tin_no} />
                    <label htmlFor='tinNoInput'>TIN #</label>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className='fs-6 fw-bold text-primary'>Corporate Information</legend>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input name='company_name' className='form-control' id='companyNameInput' defaultValue={contact?.company_name} />
                    <label htmlFor='companyNameInput'>Company Name</label>
                  </div>
                </div>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input name='company_address' className='form-control' id='companyAddressInput' defaultValue={contact?.company_address} />
                    <label htmlFor='companyAddressInput'>Company Address</label>
                  </div>
                </div>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input name='business_nature' className='form-control' id='businessNatureInput' defaultValue={contact?.business_nature} />
                    <label htmlFor='businessNatureInput'>Nature of Business</label>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className='fs-6 fw-bold text-primary'>Conditions</legend>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input type='date' name='date_open' defaultValue={contact?.date_open} className='form-control' id='dateOpenInput' />
                    <label htmlFor='dateOpenInput'>Date Open</label>
                  </div>
                </div>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input name='approved_by' className='form-control' id='remarksInput' />
                    <label htmlFor='remarksInput'>Approved By</label>
                  </div>
                </div>

                <div className='mb-2'>
                  <div className='form-floating'>
                    <input name='remarks' className='form-control' id='remarksInput' defaultValue={contact?.remarks} />
                    <label htmlFor='remarksInput'>Remarks</label>
                  </div>
                </div>
              </fieldset>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn' data-bs-dismiss='modal' onClick={onDiscard}>Discard</button>
              <button type='submit' className='btn btn-primary'>Save</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}