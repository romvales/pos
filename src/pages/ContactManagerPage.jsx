import { useState } from 'react'
import { DefaultLayout } from '../layouts/DefaultLayout'

import { PlusIcon, TrashIcon } from '@heroicons/react/outline'

import { ContactTableListing } from '../components/ContactTableListing'
import { NewContactPopup } from '../components/NewContactPopup'
import {
  deleteLocation,

  getLocationsFromDatabase,
  saveLocationToDatabase,
  getCustomers,
  getStaffs,
  getDealers,
  deleteContact
} from '../actions'
import { useLoaderData } from 'react-router-dom'


export {
  ContactManagerPage,
}

function ContactManagerPage(props) {
  const {
    staticLocations,
    staticContacts } = useLoaderData()

  const [locations, setLocations] = useState(staticLocations)
  const [contacts, setContacts] = useState(staticContacts)
  const [searchQuery, setSearchQuery] = useState('')

  // Used for refreshing the list of locations
  const refreshLocations = async () => {
    return getLocationsFromDatabase()
      .then(res => {
        const { data } = res
        setLocations(data)
      })
      .catch()
  }

  // @FEATURE: Add location to the database
  const onSubmitAddLocation = (ev) => {
    ev.preventDefault()

    const form = ev.target
    const formData = new FormData(form)
    const newLocation = Object.fromEntries(formData)

    if (form.checkValidity()) {
      saveLocationToDatabase(newLocation)
        .then(async () => {
          refreshLocations()
          form.reset()
        })
    }
  }

  // @FEATURE: Deletes a location in the database
  const onClickDeleteLocation = (locationData) => {
    deleteLocation(locationData)
      .then(() => {
        refreshLocations()
      })
      .catch()
  }

  const onDeleteContact = (contactData, type) => {
    deleteContact(contactData)
      .then(async () => {
        const clonedContacts = structuredClone(contacts)

        switch (type) {
        case 'customers':
          await getCustomers().then(customers => {
            clonedContacts.customers = customers
          })
            .catch()
        case 'staffs':
          await getStaffs().then(staffs => {
            clonedContacts.staffs = staffs
          })
            .catch()
        case 'dealers':
          await getDealers().then(dealers => {
            clonedContacts.dealers = dealers
          })
            .catch()
        }

        setContacts(clonedContacts)
      })
  }

  // @PAGE_URL: /contacts
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <div className='row'>
          <div className='col'>
            <section className='d-flex gap-3 mb-4'>
              <div>
                <button className='btn btn-primary' data-bs-toggle='modal' data-bs-target='#addContact'>
                  Add Contact
                </button>
              </div>
              <form className='d-flex flex-grow-1'>
                <div className='flex-fill'>
                  <input 
                    name='searchQuery' 
                    type='text'
                    value={searchQuery} 
                    className='form-control' 
                    placeholder='Search for someone...'
                    onChange={ev => setSearchQuery(ev.target.value)} />
                </div>
              </form>
            </section>

            <section>
              <div className='grid'>
                <div>
                  <h3 className='fs-3 fw-semibold'>Customers</h3>
                  <ContactTableListing
                    type='customers'
                    searchQuery={searchQuery}
                    locations={locations}
                    contacts={contacts}
                    onDeleteContact={onDeleteContact}></ContactTableListing>
                </div>
                <div>
                  <h3 className='fs-3 fw-semibold'>Staffs</h3>
                  <ContactTableListing
                    type='staffs'
                    searchQuery={searchQuery}
                    locations={locations}
                    contacts={contacts}
                    onDeleteContact={onDeleteContact}></ContactTableListing>
                </div>
                <div>
                  <h3 className='fs-3 fw-semibold'>Dealers</h3>
                  <ContactTableListing
                    type='dealers'
                    searchQuery={searchQuery}
                    locations={locations}
                    contacts={contacts}
                    onDeleteContact={onDeleteContact}></ContactTableListing>
                </div>
              </div>
            </section>
          </div>
          <div className='col-3'>
            <h1 className='fs-3 fw-semibold mb-4'>Manage stores</h1>

            <form className='d-flex gap-2' onSubmit={onSubmitAddLocation}>
              <div className='mb-2 flex-grow-1'>
                <input
                  name='location_name'
                  placeholder='Location'
                  className='form-control shadow-none'
                  id='locationInput'
                  required />
              </div>

              <div>
                <button type='submit' className='btn btn-primary'>
                  <PlusIcon width={14} />
                </button>
              </div>
            </form>

            <table className='table'>
              <thead>
                <tr>
                  <th colSpan={2} className='text-secondary'>
                    Location
                  </th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.95rem' }}>
                {
                  locations.map((location, i) => {
                    const locationName = location.location_name

                    return (
                      <tr key={i}>
                        <td className='align-middle'>
                          {locationName}
                        </td>
                        <td className='d-flex align-items-center justify-content-end'>
                          <button className='btn border-0' onClick={() => onClickDeleteLocation(location)}>
                            <TrashIcon width={20} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>

        <NewContactPopup
          title='Add Contact'
          locations={locations}
          updateContacts={setContacts}></NewContactPopup>
      </div>
    </DefaultLayout>
  )
}