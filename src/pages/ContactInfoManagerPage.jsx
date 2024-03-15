import { useLoaderData } from "react-router-dom"
import { getContactByIdFromDatabase } from "../actions"
import { DefaultLayout } from "../layouts/DefaultLayout"

export { 
  ContactInfoManagerPage, 
  ContactInfoManagerPageDataLoader }

async function ContactInfoManagerPageDataLoader({ params }) {
  const id = atob(params.id)
  let staticContact = {}

  await getContactByIdFromDatabase(id)
    .then(res => {
      const { data } = res
      staticContact = { ...data }
    })

  return {
    staticContact,
  }
}

function ContactInfoManagerPage(props) {
  const { staticContact } = useLoaderData()

  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        ContactInfoManagerPage
        {JSON.stringify(staticContact)}
      </div>
    </DefaultLayout>
  )
}