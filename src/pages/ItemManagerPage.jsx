import { useState } from 'react'
import { DefaultLayout } from '../layouts/DefaultLayout'

import { AllProducts } from '../components/ItemManagerPage@AllProducts'
import { MostPopular } from '../components/ItemManagerPage@MostPopular'
import { ManageProductCategories } from '../components/ManageProductCategories'
import { getDealers, getProductCategoriesFromDatabase, getProductsFromDatabase } from '../actions'
import { useLoaderData } from 'react-router-dom'
import { NewProductForm } from '../components/NewProductForm'

export {
  ItemManagerPage,
  ItemManagerPageDataLoader
}

async function ItemManagerPageDataLoader() {
  const staticCategories = []
  const staticDealers = (await getDealers()) ?? []
  const staticProducts = []

  await getProductCategoriesFromDatabase()
    .then(res => {
      const { data } = res
      staticCategories.push(...data)
    })
    .catch()

  await getProductsFromDatabase()
    .then(res => {
      const { data } = res
      staticProducts.push(...data)
    })
    .catch()

  return {
    staticCategories,
    staticDealers,
    staticProducts,
  }
}

function ItemManagerPage(props) {
  const { staticCategories, staticProducts } = useLoaderData()
  const [categories, setCategories] = useState(staticCategories)
  const [products, setProducts] = useState(staticProducts)
  
  const [activeTabView, setActiveTabView] = useState('all')
  
  const refreshProducts = () => {
    getProductsFromDatabase()
      .then(res => {
        const { data } = res
        setProducts(data)
      })
  }

  // @PAGE_URL: /products
  return (
    <DefaultLayout>
      <div className='d-flex gap-5 container mx-auto'>
        <section className='col'>
          {/* Ini yung pag switch kan tab sa product manager page */}
          <nav className='mb-3'>
            <ul className='nav nav-tabs'>
              <li className='nav-item'>
                <a
                  type='button'
                  className={`fw-semibold nav-link ${activeTabView == 'all' ? 'active' : ''}`}
                  aria-current={activeTabView == 'all' ? 'page' : false}
                  onClick={() => setActiveTabView('all')}>My products</a>
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

        <ManageProductCategories
          categories={categories}
          updateCategories={setCategories} />
      </div>
    </DefaultLayout>
  )
}