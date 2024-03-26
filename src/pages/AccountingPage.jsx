import { DefaultLayout } from '../layouts/DefaultLayout'

export { AccountingPage }

function AccountingPage(props) {
  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        Here you will see all of the transactions that happened in the system.
      </div>
    </DefaultLayout>
  )
}