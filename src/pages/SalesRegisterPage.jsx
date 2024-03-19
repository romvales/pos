import { useState } from 'react'
import { DefaultLayout } from '../layouts/DefaultLayout'

import { useLoaderData } from 'react-router-dom'
import { ProductListing } from '../components/ProductListing'
import { InvoiceForm, defaultSale } from '../components/InvoiceForm'

export {
  SalesRegisterPage,
}

function SalesRegisterPage(props) {
  const { staticProducts } = useLoaderData()
  const [products, setProducts] = useState(staticProducts)
  const [sales, setSales] = useState(structuredClone(defaultSale))
  const [recalculate, setRecalculate] = useState()

  const onSubmitSuccess = () => {
    SalesRegisterPageDataLoader().then(({ staticProducts }) => {
      setProducts(staticProducts)
    })
  }

  // @PAGE_URL: /
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <div className='row'>
          <section className='col-xl-7 col-md-7'>
            <ProductListing
              recalculator={[recalculate, setRecalculate]}
              salesState={[sales, setSales]}
              products={products} />
          </section>

          <section className='col-xl-4 col-md-5'>
            <InvoiceForm
              salesState={[sales, setSales]}
              recalculator={[recalculate, setRecalculate]}
              onSubmitSuccess={onSubmitSuccess} />
          </section>
        </div>
      </div>
    </DefaultLayout>
  )
}

