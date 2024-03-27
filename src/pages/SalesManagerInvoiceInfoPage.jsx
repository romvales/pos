
import { useLoaderData } from 'react-router-dom'
import { DefaultLayout } from '../layouts/DefaultLayout'

export { SalesManagerInvoiceInfoPage }

function SalesManagerInvoiceInfoPage(props) {
  const {  salesData } = useLoaderData()

  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        
      </div>
    </DefaultLayout>
  )
}