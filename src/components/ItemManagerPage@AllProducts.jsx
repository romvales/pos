import { Link } from 'react-router-dom'
import { createPublicUrlForPath, getProductsCountFromDatabase, getProductsFromDatabase } from '../actions'
import { useContext, useEffect, useState } from 'react'
import { RootContext } from '../App'
import { Paginator } from './Paginator'
import { debounce } from 'lodash'
import { CurrencyFormatter } from '../locales/currencies'

export { AllProducts }

const productsCount = (await getProductsCountFromDatabase()).data

function AllProducts(props) {
  const rootContext = useContext(RootContext)
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState(props.products)
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

  useEffect(() => {
    if (itemCount < 10) return
    refreshProducts()
  }, [ currentPage, itemCount, searchQuery ])

  useEffect(() => {
    setProducts(props.products)
  }, [ props.products ])

  const onChange = debounce(ev => {
    const searchQuery = ev.target.value
    setSearchQuery(searchQuery)
  }, 500)

  return (
    <div className='container'>
      <nav className='mb-3 row'>
        <form className='col'>
          <input className='form-control' placeholder='Search for goods...' onChange={onChange} />
        </form>
        <div className='col-auto'>
          <Paginator totalCount={productsCount} defaultItemCount={12} />
        </div>
      </nav>

      <ul className='d-flex flex-wrap list-unstyled pb-0'>
        {
          products.map((product, i) => {
            const uriEncodedProductName = encodeURIComponent(product.item_name)
            let itemImageUrl = 'https://placehold.co/300?text=' + product.item_name

            if (product.item_image_url) {
              itemImageUrl = createPublicUrlForPath(product.item_image_url)
            }

            const ProductLink = (props) => (
              <Link
                style={{ textDecoration: 'none' }}
                to={{ pathname: `/stocks/p/${product.id}/${uriEncodedProductName}` }}>
                {props.children}
              </Link>
            )

            // @NOTE: Instead of using the unit cost of a product, we'll revert to the price level 1.
            const itemPriceLevels = [...product.itemPriceLevels].sort((a, b) => a.priceLevel.level_name > b.priceLevel.level_name)

            return (
              <li className='col-sm-12 col-xl-4 mb-2' key={i}>
                <div className='d-flex shadow-sm border rounded h-100 m-1'>
                  <div className='col-4 border-end'>
                    <ProductLink>
                      <picture>
                        <img src={itemImageUrl} className='object-fit-contain h-100 w-100 rounded-start' alt={`"${product.item_name}" sample photo`} />
                      </picture>
                    </ProductLink>
                  </div>
                  <div className='p-3 flex-grow-1'>
                    <ProductLink>
                      <h3 title={product.item_name} className='fs-6 fw-normal text-primary'>
                        {product.item_name}
                      </h3>
                    </ProductLink>

                    <dl className='fw-normal'>
                      <dt className='d-none'>Product code</dt>
                      <dd className='mb-0'>
                        <p className='text-secondary mb-0 opacity-75' style={{ fontSize: '0.8rem' }}>{product.code ?? 'Unknown'}</p>
                      </dd>
                      <dt className='d-none'>Remaining stock</dt>
                      <dd className='mb-0'>
                        <p className='text-secondary mb-0' style={{ fontSize: '0.8rem' }}>Stock: {product.item_quantity} ({product.item_sold} sold)</p>
                      </dd>

                      <div className='mt-2'>
                        <dt style={{ fontSize: '0.8rem' }} className='fw-semibold initialism text-capitalize'>
                          Dealer Name
                        </dt>
                        <dd className='mb-0 text-secondary'>
                          <p className='mb-0' style={{ fontSize: '0.8rem' }}>{product.dealer?.company_name ?? 'Unknown'}</p>
                        </dd>
                        <dt style={{ fontSize: '0.8rem' }} className='fw-semibold initialism text-capitalize'>
                          Price
                        </dt>
                        <dd className='mb-0 text-secondary'>
                          <p className='mb-0' style={{ fontSize: '0.8rem' }}>{CurrencyFormatter.format(itemPriceLevels.at(0)?.priceLevel.price ?? 0)} ({product.item_quantity} available)</p>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}