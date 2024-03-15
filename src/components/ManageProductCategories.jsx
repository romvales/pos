import { createRef } from 'react'

import { PlusIcon, TrashIcon } from '@heroicons/react/outline'
import { deleteProductCategory, getProductCategoriesFromDatabase, saveProductCategoryToDatabase } from '../actions'
import { upperFirst } from 'lodash'

export { ManageProductCategories }

function ManageProductCategories(props) {
  const formRef = createRef()
  const closePopup = createRef()

  const categories = structuredClone(props.categories ?? [])
  const updateCategories = props.updateCategories

  const refreshCategory = () => {
    getProductCategoriesFromDatabase()
      .then(res => {
        const { data } = res
        updateCategories(data)
      })
  }

  const onSubmitAddCategory = (ev) => {
    ev.preventDefault()

    const form = ev.target
    const formData = new FormData(form)

    const categoryData = Object.fromEntries(formData)
    
    if (form.checkValidity()) {
      saveProductCategoryToDatabase(categoryData)
        .then(() => {
          refreshCategory()
          form.reset()
        })
        .catch()
    }
  }

  const onClickDeleteCategory = (categoryData) => {
    deleteProductCategory(categoryData)
      .then(() => {
        refreshCategory()
      })
      .catch()
  }

  return (
    <div className='modal fade' id='manageCategory' tabIndex='-1' aria-labelledby='manageCategoryModal' aria-hidden='true' data-bs-backdrop='static' data-bs-keyboard='false'>
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h1 className='modal-title fs-6 fw-bold text-secondary' id='manageCategoryModal'>Manage product categories</h1>
            <button ref={closePopup} type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' onClick={() => formRef.current.reset()}></button>
          </div>
          <div className='modal-body'>
            <form ref={formRef} className='d-flex align-items-center gap-2' onSubmit={onSubmitAddCategory}>
              <div className='flex-grow-1'>
                <input
                  name='class'
                  placeholder='Category name'
                  className='form-control d-flex shadow-none'
                  id='locationInput'
                  required />
              </div>

              <div>
                <button type='submit' className='btn btn-primary'>
                  <PlusIcon width={16} />
                </button>
              </div>
            </form>

            <table className='table'>
              <thead>
                <tr>
                  <th colSpan={2} className='text-secondary'>
                    Category
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  categories.map((category, i) => {

                    return (
                      <tr key={i}>
                        <td className='align-middle'>
                          {upperFirst(category.class)}
                        </td>
                        <td className='d-flex align-items-center justify-content-end'>
                          <button className='btn border-0' onClick={() => onClickDeleteCategory(category)}>
                            <TrashIcon width={20} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

