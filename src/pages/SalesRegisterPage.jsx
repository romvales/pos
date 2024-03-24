import { useContext, useState } from 'react'
import { DefaultLayout } from '../layouts/DefaultLayout'

import { useLoaderData } from 'react-router-dom'
import { ProductListing } from '../components/ProductListing'
import { InvoiceForm, defaultSale } from '../components/InvoiceForm'
import { getProductsFromDatabase } from '../actions'

export {
  SalesRegisterPage,
}

function SalesRegisterPage(props) {
  const { staticProducts } = useLoaderData()
  const [products] = useState(staticProducts)
  const [sales, setSales] = useState(structuredClone(defaultSale))
  const [recalculate, setRecalculate] = useState()
  const [refreshProducts, setRefreshProducts] = useState()

  const onSubmitSuccess = () => {
    setRefreshProducts(!refreshProducts)
  }

  // @PAGE_URL: /
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <div className='row'>
          <section className='col-xl-8 col-md-7'>
            <ProductListing
              refreshProducts={[refreshProducts, setRefreshProducts]}
              recalculator={[recalculate, setRecalculate]}
              salesState={[sales, setSales]}
              products={products} />
          </section>

          <section className='col-xl-3 col-md-5'>
            <InvoiceForm
              salesState={[sales, setSales]}
              recalculator={[recalculate, setRecalculate]}
              onSubmitSuccess={onSubmitSuccess}
              discardOnSuccess={true} />
          </section>
        </div>
      </div>
    </DefaultLayout>
  )
}

