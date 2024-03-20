
import { Link, useLocation } from 'react-router-dom'

import { MenuAlt3Icon, CogIcon } from '@heroicons/react/outline'
import { useEffect, useState } from 'react'
import { MediaDevice } from '../components/MediaDevice'

export { DefaultLayout }

function DefaultLayout(props) {
  const [isVisible, setVisiblity] = useState(true)

  useEffect(() => {
    let scheduledVsibilityChange;

    const observer = new PerformanceObserver((list) => {
      setVisiblity(true)

      list.getEntries().forEach((entry) => {
        if (scheduledVsibilityChange) {
          clearInterval(scheduledVsibilityChange)
        }

        scheduledVsibilityChange = setInterval(() => {
          setVisiblity(false)
        }, 1e3)
      });
    });

    observer.observe({ type: 'resource', buffered: true });
  }, [])


  return (
    <>
      <MediaDevice></MediaDevice>
      <header className='sticky-top'>
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
                <li className='nav-item'>
                  <Link className='nav-link text-secondary' style={{ fontSize: '0.9rem' }} aria-current='page' to={{ pathname: '/sales' }}>Transactions</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link text-secondary' style={{ fontSize: '0.9rem' }} to={{ pathname: '/products' }}>Products</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link text-secondary' style={{ fontSize: '0.9rem' }} to={{ pathname: '/contacts' }}>Contacts</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link text-secondary' style={{ fontSize: '0.9rem' }} to={{ pathname: '/settings' }}>Settings</Link>
                </li>
              </ul>
            </div>

          </div>
        </nav>
      </header>
      <main className='mt-5 position-relative'>
        {props.children}
      </main>
    </>
  )
}