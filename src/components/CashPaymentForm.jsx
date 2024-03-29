import { CurrencyFormatter } from '../locales/currencies'

export { CashPaymentForm }

function CashPaymentForm(props) {
  const sales = props.sales
  const setSales = props.setSales
  const isValid = props.isValid

  const onChange = (ev) => {
    const clone = structuredClone(sales)
    clone.amount_paid = ev.target.valueAsNumber

    if (isValid) {
      clone.change_due = clone.amount_paid-clone.total_due
    }

    setSales(clone)
  }

  return (
    <section className='d-flex gap-3 py-3 rounded border shadow-sm mb-3'>
      <div className='flex-grow-1'>
        <ul className='list-unstyled mb-2'>
          <li>
            <h4 className='fs-6 fw-semibold mb-0'>Cash Payment</h4>
          </li>
          <li>
            <span style={{ fontSize: '0.8rem' }} className='text-secondary'>Enter the tendered cash amount by the customer.</span>
          </li>
        </ul>
        
        <div>
          <div className='form-floating mb-1'>
            <input 
              onChange={onChange}
              type='number' 
              name='amount_paid'  
              value={sales.amount_paid.toString()}
              className='remedyArrow form-control shadow-none' 
              id='amountPaid'
              required />
            <label htmlFor='amountPaid' className='form-label fs-6'>* Amount</label>
          </div>
          {
            isValid ?
              <p style={{ fontSize: '0.86rem' }} className='text-secondary'>Change: {CurrencyFormatter.format(sales.amount_paid-sales.total_due)}</p>
              :
              <>
              
              </>
          }
        </div>
      </div>
    </section>
  )
}