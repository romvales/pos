import { Link } from 'react-router-dom'
import { createPublicUrlForPath, pesoFormatter } from '../actions'
import { useState } from 'react'

export { AllProducts }

function AllProducts(props) {
  const products = props.products
  
  const [searchQuery, setSearchQuery] = useState('')
  const filterFunc = (product) => {
    const patt = new RegExp(searchQuery)
    return patt.test(product.code) || patt.test(product.item_name)
  }

  return (
    <div className='container'>
      <nav className='mb-3 row'>
        <form>
          <input value={searchQuery} className='form-control' placeholder='Search for a product...' onChange={ev => setSearchQuery(ev.target.value)} />
        </form>
      </nav>

      <ul className='d-flex flex-wrap list-unstyled pb-0'>
        {
          products.filter(filterFunc).map((product, i) => {
            const uriEncodedProductName = encodeURIComponent(product.item_name)
            let itemImageUrl = 'https://placehold.co/300?text=' + product.item_name

            if (product.item_image_url) {
              itemImageUrl = createPublicUrlForPath(product.item_image_url, { transform: { width: 300, height: 300 } })
            }

            const ProductLink = (props) => (
              <Link
                style={{ textDecoration: 'none' }}
                to={{ pathname: `/products/${product.id}/${uriEncodedProductName}` }}>
                {props.children}
              </Link>
            )

            return (
              <li className='col-sm-12 col-xl-4 mb-2' key={i}>
                <div className='d-flex shadow-sm border rounded h-100 m-1'>
                  <div className='col-4 border-end'>
                    <ProductLink>
                      <picture>
                        <img src={itemImageUrl} className='object-fit-cover h-100 w-100 rounded-start' alt={`"${product.item_name}" sample photo`} />
                      </picture>
                    </ProductLink>
                  </div>
                  <div className='p-3 flex-grow-1'>
                    <ProductLink>
                      <h3 title={product.item_name} className='fs-6 fw-semibold text-primary'>
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
                          <p className='mb-0' style={{ fontSize: '0.8rem' }}>{pesoFormatter.format(product.item_cost)} ({product.item_quantity} available)</p>
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