import { Link } from "react-router-dom"
import { createPublicUrlForPath, pesoFormatter } from "../actions"
import { useState } from "react"

export { ProductListing }

function ProductListing(props) {
  const products = props.products ?? []
  const [searchQuery, setSearchQuery] = useState('')
  const addProductToSelection = props.addProductToSelection
  const deselectProductFromSelection = props.deselectProductFromSelection
  const sales = props.sales

  const onClickAddItemToOrderSummary = (product) => {
    const productId = product.id

    if (sales.selections[productId]) {
      deselectProductFromSelection(productId)
    } else {
      addProductToSelection(product)
    }
  }

  const filterFunc = (product) => {
    const patt = new RegExp(searchQuery)

    return patt.test(product.code) || patt.test(product.item_name)
  }

  return (
    <div>
      <nav className='mb-3 row'>
        <form>
          <input value={searchQuery} className='form-control' placeholder='Search for a product...' onChange={ev => setSearchQuery(ev.target.value)} />
        </form>
      </nav>

      <div className='container'>
        <ul className='list-unstyled row pb-0'>
          {
            products.filter(filterFunc).map((product, i) => {
              const uriEncodedProductName = encodeURIComponent(product.item_name)
              const placeholderUrl = 'https://placehold.co/200?text=' + product.item_name
              let itemImageUrl = placeholderUrl

              if (product.item_image_url) {
                itemImageUrl = createPublicUrlForPath(product.item_image_url, { width: 200, height: 200 })
              }

              const ProductLink = (props) => (
                <Link
                  style={{ textDecoration: 'none' }}
                  to={{ pathname: `/products/${product.id}/${uriEncodedProductName}` }}
                  target='_blank'>
                  {props.children}
                </Link>
              )

              const productHighlighted = sales.selections[product.id] != null ? 'border-primary border-2 border-opacity-75' : ''

              return (
                <li 
                  role='button' key={i} className='d-flex col-xl-4 col-sm-6 p-1' style={{ cursor: 'pointer' }} onClick={() => onClickAddItemToOrderSummary(product)}>
                  <div className={`border ${productHighlighted} shadow-sm h-100 w-100`} style={{ borderRadius: '0.45rem' }}>
                    <picture>
                      <img style={{ height: '150px' }} className='img-fluid rounded-top border-bottom w-100 object-fit-cover' src={itemImageUrl} alt='' />
                    </picture>
                    <div className='px-3 py-2'>
                      <h3 title={product.item_name} className='p-0 m-0 mb-2' style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                        {pesoFormatter.format(product.item_cost)}
                      </h3>
                      <h3 title={product.item_name} style={{ fontSize: '0.95rem' }} className='p-0 m-0 text-secondary fw-semibold'>
                        {product.item_name}
                      </h3>
                      <dl className='fw-normal m-0'>
                        <dt className='d-none'>Product code</dt>
                        <dd className='mb-0'>
                          <p className='text-secondary mb-0 opacity-75' style={{ fontSize: '0.8rem' }}>{product.code ?? 'Unknown'}</p>
                        </dd>
                        <dt className='d-none'>Remaining stock</dt>
                        <dd className='mb-0'>
                          <p className='text-secondary mb-0' style={{ fontSize: '0.8rem' }}>Stock: {product.item_quantity}</p>
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