
import { Link } from 'react-router-dom'

export { DefaultLayout }

function DefaultLayout(props) {

  return (
    <>
      <header className='sticky-top'>
        <nav className='navbar navbar-expand-lg bg-body-tertiary shadow-sm'>
          <div className='container'>
            <Link className='navbar-brand' to={{ pathname: '/' }}>
              <span className='fw-bold fs-4 text-primary'>POS</span>
            </Link>
            <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarNav' aria-controls='navbarNav' aria-expanded='false' aria-label='Toggle navigation'>
              <span className='navbar-toggler-icon'></span>
            </button>

            <div className='collapse navbar-collapse justify-content-between' id='navbarNav'>
              <ul className='navbar-nav'>
                <li className='nav-item'>
                  <Link className='nav-link text-secondary fs-6' aria-current='page' to={{ pathname: '/sales' }}>Transactions</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link text-secondary fs-6' to={{ pathname: '/products' }}>Products</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link text-secondary fs-6' to={{ pathname: '/contacts' }}>Contacts</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
      <main className='mt-5'>
        {props.children}
      </main>
    </>
  )
}