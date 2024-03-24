import { Link, useLoaderData } from 'react-router-dom'
import { useContext, useEffect } from 'react'
import { deleteSales, getFullName, getSalesCountFromDatabase, pesoFormatter } from '../actions'
import { DefaultLayout } from '../layouts/DefaultLayout'
import { useState } from 'react'
import { InvoiceForm, defaultSale } from '../components/InvoiceForm'
import { SalesManagerPageDataLoader } from './loaders'
import { Paginator } from '../components/Paginator'
import { Transactions } from '../components/Transactions'
import { debounce } from 'lodash'
import { RootContext } from '../App'

export {
  SalesManagerPage,
}

const salesCount = (await getSalesCountFromDatabase()).data

function SalesManagerPage(props) {
  const { staticSales } = useLoaderData()

  const rootContext = useContext(RootContext)
  const [collectionSales, setCollectionSales] = useState(staticSales)
  const [selectedSales, setSelectedSales] = useState(structuredClone(defaultSale))
  const [selectedCustomer, setSelectedCustomer] = useState()
  const [searchQuery, setSearchQuery] = useState('')
  const [recalculate, setRecalculate] = useState()
  const [currentPage] = rootContext.currentPageState
  const [itemCount] = rootContext.itemCountState

  const refreshCollections = () => {
    SalesManagerPageDataLoader({ pageNumber: currentPage, itemCount, searchQuery })
      .then(({ staticSales }) => {
        cleanUpCollectionAndSetState(staticSales)
      })
  }

  // @FEATURE: Deletes a sale from the database
  const onDeleteTransaction = (sale) => {
    deleteSales(sale)
      .then(
        () => refreshCollections()
      )
  }

  // @FEATURE: Change the selected sales to display in the invoice form
  const onClickViewSales = (sales) => {
    setSelectedSales(sales)
    setSelectedCustomer(sales.customer)
  }

  const onSubmitSuccess = () => {
    refreshCollections()
  }

  const onSaveSuccess = () => {
    refreshCollections()
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
  
  useEffect(() => { 
    if (itemCount < 10) return
    refreshCollections()
  }, [ searchQuery ])

  const onChange = debounce(ev => {
    const searchQuery = ev.target.value
    setSearchQuery(searchQuery)
  }, 800)

  // @PAGE_URL: /sales
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <nav aria-label='breadcrumb'>
          <ol className='breadcrumb'>
            <li className='breadcrumb-item'>
              <Link className='' to={{ pathname: '/' }}>Home</Link>
            </li>
            <li className='breadcrumb-item active' aria-current='page'>Sales</li>
          </ol>
        </nav>

        <div className='row'>
          Overview Hero
        </div>

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
            <h1 className='fs-3 fw-semibold mb-4'>All transactions</h1>

            <nav className='mb-3 row'>
              <form className='col'>
                <input className='form-control' placeholder='Search for an invoice...' onChange={onChange} />
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