import { Link, useLoaderData } from 'react-router-dom'
import { getFullName, saveContactToDatabase } from '../actions'
import { DefaultLayout } from '../layouts/DefaultLayout'
import { createRef, useContext, useState } from 'react'
import { capitalize } from 'lodash'
import { createPortal } from 'react-dom'
import { RootContext } from '../App'

export {
  ContactInfoManagerPage,
}

const contactTypes = ['customer', 'staff', 'dealer']
const civilStatuses = ['unknown', 'single', 'divorced', 'widow', 'married']

function ContactInfoManagerPage(props) {
  const { staticContact, staticLocations } = useLoaderData()

  const formRef = createRef()
  const rootContext = useContext(RootContext)
  const isReadOnlyCustomerType = props.isReadOnlyCustomerType
  const [locations] = useState(staticLocations)
  const [existingContact, setExistingContact] = useState(staticContact)
  const [staticStaffs] = rootContext.staticStaffsState

  const onSubmit = (ev) => {
    ev.preventDefault()

    const formData = new FormData(formRef.current)
    let contactData = Object.fromEntries(formData)

    const approvedBy = staticStaffs[contactData.approved_by]

    if (approvedBy)
      contactData.approved_by = approvedBy.id
    else
      contactData.approved_by = null
    
    if (existingContact) {
      for (const key of Object.keys(contactData)) {
        existingContact[key] = contactData[key]
      }

      contactData = existingContact
    }

    saveContactToDatabase(contactData)
      .then(async () => {
        setExistingContact(structuredClone(existingContact))
      })
      .catch()
  }

  const Breadcrumbs = () => (
    <nav aria-label='breadcrumb'>
      <ol className='breadcrumb'>
        <li className='breadcrumb-item'>
          <Link className='' to={{ pathname: '/' }}>Home</Link>
        </li>
        <li className='breadcrumb-item'>
          <Link className='' to={{ pathname: '/contacts' }}>Contacts</Link>
        </li>
        <li className='breadcrumb-item active' aria-current='page'>
          Edit - {getFullName(existingContact)} ({existingContact.id})
        </li>
      </ol>
    </nav>
  )

  return (
    <DefaultLayout Breadcrumbs={Breadcrumbs}>
      <div className='container row justify-content-center mx-auto'>
        <Breadcrumbs />

        <form className='col-6 mb-4' ref={formRef} onSubmit={onSubmit}>
          <div className=''>
            <fieldset className='mb-3'>
              <legend className='fs-6 fw-bold text-primary'>Personal</legend>

              <div className='input-group input-group-sm mb-2'>
                <span className='input-group-text input-group-text disabled fw-semibold'>ID</span>
                <input className='form-control form-control-sm' placeholder='Auto-generated' disabled defaultValue={existingContact?.id} />
              </div>

              <div className='form-floating mb-2'>
                <select id='contactType' className='form-select' name='contact_type' disabled={isReadOnlyCustomerType} defaultValue={existingContact?.contact_type}>
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
                    <select id='areaLocated' className='form-select' name='location_id' defaultValue={existingContact?.location_id}>
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
                    <input type='number' name='price_level' defaultValue={existingContact?.price_level?.toString() ?? 1} min={1} className='form-control' id='priceLevelInput' required />
                    <label htmlFor='priceLevelInput'>Price Level</label>
                  </div>
                </div>
              </div>

              <div className='mb-1'>
                <label className='form-label fs-6 fw-semibold text-secondary'>Info Type</label>
                <div className='row'>
                  <div className='col'>
                    <div className='form-check'>
                      <input className='form-check-input' value={'personal'} type='radio' name='info_type' id='personalRadioButton' defaultChecked={existingContact?.info_type === 'personal'} />
                      <label className='form-check-label' htmlFor='personalRadioButton'>
                        Personal
                      </label>
                    </div>
                  </div>
                  <div className='col'>
                    <div className='form-check'>
                      <input className='form-check-input' value={'corporate'} type='radio' name='info_type' id='coporateRadioButton' defaultChecked={existingContact?.info_type === 'corporate'} />
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
                    <input name='first_name' className='form-control' id='firstNameInput' required defaultValue={existingContact?.first_name} />
                    <label htmlFor='firstNameInput'>*First Name</label>
                  </div>
                </div>
                <div className='col'>
                  <div className='form-floating'>
                    <input name='middle_initial' className='form-control' id='middleInitialInput' maxLength={1} defaultValue={existingContact?.middle_initial} />
                    <label htmlFor='middleInitialInput'>Middle Initial</label>
                  </div>
                </div>
              </div>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input name='last_name' className='form-control' id='lastNameInput' defaultValue={existingContact?.last_name} />
                  <label htmlFor='lastNameInput'>*Last Name</label>
                </div>
              </div>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input name='address_line' className='form-control' id='addressInput' defaultValue={existingContact?.address_line} />
                  <label htmlFor='addressInput'>Address</label>
                </div>
              </div>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input type='date' name='birthdate' className='form-control' id='birthdateInput' defaultValue={existingContact?.birthdate} />
                  <label htmlFor='birthdateInput'>Birthdate</label>
                </div>
              </div>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input name='birthplace' className='form-control' id='birthplaceInput' defaultValue={existingContact?.birthplace} />
                  <label htmlFor='birthplaceInput'>Birthplace</label>
                </div>
              </div>

              <div className='mb-2'>
                <div className='form-floating'>
                  <select id='civilStatusInput' className='form-select' name='civil_status' defaultValue={existingContact?.civil_status}>
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
                        <input className='form-check-input' value={'male'} type='radio' name='sex' id='maleRadioButton' defaultChecked={existingContact?.sex == 'male'} />
                        <label className='form-check-label' htmlFor='maleRadioButton'>
                          Male
                        </label>
                      </div>
                    </div>
                    <div className='col'>
                      <div className='form-check'>
                        <input className='form-check-input' value={'female'} type='radio' name='sex' id='femaleRadioButton' defaultChecked={existingContact?.sex == 'female'} />
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
                      <input name='citizenship' className='form-control' id='citizenshipInput' defaultValue={existingContact?.citizenship} />
                      <label htmlFor='citizenshipInput'>Citizenship</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input name='occupation' className='form-control' id='occupationInput' defaultValue={existingContact?.occupation} />
                  <label htmlFor='occupationInput'>Occupation</label>
                </div>
              </div>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input name='tin_no' className='form-control' id='tinNoInput' defaultValue={existingContact?.tin_no} />
                  <label htmlFor='tinNoInput'>TIN #</label>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className='fs-6 fw-bold text-primary'>Corporate Information</legend>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input name='company_name' className='form-control' id='companyNameInput' defaultValue={existingContact?.company_name} />
                  <label htmlFor='companyNameInput'>Company Name</label>
                </div>
              </div>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input name='company_address' className='form-control' id='companyAddressInput' defaultValue={existingContact?.company_address} />
                  <label htmlFor='companyAddressInput'>Company Address</label>
                </div>
              </div>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input name='business_nature' className='form-control' id='businessNatureInput' defaultValue={existingContact?.business_nature} />
                  <label htmlFor='businessNatureInput'>Nature of Business</label>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className='fs-6 fw-bold text-primary'>Conditions</legend>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input type='date' name='date_open' defaultValue={existingContact?.date_open} className='form-control' id='dateOpenInput' />
                  <label htmlFor='dateOpenInput'>Date Open</label>
                </div>
              </div>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input 
                    name='approved_by' 
                    className='form-control' 
                    id='remarksInput' 
                    list='staffsOptions' 
                    defaultValue={existingContact?.approved_by ? `${existingContact?.approved_by?.full_name} (${existingContact?.approved_by?.id})` : ''} />
                  <label htmlFor='remarksInput'>Approved By</label>
                  <datalist id='staffsOptions'>
                    {
                      Object.values(staticStaffs).map((staff, i) => {
                        const staffName = `${staff.full_name} (${staff.id})`

                        return (
                          <option key={i} value={staffName}>
                            {staffName}
                          </option>
                        )
                      })
                    }
                  </datalist>
                </div>
              </div>

              <div className='mb-2'>
                <div className='form-floating'>
                  <input name='remarks' className='form-control' id='remarksInput' defaultValue={existingContact?.remarks} />
                  <label htmlFor='remarksInput'>Remarks</label>
                </div>
              </div>
            </fieldset>
          </div>

          <div className=''>
            <button type='submit' className='btn btn-primary'>Save</button>
          </div>

        </form>
      </div>
    </DefaultLayout>
  )
}