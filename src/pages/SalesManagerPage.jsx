import { Link, useLoaderData } from 'react-router-dom'
import { createRef, useEffect } from 'react'
import { deleteSales, deleteSalesSelections, getSalesCountFromDatabase } from '../actions'
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

  const searchRef = createRef()
  const [collectionSales, setCollectionSales] = useState(staticSales)
  const [selectedSales, setSelectedSales] = useState(structuredClone(defaultSale))
  const [selectedCustomer, setSelectedCustomer] = useState()
  const [recalculate, setRecalculate] = useState()

  const [currentPage, setCurrentPage] = useState(0)
  const [itemCount, setItemCount] = useState(16)

  const refreshCollections = (searchQuery, updatedValue, overrideItemCount) => {
    SalesManagerPageDataLoader(
      {
        pageNumber: updatedValue ?? currentPage,
        itemCount: overrideItemCount ?? itemCount,
        searchQuery,
        fetchOnlySales: true
      },
    )
      .then(({ staticSales }) => {
        cleanUpCollectionAndSetState(staticSales)
      })
  }



  // @FEATURE: Change the selected sales to display in the invoice form
  const onClickViewSales = (sales) => {
    setSelectedSales(sales)
    setSelectedCustomer(sales.customer)
  }

  // @FEATURE: Deletes all selected sales from the database
  const onDeleteSelections = (checkedSales, currentPage, itemCount) => {
    return deleteSalesSelections(Object.values(checkedSales).map(sales => ({ id: sales.id })))
      .then(() => {
        refreshCollections(searchRef.current?.value, currentPage, itemCount)
      })
  }

  const onSubmitSuccess = () => {
    refreshCollections(searchRef.current?.value)
  }

  const onSaveSuccess = () => {
    refreshCollections(searchRef.current?.value)
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
        product.default_item_sold = product.item_sold
        product.item_quantity += selection.quantity
        selections[selection.product?.id] = selection
      }

      sales.selections = selections
      return sales
    })

    setCollectionSales(cleanedCollection)
  }

  const onChange = debounce(() => {
    const searchQuery = searchRef.current?.value
    refreshCollections(searchQuery)
  }, 300)

  const onPaginate = (updatedValue, itemCount) => {
    const searchQuery = searchRef.current.value
    refreshCollections(searchQuery, updatedValue, itemCount)
  }

  const Breadcrumbs = () => (
    <nav aria-label='breadcrumb'>
      <ol className='breadcrumb'>
        <li className='breadcrumb-item'>
          <Link className='' to={{ pathname: '/' }}>Home</Link>
        </li>
        <li className='breadcrumb-item active' aria-current='page'>Sales</li>
      </ol>
    </nav>
  )

  useEffect(() => {
    cleanUpCollectionAndSetState(staticSales)
  }, [])

  // @PAGE_URL: /sales
  return (
    <DefaultLayout Breadcrumbs={Breadcrumbs}>
      <div className='container mx-auto'>
        <Breadcrumbs />

        <div className='row gap-3'>
          <section className='col-xl-8 col-md-7'>
            <h1 className='fs-3 fw-semibold mb-4'>Sales history</h1>

            <nav className='mb-3 row'>
              <form className='col'>
                <input ref={searchRef} className='form-control' placeholder='Search for an invoice...' onChange={onChange} />
              </form>
              <div className='col-auto'>
                <Paginator
                  totalCount={salesCount}
                  defaultItemCount={16}
                  itemCountState={[itemCount, setItemCount]}
                  currentPageState={[currentPage, setCurrentPage]}
                  onPaginate={onPaginate}></Paginator>
              </div>
            </nav>

            <Transactions
              collectionSalesState={[collectionSales, setCollectionSales]}
              onClickViewSales={onClickViewSales}
              onDeleteSelections={onDeleteSelections}
              refreshCollections={refreshCollections}
              currentPageState={[currentPage, setCurrentPage]}
              itemCountState={[itemCount, setItemCount]} />
          </section>

          <section className='col-xl-3 col-md-4'>
            <InvoiceForm
              persistPriceLevel={true}
              selectedCustomerState={[selectedCustomer, setSelectedCustomer]}
              salesState={[selectedSales, setSelectedSales]}
              originalState={structuredClone(collectionSales.find(sales => sales.invoice_no === selectedSales.invoice_no))}
              recalculator={[recalculate, setRecalculate]}
              onSubmitSuccess={onSubmitSuccess}
              onSaveSuccess={onSaveSuccess}
              actionType={'custom'} />

          </section>
        </div>
      </div>
    </DefaultLayout>
  )
}