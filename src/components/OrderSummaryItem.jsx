
import {
  MinusIcon,
  PlusIcon
} from '@heroicons/react/outline'
import { createPublicUrlForPath, getDealerName, getFullName, pesoFormatter } from '../actions'
import { useEffect, useState } from 'react'
import { deselectProductFromSelection } from './InvoiceForm'

export { OrderSummaryItem }

function OrderSummaryItem(props) {
  const productData = props.productData

  if (!productData) {
    return (
      <li>
        <div className='d-flex gap-3 border rounded p-3 text-secondary'>
          The product was deleted...
        </div>
      </li>
    )
  }

  const [sales, setSales] = props.salesState
  const [recalculate, setRecalculate] = props.recalculator

  const selection = sales.selections[productData.id] ?? {}
  const selectedCustomer = props.selectedCustomer
  const originalSalesState = props.originalState
  const persistPriceLevel = props.persistPriceLevel ?? false
  const selectedCustomerPriceLevel = selectedCustomer?.price_level

  // @NOTE: Instead of using the unit cost of a product, we'll revert to the price level 1.
  const itemPriceLevels = [...productData.itemPriceLevels].sort((a, b) => a.priceLevel.level_name > b.priceLevel.level_name)
  const selectedPriceLevel = itemPriceLevels[selectedCustomerPriceLevel - 1]

  const checkValue = () => {
    if (selection?.quantity === 0) {
      deselectProductFromSelection(productData.id, originalSalesState, props.salesState)
      setRecalculate(!recalculate)
      return 0
    } else if (productData.item_quantity - selection?.quantity < 0) {
      selection.quantity = productData.item_quantity
    } else if (Number.isNaN(selection?.quantity)) {
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

    if (checkValue() == 0) {
      return
    }

    let selectionPrice = /** selection.product.item_cost */ itemPriceLevels[0].priceLevel.price

    if (!selectedPriceLevel) {
      selection.price_level_id = null
    }

    if (selection.price_level_id != null) {
      selectionPrice = selectedPriceLevel?.priceLevel.price
    }

    selection.cost = selectionPrice
    selection.price = selection.quantity * selectionPrice

    clone.selections[productData.id] = selection

    setSales(clone)
    setRecalculate(!recalculate)
  }

  const placeholderUrl = `https://placehold.co/64?text=${productData.item_name}`
  let itemImageUrl = placeholderUrl

  if (productData.item_image_url.length)
    itemImageUrl = createPublicUrlForPath(productData.item_image_url)

  useEffect(() => {
    updateSelectionValues()
    if (persistPriceLevel) selection.price_level_id = null
  }, [selectedCustomer])

  return (
    <li>
      <div className='d-flex flex-column border rounded px-3 pt-3 pb-2 align-items-end'>
        <div className='d-flex'>
          <div>
            <picture>
              <img
                style={{ width: '48px', height: '48px' }}
                src={itemImageUrl}
                className={`border rounded object-fit-cover`} alt={'Product thumbnail'} />
            </picture>
          </div>
          <div className='flex-grow-1 px-2'>
            <ul className='list-unstyled'>
              <li>
                <h5 style={{ fontSize: '0.9rem' }} className='fw-semibold mb-0'>{productData.item_name}</h5>
              </li>
              <li>
                <p className='text-secondary mb-1' style={{ fontSize: '0.8rem' }}>
                  {productData.code} (Stock: {productData.item_quantity})
                </p>
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
                    value={selection?.quantity?.toString()}
                    className='remedyArrow form-control form-control-sm shadow-none text-center'
                    onChange={ev => onChangeSelection(ev.target.valueAsNumber)}
                    style={{ width: '2rem' }} />

                  <div>
                    <button type='button' className='btn btn-outline-secondary rounded-circle p-1 btn-sm d-grid align-items-center' onClick={() => onClickIncrementBy(1)}>
                      <PlusIcon width={12} />
                    </button>
                  </div>
                </nav>
              </li>
            </ul>

            {
              itemPriceLevels?.length && selectedCustomerPriceLevel && selectedPriceLevel?.priceLevel?.price && selectedCustomerPriceLevel != 1 ?
                <button 
                  type='button' 
                  style={{ fontSize: '0.7rem' }}
                  className='btn btn-outline-primary bg-white text-primary btn-sm mt-2' 
                  onClick={() => onClickUsePriceLevel()}>
                  {
                    selection?.price_level_id != null ?
                      `Revert`
                      :
                      `Use ${pesoFormatter.format(selectedPriceLevel?.priceLevel?.price)} (Lvl. ${selectedCustomerPriceLevel})`
                  }
                </button>
                :
                <></>
            }

          </div>

          <div className='d-flex flex-column justify-content-between align-items-end'>
            <div className=''>
              <output className='text-secondary'>{pesoFormatter.format(selection?.cost)}</output>
            </div>
          </div>
        </div>
        <div className=''>
          <output className='fw-bold'>{pesoFormatter.format(selection?.price)}</output>
        </div>
      </div>
    </li>
  )
}