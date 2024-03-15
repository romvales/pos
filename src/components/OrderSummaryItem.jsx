
import {
  MinusIcon,
  PlusIcon
} from '@heroicons/react/outline'
import { createPublicUrlForPath, pesoFormatter } from '../actions'
import { useEffect, useState } from 'react'

export { OrderSummaryItem }

function OrderSummaryItem(props) {
  const productData = props.productData
  const sales = props.sales
  const selection = sales.selections[productData.id]
  const setSales = props.setSales
  const [recalculate, setRecalculate] = props.recalculator
  const deselectProductFromSelection = props.deselectProductFromSelection
  const selectedCustomer = props.selectedCustomer
  const selectedCustomerPriceLevel = selectedCustomer?.price_level
  const itemPriceLevels = [ ...productData.itemPriceLevels ].reverse()
  const selectedPriceLevel = itemPriceLevels[selectedCustomerPriceLevel-1]

  const checkValue = () => {
    if (selection.quantity == 0) {
      deselectProductFromSelection(productData.id)
      return 0
    } else if (productData.item_quantity-selection.quantity < 0) {
      selection.quantity = productData.item_quantity
    } else if (Number.isNaN(selection.quantity)) {
      selection.quantity = 1
    }
  }

  // Used for adding and subtracting quantity from the selection. 
  const onClickIncrementBy = (num) => {
    selection.quantity += num
    updateSelectionValues()
  }

  const onClickUsePriceLevel = () => {
    
    if (selection.price_level_id == null) {
      selection.price_level_id = selectedPriceLevel?.price_level_id
    } else {
      selection.price_level_id = null
    }

    updateSelectionValues()
  }

  const onChangeSelection = (num) => {
    selection.quantity = num
    updateSelectionValues()
  }

  const updateSelectionValues = () => {
    const clone = structuredClone(sales)

    let selectionPrice = selection.product.item_cost

    if (!selectedPriceLevel) {
      selection.price_level_id = null
    }

    if (selection.price_level_id != null) {
      selectionPrice = selectedPriceLevel?.priceLevel.price
    }

    selection.cost = selectionPrice
    selection.price = selection.quantity*selectionPrice

    if (checkValue() == 0) {
      return
    }

    clone.selections[productData.id] = selection

    setSales(clone)
    setRecalculate(!recalculate)
  }

  const placeholderUrl = `https://placehold.co/64?text=${productData.item_name}`
  let itemImageUrl = placeholderUrl

  if (productData.item_image_url.length) 
    itemImageUrl = createPublicUrlForPath(productData.item_image_url, { width: 32, height: 32 })

  useEffect(() => { updateSelectionValues() }, [ selectedCustomer ])

  return (
    <li>
      <div className='d-flex gap-3 border rounded p-3'>
        <div>
          <picture>
            <img 
              style={{ width: '64px', height: '64px' }} 
              src={itemImageUrl} 
              className={`border rounded object-fit-cover`} alt={'Product thumbnail'} />
          </picture>
        </div>
        <div className='flex-grow-1'>
          <ul className='list-unstyled mb-2'>
            <li>
              <h5 className='fs-6 fw-bold mb-0'>{productData.item_name}</h5>
            </li>
            <li className='mb-2'>
              <span className='text-secondary' style={{ fontSize: '0.8rem' }}>Dealer Name</span>
            </li>
            <li className='d-flex gap-2 align-items-center'>
              <nav className='d-flex gap-1 align-items-center'>
                <div>
                  <button type='button' className='btn btn-outline-secondary rounded-circle p-1 btn-sm d-grid align-items-center' onClick={() => onClickIncrementBy(-1)}>
                    <MinusIcon width={12} />
                  </button>
                </div>

                <input
                  type='number' 
                  value={selection.quantity}
                  className='remedyArrow form-control form-control-sm shadow-none text-center'
                  onChange={ev => onChangeSelection(ev.target.valueAsNumber)}
                  style={{ width: '2.5rem' }} />

                <div>
                  <button type='button' className='btn btn-outline-secondary rounded-circle p-1 btn-sm d-grid align-items-center' onClick={() => onClickIncrementBy(1)}>
                    <PlusIcon width={12} />
                  </button>
                </div>
              </nav>
              
              <div>
                <span className='text-secondary' style={{ fontSize: '0.8rem' }}>Stock left: {productData.item_quantity-selection.quantity}</span>
              </div>
            </li>
          </ul>

          {
            itemPriceLevels?.length && selectedCustomerPriceLevel && selectedPriceLevel?.priceLevel?.price ?
              <button type='button' className='btn btn-outline-primary bg-white text-primary btn-sm' onClick={() => onClickUsePriceLevel()}>
                {
                  selection.price_level_id != null ?
                    `Revert`  
                    :
                    `Use Price Lvl. ${selectedCustomerPriceLevel}`
                }
              </button>
              :
              <></>
          }
        </div>
        <div className='d-flex flex-column justify-content-between align-items-end'>
          <div className=''>
            <output className='text-secondary'>{pesoFormatter.format(selection.cost)}</output>
          </div>
          <div className=''>
            <output className='fw-bold'>{pesoFormatter.format(selection.price)}</output>
          </div>
        </div>
      </div>
    </li>
  )
}