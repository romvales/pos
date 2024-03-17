import { useLoaderData, useNavigate } from 'react-router-dom'
import { DefaultLayout } from '../layouts/DefaultLayout'
import { XIcon } from '@heroicons/react/outline'
import { createPublicUrlForPath, deleteProduct, getDealerName, saveProductToDatabase, uploadFileToServer } from '../actions'
import { createRef, useEffect, useState } from 'react'
import { upperFirst } from 'lodash'
import { ManageProductCategories } from '../components/ManageProductCategories'

export {
  ItemManagerProductInfoPage,
}

const cleanItemPriceLevels = (itemPriceLevels) => {
  return itemPriceLevels.map(itemPriceLevel => {
    const priceLevel = itemPriceLevel.priceLevel

    return {
      priceLevels: {
        id: priceLevel.id,
        level_name: priceLevel.level_name,
        code: priceLevel.code,
        price: priceLevel.price,
      },
      itemPriceLevels: {
        id: itemPriceLevel.id,
        item_id: itemPriceLevel.item_id,
        price_level_id: itemPriceLevel.price_level_id,
      },
    }
  })
}

function ItemManagerProductInfoPage(props) {
  const { staticProduct, staticDealers, staticCategories } = useLoaderData()

  const fileRef = createRef()
  const navigate = useNavigate()
  const [product] = useState(staticProduct)
  const [categories, setCategories] = useState(staticCategories)
  const placeholderUrl = `https://placehold.co/300?text=${product.item_name}`
  const [itemImageUrl, setItemImageUrl] = useState(placeholderUrl)
  const [productName, setProductName] = useState(product.item_name)
  const [generatedUnitCode, setGeneratedUnitCode] = useState(product.code)
  const [priceLevels, setPriceLevels] = useState([ ...cleanItemPriceLevels(product.itemPriceLevels) ].reverse())
  const mapStaticDealersByDealerName = {}

  for (const dealer of staticDealers) {
    mapStaticDealersByDealerName[getDealerName(dealer)] = dealer
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()

    const form = ev.target
    const formData = new FormData(form)
    const productData = Object.fromEntries(formData)

    // @FEATURE: Upload product image to the server
    if (productData.item_image.name) {
      await uploadFileToServer(productData.item_image)
        .then(res => {
          const { data } = res
          productData.item_image_url = data.path
        })
        .catch()
    }

    // Remove the unwanted file from the productData
    delete productData.item_image

    // Indexes the dealer id using the dealer's name in the form
    productData.dealer_id = mapStaticDealersByDealerName[productData.dealer_id].id
    productData.priceLevels = priceLevels

    saveProductToDatabase(productData)
      .then(() => {})
      .catch()
  }

  const onClickFileUpload = () => {
    fileRef.current.click()
  }

  const onChangeFileUpload = () => {
    const itemImage = fileRef.current.files[0]
    setItemImageUrl(URL.createObjectURL(itemImage))
  }

  // @FEATURE: Delete a product and navigate back to /products
  const onDeleteProduct = () => {
    deleteProduct(product)
      .then(() => {
        navigate({ pathname: '/products' })
      })
  }

  // 
  const addPriceLevel = () => {
    const clone = structuredClone(priceLevels)
    priceLevels.unshift({
      priceLevels: {
        level_name: encodeURIComponent(product.item_name) + `_price_level_${priceLevels.length + 1}`,
        code: crypto.getRandomValues(new Uint32Array(2)).reduce((a, b) => a + b),
        price: 0,
      },
      itemPriceLevels: {
        item_id: product.id,
      }
    })
    setPriceLevels(clone)
  }

  useEffect(() => {
    if (product.item_image_url.length) setItemImageUrl(createPublicUrlForPath(product.item_image_url, { width: 300, height: 300 }))

    // When the price levels of a product is empty, add default price levels
    for (let i = 0; i <= 5; i++) {
      if (priceLevels.length > 5) break
      addPriceLevel()
    }
  }, [])

  // @PAGE_URL: /products/<product-name>
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <form className='d-flex gap-4' onSubmit={onSubmit}>
          <input name='id' type='number' className='d-none' aria-hidden={true} defaultValue={product.id} />
          <div className='mb-2 position-relative'>
            <div className='mb-2'>
              <button type='button' className='btn w-100 d-flex justify-content-center p-0' style={{ border: 0 }} onClick={onClickFileUpload}>
                <picture className='d-grid justify-content-start'>
                  <img src={itemImageUrl} className='object-fit-cover border rounded mx-auto mb-1' style={{ width: '300px', height: '300px' }} alt='Product image' />
                  <figcaption style={{ fontSize: '0.8rem' }} className='text-start text-secondary'>Upload an image of the product</figcaption>
                </picture>
              </button>
              {
                itemImageUrl != placeholderUrl ?
                  <button
                    style={{ transform: 'translateY(-1.05rem) translateX(1.05rem)' }}
                    type='button'
                    className={`btn btn-danger p-2 d-grid rounded-circle position-absolute top-0 end-0`}
                    onClick={() => setItemImageUrl(placeholderUrl)}>
                    <XIcon width={16} height={16} />
                  </button>
                  :
                  <></>
              }
              <input ref={fileRef} name='item_image' type='file' className='d-none' accept='image/*' onChange={onChangeFileUpload} />
            </div>
          </div>

          <div className='flex-grow-1'>
            <div className='mb-2'>
              <div className='form-floating'>
                <input
                  name='dealer_id'
                  defaultValue={getDealerName(product.dealer)}
                  className='form-control'
                  list='dealersOption'
                  id='dealerInput'
                  autoComplete='off'
                  required />
                <label htmlFor='dealerInput'>*Dealer</label>
                <datalist id="dealersOption">
                  {
                    staticDealers.map((dealer, i) => {
                      const dealerName = getDealerName(dealer)

                      return (
                        <option key={i} value={dealerName}>
                          {dealerName}
                        </option>
                      )
                    })
                  }
                </datalist>
              </div>
            </div>

            <div className='d-flex gap-2'>
              <div className='col'>
                <div className='mb-2'>
                  <div className='form-floating'>
                    <select id='categoryInput' className='form-select' name='item_type_id' required>
                      {
                        categories.map((category, i) => {
                          return (
                            <option key={i} value={category.id}>{upperFirst(category.class)}</option>
                          )
                        })
                      }
                    </select>
                    <label htmlFor='categoryInput' className='form-label fs-6'>*Category</label>
                  </div>
                  <div>
                    <button
                      type='button'
                      className='btn btn-link p-0 m-0 '
                      style={{ fontSize: '0.75rem', textDecoration: 'none' }}
                      data-bs-toggle='modal'
                      data-bs-target='#manageCategory'>
                      Manage categories
                    </button>
                  </div>
                </div>
              </div>
              <div className='col'>
                <div className='mb-2'>
                  <div className='form-floating'>
                    <input type='number' name='item_cost' defaultValue={product.item_cost} className='remedyArrow form-control' id='unitCostInput' required />
                    <label htmlFor='unitCostInput' className='form-label fs-6'>*Unit Cost</label>
                  </div>
                </div>
              </div>
            </div>

            <div className='mb-2'>
              <div className='form-floating'>
                <input name='item_name' value={productName} className='form-control' id='nameInput' onChange={ev => setProductName(ev.target.value)} required />
                <label htmlFor='companyAddressInput'>*Name/Description</label>
              </div>
            </div>

            <div className='mb-2'>
              <div className='form-floating'>
                <input name='code' value={generatedUnitCode} className='form-control text-secondary' id='unitCodeInput' onChange={ev => setGeneratedUnitCode(ev.target.value)} />
                <label htmlFor='unitCodeInput'>Unit Code</label>
              </div>
            </div>

            <div className='mb-2'>
              <div className='form-floating'>
                <input name='barcode' defaultValue={product.barcode} className='form-control' id='barcodeInput' />
                <label htmlFor='barcodeInput'>Barcode</label>
              </div>
            </div>

            <div className='mb-2'>
              <div className='form-floating'>
                <input name='unit' defaultValue={product.item_unit_type} className='form-control' id='unitTypeInput' required />
                <label htmlFor='unitTypeInput' className='form-label'>*Unit Type (e.g. pcs)</label>
              </div>
            </div>

            <div className='mb-2'>
              <div className='form-floating'>
                <input type='number' defaultValue={product.item_quantity} name='item_quantity' className='form-control' id='unitQuantityInput' required />
                <label htmlFor='unitQuantityInput' className='form-label'>*Unit Quantity</label>
              </div>
            </div>

            <div className='d-flex justify-content-start gap-2'>
              <input type='submit' className='btn btn-primary btn-sm fs- p-3' value='Save Product' />
              <button type='button' className='btn btn-outline-secondary btn-sm fs- p-3' onClick={onDeleteProduct}>
                Delete Button
              </button>
            </div>
          </div>

          <div className=''>
            <h3 className='fs-6 fw-semibold'>Product price levels</h3>

            <div className='d-flex flex-column gap-2'>
              {
                priceLevels.reverse().map((level, i) => {
                  
                  const onValueChange = (ev) => {
                    const clonePriceLevels = structuredClone(priceLevels)
                    const newPriceValue = Number(ev.target.value)

                    if (!Number.isNaN(newPriceValue)) {
                      clonePriceLevels[i].priceLevels.price = newPriceValue
                    }

                    setPriceLevels(clonePriceLevels)
                  }

                  return (
                    <div key={i} className='form-floating'>
                      <input 
                        type='number'
                        className='remedyArrow form-control' 
                        id='priceLevelInput' 
                        value={level.priceLevels.price.toString()} 
                        onChange={onValueChange} />
                      <label htmlFor='priceLevelInput' className='form-label fs-6'>Level {i+1}</label>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </form>

        <ManageProductCategories
          categories={categories}
          updateCategories={setCategories} />
      </div>
    </DefaultLayout>
  )
}