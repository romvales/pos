import { useState } from 'react'
import { DefaultLayout } from '../layouts/DefaultLayout'

import { AllProducts } from '../components/ItemManagerPage@AllProducts'
import { MostPopular } from '../components/ItemManagerPage@MostPopular'
import { ManageProductCategories } from '../components/ManageProductCategories'
import { getProductsFromDatabase } from '../actions'
import { Link, useLoaderData } from 'react-router-dom'
import { NewProductForm } from '../components/NewProductForm'

export {
  ItemManagerPage,
}

function ItemManagerPage(props) {
  const { staticCategories, staticProducts } = useLoaderData()
  const [categories, setCategories] = useState(staticCategories)
  const [products, setProducts] = useState(staticProducts)

  const [activeTabView, setActiveTabView] = useState('all')

  const refreshProducts = (pageNumber, itemCount) => {
    getProductsFromDatabase(pageNumber, itemCount)
      .then(res => {
        const { data } = res
        if (data.length) setProducts(data)
      })
  }

  const Breadcrumbs = () => (
    <nav aria-label='breadcrumb'>
      <ol className='breadcrumb'>
        <li className='breadcrumb-item'>
          <Link className='' to={{ pathname: '/' }}>Home</Link>
        </li>
        <li className='breadcrumb-item active' aria-current='page'>Stocks</li>
      </ol>
    </nav>
  )

  // @PAGE_URL: /products 
  return (
    <DefaultLayout Breadcrumbs={Breadcrumbs}>
      <div className='container mx-auto'>
        <Breadcrumbs />

        <div className='d-flex gap-5'>
          <section className='col'>
            {/* Ini yung pag switch kan tab sa product manager page */}
            <nav className='mb-3'>
              <ul className='nav nav-tabs'>
                <li className='nav-item'>
                  <a
                    type='button'
                    className={`nav-link ${activeTabView == 'all' ? 'active' : ''}`}
                    aria-current={activeTabView == 'all' ? 'page' : false}
                    onClick={() => setActiveTabView('all')}>All Goods</a>
                </li>
              </ul>
            </nav>

            {activeTabView == 'all' ? <AllProducts products={products} /> : <MostPopular />}
          </section>
          <section className='col-xl-3 col-5'>
            <NewProductForm
              categories={categories}
              refreshProducts={refreshProducts}></NewProductForm>
            <div className='mb-2'>

            </div>
          </section>
        </div>

        <ManageProductCategories
          categories={categories}
          updateCategories={setCategories} />
      </div>
    </DefaultLayout>
  )
}