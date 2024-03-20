import { useContext, useEffect, useMemo } from 'react'
import { RootContext } from '../App'

export { Paginator }

function Paginator(props) {
  const rootContext = useContext(RootContext)
  const totalCount = props.totalCount

  const [pageNumber, setPageNumber] = rootContext.pageNumberState
  const [itemCount, setItemCount] = rootContext.itemCountState
  const [currentPage, setCurrentPage] = rootContext.currentPageState

  const totalPages = useMemo(() => Math.ceil(totalCount/itemCount), [ pageNumber, itemCount ])

  useEffect(() => {
    setItemCount(props.defaultItemCount)
  })

  return (
    <ul className={`pagination mb-0 ${props.className}`.trim()}>
      <li className={`page-item ${currentPage == 0 ? 'disabled' : ''}`}>
        <button type='button' className='page-link' onClick={() => setCurrentPage(currentPage - 1)}>
          Prev
        </button>
      </li>
      {
        Array.from(new Array(totalPages < 3 ? totalPages : 3)).map((_, i) => {
          return (
            <li className={`page-item ${i - currentPage == 0 ? 'active' : ''}`} key={i}>
              <a className='page-link' href='#'>{i + 1}</a>
            </li>
          )
        })
      }
      <li className={`page-item ${currentPage == totalPages - 1 ? 'disabled' : ''}`}>
        <button type='button' className='page-link' onClick={() => setCurrentPage(currentPage + 1)}>
          Next
        </button>
      </li>
    </ul>
  )
}