import { createPublicUrlForPath, getProductByBarcodeFromDatabase, getProductsCountFromDatabase, getProductsFromDatabase } from '../actions'
import { useContext, useEffect, useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline'
import { addProductToSelection, deselectProductFromSelection } from './InvoiceForm'
import { RootContext } from '../App'
import { Paginator } from './Paginator'
import { debounce, throttle } from 'lodash'
import { CurrencyFormatter } from '../locales/currencies'

export { ProductListing }

const productsCount = (await getProductsCountFromDatabase()).data

function ProductListing(props) {
  const [products, setProducts] = useState(props.products ?? [])
  const [sales, setSales] = props.salesState

  const [toRefreshProducts] = props.refreshProducts
  const [recalculate, setRecalculate] = props.recalculator
  const rootContext = useContext(RootContext)
  const [searchQuery, setSearchQuery] = useState('')
  const [itemCount] = rootContext.itemCountState
  const [currentPage] = rootContext.currentPageState

  const refreshProducts = () => {
    getProductsFromDatabase(currentPage, itemCount, searchQuery)
      .then(res => {
        const { data } = res
        setProducts(data ?? [])
      })
      .catch()
  }

  const onClickAddItemToOrderSummary = (product) => {
    const productId = product.id
    const itemPriceLevels = [...product.itemPriceLevels].sort((a, b) => a.priceLevel.level_name > b.priceLevel.level_name)

    if (product.item_quantity <= 0 || !itemPriceLevels.at(0) || itemPriceLevels.at(0)?.priceLevel.price == 0) {
      return
    }

    if (sales.selections[productId]) {
      deselectProductFromSelection(productId, null, [sales, setSales])
      setRecalculate(!recalculate)
    } else {
      addProductToSelection(product, [sales, setSales])
      setRecalculate(!recalculate)
    }
  }

  const sortFn = (a, b) => {
    return a.item_quantity < b.item_quantity
  }

  useEffect(() => {
    const barcodeText = rootContext.currentBarcodeText

    if (barcodeText && barcodeText.length) {
      getProductByBarcodeFromDatabase(barcodeText)
        .then(res => {
          const { data } = res
          const productData = data

          if (productData && productData.itemPriceLevels.at(0).priceLevel.price != 0) {
            addProductToSelection(productData, [sales, setSales])
            setRecalculate(!recalculate)
            rootContext.setCurrentBarcodeText(null)
          }
        })
    }

  }, [rootContext.currentBarcodeText])

  useEffect(() => {
    if (itemCount < 12) return
    refreshProducts()
  }, [ itemCount, currentPage, toRefreshProducts, searchQuery ])

  const onChange = debounce(ev => {
    const searchQuery = ev.target.value
    setSearchQuery(searchQuery)
  }, 800)

  return (
    <div>
      <nav className='mb-3 row'>
        <form className='d-flex col'>
          <input 
            className='form-control' 
            placeholder='Search for goods...' 
            onChange={onChange} />
        </form>
        <div className='col-auto'>
          <Paginator totalCount={productsCount} defaultItemCount={12} />
        </div>
      </nav>

      <div className='container'>
        <ul className='list-unstyled row pb-0'>
          {
            products.map((product, i) => {
              const placeholderUrl = 'https://placehold.co/200?text=' + product.item_name
              let itemImageUrl = placeholderUrl

              // @NOTE: Instead of using the unit cost of a product, we'll revert to the price level 1.
              const itemPriceLevels = [...product.itemPriceLevels].sort((a, b) => a.priceLevel.level_name > b.priceLevel.level_name)

              if (product.item_image_url) {
                itemImageUrl = createPublicUrlForPath(product.item_image_url)
              }

              // Puts a border to a selected product in the product list
              const productHighlighted = sales.selections[product.id] != null ? 'productSelected' : ''

              const defaultPriceLevel = itemPriceLevels.at(0) ?? {
                priceLevel: {
                  price: 0,
                }
              }

              const isAvailable = product.item_quantity <= 0 || defaultPriceLevel.priceLevel.price == 0

              return (
                <li
                  role='button' 
                  key={i} 
                  className='d-flex col-xl-3 col-sm-6 p-1' 
                  style={{ 
                    cursor: isAvailable ? 'not-allowed' : 'pointer',
                  }} 
                  onClick={() => onClickAddItemToOrderSummary(product)}>
                  <div className={`border ${productHighlighted} shadow-sm h-100 w-100`} style={{ borderRadius: '0.45rem' }}>
                    <picture style={{ filter: isAvailable ? 'blur(2px)' : '' }}>
                      <img style={{ height: '100px', filter: isAvailable ? 'grayscale(100%)' : '' }} className='img-fluid rounded-top border-bottom w-100 object-fit-contain' src={itemImageUrl} alt='' />
                    </picture>
                    <div className='p-3 d-grid align-items-end'>
                      <h3 className='p-0 m-0 mb-2' style={{ fontWeight: 300, fontSize: '0.85rem' }}>
                        <span className='text-opacity-80'>{CurrencyFormatter.format(defaultPriceLevel.priceLevel.price)}</span> <span style={{ fontSize: '0.9rem' }} className='text-secondary fw-normal'>({CurrencyFormatter.format(product.item_cost)})</span>
                      </h3>
                      <h3 title={product.item_name} style={{ fontSize: '0.85rem' }} className={`p-0 pb-1 m-0 ${ isAvailable ? 'text-secondary' : '' } fw-normal`}>
                        {product.item_name}
                      </h3>
                      <p className='text-secondary mb-0 opacity-75 mb-1' style={{ fontSize: '0.75rem' }}>{product.code ?? 'Unknown'}</p>
                      
                      <dl className='fw-normal m-0'>
                        <dt className='d-none'>Remaining stock</dt>
                        <dd className='mb-0'>
                          <p className={`mb-0 text-secondary`} style={{ fontSize: '0.8rem' }}>
                            {
                              isAvailable ?
                                <>
                                  <span className={`mr-1 text-danger`}>Unavailable</span>
                                </>
                                :
                                <>
                                  <span className='mr-1'>Stock: {product.item_quantity}</span> (Sold: { product.item_sold })
                                </>
                            }
                          </p>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </li>
              )
            })
          }
        </ul>
      </div>
    </div>
  )
}