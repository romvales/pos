
import { useState, useEffect, createRef, useContext } from 'react'
import { useLoaderData } from 'react-router-dom'
import { upperFirst } from 'lodash'
import { getDealerName, saveProductToDatabase, uploadFileToServer } from '../actions'
import { XIcon } from '@heroicons/react/outline'
import { RootContext } from '../App'

export { NewProductForm }

function NewProductForm(props) {
  const rootContext = useContext(RootContext)
  const placeholderUrl = 'https://placehold.co/300'
  const categories = props.categories
  const refreshProducts = props.refreshProducts
  const [itemImageUrl, setItemImageUrl] = useState(placeholderUrl)
  const [productName, setProductName] = useState('')
  const [generatedUnitCode, setGeneratedUnitCode] = useState('')
  const [focus, setFocus] = useState(false)
  const { staticDealers } = useLoaderData()
  const fileRef = createRef()
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

    saveProductToDatabase(productData)
      .then(() => {
        refreshProducts()
        form.reset()
        setProductName('')
        setItemImageUrl(placeholderUrl)
        rootContext.setCurrenctBarcodeText(null)
      })
      .catch()
  }

  const onClickFileUpload = () => {
    fileRef.current.click()
  }

  const onChangeFileUpload = () => {
    const itemImage = fileRef.current.files[0]
    setItemImageUrl(URL.createObjectURL(itemImage))
  }

  // @FEATURE: Random unit code generator
  useEffect(() => {
    // Convert the product name to base64
    let unitAlpha = btoa(productName).slice(0, 3).toLocaleUpperCase()

    const a = new Uint32Array(1)

    // If the name is not blank, append a random number for the unit code.
    if (unitAlpha.length) unitAlpha += crypto.getRandomValues(a).reduce((a, b) => a+b, 0)

    // Update the generated code
    setGeneratedUnitCode(unitAlpha)
  }, [productName])

  return (
    <div className='mb-2 position-sticky' style={{ top: '80px' }}>
      <form className='d-grid' onSubmit={onSubmit} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}>
        <div className='mb-2 position-relative'>
          <button type='button' className='btn w-100 d-flex justify-content-center p-0' style={{ border: 0 }} onClick={onClickFileUpload}>
            <picture className='d-grid justify-content-start'>
              <img src={itemImageUrl} className='object-fit-contain border rounded mx-auto mb-1' style={{ width: '300px', height: '300px' }} alt='Product image' />
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

        <div className='mb-2'>
          <div className='form-floating'>
            <input name='dealer_id' className='form-control' list='dealersOption' id='dealerInput' autoComplete='off' required />
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
                <input name='item_cost' className='form-control' id='unitCostInput' required />
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
            <input name='barcode' defaultValue={rootContext.currentBarcodeText} className='form-control' id='barcodeInput' />
            <label htmlFor='barcodeInput'>Barcode</label>
          </div>
        </div>

        <div className='mb-2'>
          <div className='form-floating'>
            <input name='unit' className='form-control' id='unitTypeInput' required />
            <label htmlFor='unitTypeInput' className='form-label'>*Unit Type (e.g. pcs)</label>
          </div>
        </div>

        <div className='mb-2'>
          <div className='form-floating'>
            <input type='number' defaultValue={0} name='item_quantity' className='form-control' id='unitQuantityInput' required />
            <label htmlFor='unitQuantityInput' className='form-label'>*Unit Quantity</label>
          </div>
        </div>

        <input type='submit' className='btn btn-primary fs-5 p-3' value='Add Product' />
      </form>
    </div>
  )
}