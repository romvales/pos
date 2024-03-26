import { useContext, useEffect, useRef, useState } from 'react'
import { DefaultLayout } from '../layouts/DefaultLayout'

import { PlusIcon, TrashIcon } from '@heroicons/react/outline'

import { ContactTableListing } from '../components/ContactTableListing'
import { NewContactPopup } from '../components/NewContactPopup'
import {
  deleteLocation,
  getLocationsFromDatabase,
  saveLocationToDatabase,
  deleteContactSelections,
  refreshContacts,
} from '../actions'
import { Link, useLoaderData } from 'react-router-dom'
import { debounce, keys } from 'lodash'


export {
  ContactManagerPage,
}

function ContactManagerPage(props) {
  const {
    staticLocations,
    staticContacts,
    counts } = useLoaderData()

  const searchRef = useRef()
  const [locations, setLocations] = useState(staticLocations)
  const [contacts, setContacts] = useState(staticContacts)

  // Used for refreshing the list of locations
  const refreshLocations = async () => {
    return getLocationsFromDatabase()
      .then(res => {
        const { data } = res
        setLocations(data)
      })
      .catch()
  }

  const _refreshContacts = async (contactTypes, currentPage, itemCount) => {
    const clonedContacts = structuredClone(contacts)
    const searchQuery = searchRef.current.value ?? ''

    await refreshContacts(contactTypes, currentPage, itemCount, searchQuery)
      .then(res => {
        const { data } = res
        contactTypes.forEach(type => clonedContacts[type] = data[type])
      })
  
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

  const onPaginate = (updatedValue, itemCount) => {
    _refreshContacts([ 'customers', 'staffs', 'dealers' ], updatedValue, itemCount)
  }

  const onDeleteSelections = async (checkedContacts, pageNumber, itemCount) => {
    const contactTypesToRefresh = {}

    return deleteContactSelections(Object.values(checkedContacts).map(contact => {
      const id = contact.id
      const profile_url = contact.profile_url
      contactTypesToRefresh[`${contact.contact_type}s`] = true
      return { id, profile_url }
    })) 
      .then(() => {
        return _refreshContacts(keys(contactTypesToRefresh), pageNumber, itemCount)
      }) 
  }


  const onChange = debounce(() => _refreshContacts([ 'customers', 'staffs', 'dealers' ]), 300)

  const Breadcrumbs = () => (
    <nav aria-label='breadcrumb'>
      <ol className='breadcrumb'>
        <li className='breadcrumb-item'>
          <Link className='' to={{ pathname: '/' }}>Home</Link>
        </li>
        <li className='breadcrumb-item active' aria-current='page'>Contacts</li>
      </ol>
    </nav>
  )

  // @PAGE_URL: /contacts
  return (
    <DefaultLayout Breadcrumbs={Breadcrumbs}>
      <div className='container mx-auto'>
        <Breadcrumbs />

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
                    ref={searchRef}
                    name='searchQuery'
                    type='text'
                    className='form-control'
                    placeholder='Search for someone...'
                    onChange={onChange} />
                </div>
              </form>
            </section>

            <section>
              <div className='d-grid gap-2'>
                <div>
                  <h3 className='fs-3 fw-semibold'>Customers</h3>
                  <ContactTableListing
                    type='customers'
                    locations={locations}
                    contacts={contacts}
                    totalContacts={counts?.customersCount}
                    onPaginate={onPaginate}
                    onDeleteSelections={onDeleteSelections}></ContactTableListing>
                </div>
                <div>
                  <h3 className='fs-3 fw-semibold'>Staffs</h3>
                  <ContactTableListing
                    type='staffs'
                    locations={locations}
                    contacts={contacts}
                    totalContacts={counts?.staffsContact}
                    onPaginate={onPaginate}
                    onDeleteSelections={onDeleteSelections}></ContactTableListing>
                </div>
                <div>
                  <h3 className='fs-3 fw-semibold'>Dealers</h3>
                  <ContactTableListing
                    type='dealers'
                    locations={locations}
                    contacts={contacts}
                    totalContacts={counts?.dealersCount}
                    onPaginate={onPaginate}
                    onDeleteSelections={onDeleteSelections}></ContactTableListing>
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
          updateContacts={setContacts}
          contactsState={[contacts, setContacts]}></NewContactPopup>
      </div>
    </DefaultLayout>
  )
}