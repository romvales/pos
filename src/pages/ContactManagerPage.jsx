import { useContext, useEffect, useState } from 'react'
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
  deleteContact,
  getContactsFromDatabase
} from '../actions'
import { Link, useLoaderData } from 'react-router-dom'
import { debounce } from 'lodash'
import { RootContext } from '../App'


export {
  ContactManagerPage,
}

function ContactManagerPage(props) {
  const {
    staticLocations,
    staticContacts } = useLoaderData()

  const rootContext = useContext(RootContext)
  const [locations, setLocations] = useState(staticLocations)
  const [contacts, setContacts] = useState(staticContacts)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage] = rootContext.currentPageState
  const [itemCount] = rootContext.itemCountState

  // Used for refreshing the list of locations
  const refreshLocations = async () => {
    return getLocationsFromDatabase()
      .then(res => {
        const { data } = res
        setLocations(data)
      })
      .catch()
  }

  const refreshContacts = async (type) => {
    const clonedContacts = structuredClone(contacts)

    switch (type) {
      case 'customers':
        await getCustomers(currentPage, itemCount, searchQuery).then(customers => {
          clonedContacts.customers = customers.data
        })
          .catch()
      case 'staffs':
        await getStaffs(currentPage, itemCount, searchQuery).then(staffs => {
          clonedContacts.staffs = staffs.data
        })
          .catch()
      case 'dealers':
        await getDealers(currentPage, itemCount, searchQuery).then(dealers => {
          clonedContacts.dealers = dealers.data
        })
          .catch()
    }

    setContacts(clonedContacts)
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
      .then(
        refreshContacts(type),
      )
  }

  useEffect(() => {
    getContactsFromDatabase(null, currentPage, itemCount*3, searchQuery)
      .then(res => {
        const { data } = res
        const contacts = { customers: [], staffs: [], dealers: [] }
        data?.map(contact => contacts[`${contact.contact_type}s`].push(contact))
        setContacts(contacts)
      })
  }, [ searchQuery ])

  const onChange = debounce(ev => {
    const searchQuery = ev.target.value
    setSearchQuery(searchQuery)
  }, 800)

  // @PAGE_URL: /contacts
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <nav aria-label='breadcrumb'>
          <ol className='breadcrumb'>
            <li className='breadcrumb-item'>
              <Link className='' to={{ pathname: '/' }}>Home</Link>
            </li>
            <li className='breadcrumb-item active' aria-current='page'>Contacts</li>
          </ol>
        </nav>

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
                    className='form-control'
                    placeholder='Search for someone...'
                    onChange={onChange} />
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
                        <td className='align-middle'>
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