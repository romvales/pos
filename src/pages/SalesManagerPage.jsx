import { Link, useLoaderData } from 'react-router-dom'
import { useContext, useEffect } from 'react'
import { deleteSales, getFullName, getSalesCountFromDatabase, pesoFormatter } from '../actions'
import { DefaultLayout } from '../layouts/DefaultLayout'
import { useState } from 'react'
import { InvoiceForm, defaultSale } from '../components/InvoiceForm'
import { SalesManagerPageDataLoader } from './loaders'
import { Paginator } from '../components/Paginator'
import { Transactions } from '../components/Transactions'

export {
  SalesManagerPage,
}

const salesCount = (await getSalesCountFromDatabase()).data

function SalesManagerPage(props) {
  const { staticSales } = useLoaderData()

  const [collectionSales, setCollectionSales] = useState(staticSales)
  const [selectedSales, setSelectedSales] = useState(structuredClone(defaultSale))
  const [selectedCustomer, setSelectedCustomer] = useState()
  const [searchQuery, setSearchQuery] = useState('')
  const [recalculate, setRecalculate] = useState()
  
  const refreshCollections = (pageNumber = 0, itemCount = 10) => {
    SalesManagerPageDataLoader({ pageNumber, itemCount })
      .then(({ staticSales }) => {
        cleanUpCollectionAndSetState(staticSales)
      })
  }

  // @FEATURE: Deletes a sale from the database
  const onDeleteTransaction = (sale, pageNumber, itemCount) => {
    deleteSales(sale)
      .then(
        () => refreshCollections(pageNumber, itemCount)
      )
  }

  // @FEATURE: Change the selected sales to display in the invoice form
  const onClickViewSales = (sales) => {
    setSelectedSales(sales)
    setSelectedCustomer(sales.customer)
  }

  const onSubmitSuccess = (pageNumber, itemCount) => {
    refreshCollections(pageNumber, itemCount)
  }

  const onSaveSuccess = (pageNumber, itemCount) => {
    refreshCollections(pageNumber, itemCount)
  }

  const cleanUpCollectionAndSetState = (collections) => {
    const cleanedCollection = structuredClone(collections).map(sales => {
      const selections = {

        // @NOTE: Added so that we could delete selections.
        toDelete: [],
      }

      // @NOTE: If selections is already transformed, don't try to retransform the sales' selections
      if (!(sales.selections instanceof Array)) {
        return sales
      }

      for (const selection of sales.selections) {
        const product = selection.product ?? {}
        product.default_item_quantity = product.item_quantity
        product.item_quantity += selection.quantity
        selections[selection.product?.id] = selection
      }

      sales.selections = selections
      return sales
    })

    setCollectionSales(cleanedCollection)
  }

  // @PAGE_URL: /sales
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <div className='row gap-3'>
          <section className='col-xl-3 col-md-4'>
            <InvoiceForm
              persistPriceLevel={true}
              selectedCustomerState={[selectedCustomer, setSelectedCustomer]}
              salesState={[selectedSales, setSelectedSales]}
              originalState={structuredClone(collectionSales.find(sales => sales.invoice_no == selectedSales.invoice_no))}
              recalculator={[recalculate, setRecalculate]}
              onSubmitSuccess={onSubmitSuccess}
              onSaveSuccess={onSaveSuccess}
              actionType={'custom'} />

          </section>
          <section className='col-xl-8 col-md-7'>
            <h1 className='fs-3 fw-semibold mb-4'>Order history</h1>

            <nav className='mb-3 row'>
              <form className='col'>
                <input value={searchQuery} className='form-control' placeholder='Search for an invoice...' onChange={ev => setSearchQuery(ev.target.value)} />
              </form>
              <div className='col-auto'>
                <Paginator totalCount={salesCount} defaultItemCount={10}></Paginator>
              </div>
            </nav>

            <Transactions 
              searchQueryState={[searchQuery, setSearchQuery]}
              collectionSalesState={[collectionSales, setCollectionSales]}
              onClickViewSales={onClickViewSales}
              onDeleteTransaction={onDeleteTransaction}
              refreshCollections={refreshCollections} />
          </section>
        </div>
      </div>
    </DefaultLayout>
  )
}