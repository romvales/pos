import { Link } from 'react-router-dom'
import { MenuAlt3Icon } from '@heroicons/react/outline'
import { MediaDevice } from '../components/MediaDevice'
import { RootContext } from '../App'
import { useContext, useMemo, useState } from 'react'
import { getContactsFromDatabase, getFullName } from '../actions'
import { capitalize } from 'lodash'

export { DefaultLayout }

const staffsData = (await getContactsFromDatabase('staff', null, null, '', true)).data

function DefaultLayout(props) {
  const rootContext = useContext(RootContext)
  const url = new URL(document.URL)

  const Breadcrumbs = props.Breadcrumbs
  const AsidedContent = props.AsidedContent

  const [selectedStaff, setSelectedStaff] = useState(JSON.parse(localStorage.getItem('_performingStaffData')) ?? {})
  const [isVisible] = rootContext.loadingBarState

  const urlContains = (str) => {
    return new RegExp(str).test(url.pathname)
  }

  const onSelectStaff = (staff) => {
    localStorage.setItem('_performingStaffData', JSON.stringify(staff))
    setSelectedStaff(staff)
  }
  
  const placeholderUrl = useMemo(() => 'https://placehold.co/48?text=' + selectedStaff.first_name, [ selectedStaff ])

  return (
    <>
      {/* <MediaDevice></MediaDevice> */}
      <header className='sticky-top d-sm-block d-lg-none'>
        <nav className='navbar navbar-expand-lg border-bottom bg-white'>
          <div className='container'>
            <Link className='navbar-brand' to={{ pathname: '/' }}>
              <span className='fw-bold fs-5 text-primary'>despos</span>
            </Link>

            <div className='navbar-toggler shadow-none' style={{ border: 0 }}>
              <button className='btn p-1' style={{ border: 0 }} type='button' data-bs-toggle='collapse' data-bs-target='#navbarNav' aria-controls='navbarNav' aria-expanded='false' aria-label='Toggle navigation'>
                <MenuAlt3Icon width={24} />
              </button>
            </div>

            <div className='collapse navbar-collapse justify-content-between' id='navbarNav'>
              <ul className='navbar-nav'>
                <li className='nav-item active'>
                  <Link className='nav-link text-secondary' style={{ fontSize: '0.9rem' }} to={{ pathname: '/stocks' }}>Stocks</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link text-secondary' style={{ fontSize: '0.9rem' }} to={{ pathname: '/contacts' }}>Contacts</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link text-secondary' style={{ fontSize: '0.9rem' }} to={{ pathname: '/settings' }}>Settings</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link text-secondary' style={{ fontSize: '0.9rem' }} aria-current='page' to={{ pathname: '/sales' }}>Sales</Link>
                </li>
                <li className='nav-item active'>
                  <Link className='nav-link text-secondary' style={{ fontSize: '0.9rem' }} to={{ pathname: '/accounting' }}>Accounting</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className='h-100 d-flex position-relative'>
        {
          isVisible ?
            <div className='progress rounded-0 fixed-top bg-transparent'>
              <div
                className='progress-bar progress-bar-striped progress-bar-animated'
                role='progressbar'
                aria-valuenow='100'
                aria-valuemin='0'
                aria-valuemax='100'
                style={{ width: '100%', height: '0.25rem' }}></div>
            </div>
            :
            <></>
        }

        <div className='col-2 p-0 h-100 shadow-sm sticky-top border-end d-sm-none d-lg-block'>
          <div className='h-100 d-flex flex-column p-3'>
            <nav className='flex-grow-1'>
              <ul className='list-unstyled m-0 d-flex flex-column'>
                <li className='my-2'>
                  <Link className='navbar-brand h-100' to={{ pathname: '/' }}>
                    <h1 className='px-3 fw-bold fs-4 text-primary'>despos</h1>
                  </Link>
                </li>

                <li className={`mb-1 rounded nav-item ${urlContains('/stocks') ? 'bg-secondary bg-opacity-10' : ''}`}>
                  <Link className={`p-3 nav-link h-100 ${urlContains('/stocks') ? 'text-secondary' : ''}`} to={{ pathname: '/stocks' }}>Stocks</Link>
                </li>
                <li className={`mb-1 rounded nav-item ${urlContains('/contacts') ? 'bg-secondary bg-opacity-10' : ''}`}>
                  <Link className={`p-3 nav-link h-100 ${urlContains('/contacts') ? 'text-secondary' : ''}`} to={{ pathname: '/contacts' }}>Contacts</Link>
                </li>
                <li className={`mb-1 rounded nav-item ${urlContains('/sales') ? 'bg-secondary bg-opacity-10' : ''}`}>
                  <Link className={`p-3 nav-link h-100 ${urlContains('/sales') ? 'text-secondary' : ''}`} aria-current='page' to={{ pathname: '/sales' }}>Sales</Link>
                </li>
                <li className={`mb-1 rounded nav-item ${urlContains('/settings') ? 'bg-secondary bg-opacity-10' : ''}`}>
                  <Link className={`p-3 nav-link h-100 ${urlContains('/settings') ? 'text-secondary' : ''}`} to={{ pathname: '/settings' }}>Settings</Link>
                </li>
                <li className={`mb-1 rounded nav-item ${urlContains('/accounting') ? 'bg-secondary bg-opacity-10' : ''}`}>
                  <Link className={`p-3 nav-link h-100 ${urlContains('/accounting') ? 'text-secondary' : ''}`} to={{ pathname: '/accounting' }}>Accounting</Link>
                </li>
              </ul>
            </nav>
            <div className='dropup d-grid'>
              <button
                className='btn border'
                type='button'
                data-bs-toggle='dropdown'>
                {
                  selectedStaff?.id ?
                    <div className='d-flex gap-2 py-2 px-2 w-100'>
                      <picture>
                        <img src={placeholderUrl} className='rounded-circle' alt={'Customer\'s profile picture'} />
                      </picture>
                      <div className='flex-grow-1 d-flex flex-column justify-content-center align-items-start'>
                        <span style={{ fontSize: '0.8rem' }} className='text-secondary'>Performing action as...</span>
                        <ul className='list-unstyled mb-0'>
                          <li>
                            <h4 className='fs-6 fw-bold mb-0'>{getFullName(selectedStaff)}</h4>
                          </li>
                        </ul>
                      </div>
                    </div>
                    :
                    <>
                      <span>Performing action as</span>
                    </>
                }
              </button>
              <ul className='dropdown-menu w-100'>
                {
                  staffsData?.map(contact => {
                    const placeholderUrl = 'https://placehold.co/48?text=' + contact.first_name

                    return (
                      <li className='dropdown-item d-flex gap-2 p-2 px-3 list-group-item' onClick={() => onSelectStaff(contact)}>
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
                            </li>
                          </ul>
                        </div>
                      </li>
                    )
                  })
                }
              </ul>
            </div>
          </div>
        </div>

        <div className='flex-grow-1 p-0 h-100' style={{ overflow: 'scroll' }}>
          {
            AsidedContent ?
              <aside id='topAsideContent'>
                <AsidedContent Breadcrumbs={Breadcrumbs} />
              </aside>
              :
              <></>
          }

          <main className='mt-3 position-relative'>
            {props.children}
          </main>
        </div>
      </div>
    </>
  )
}