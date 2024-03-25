import { useContext, useEffect, useMemo } from 'react'
import { RootContext } from '../App'

export { Paginator }

function Paginator(props) {
  const rootContext = useContext(RootContext)
  const totalCount = props.totalCount
  const onPaginate = props.onPaginate
  const [itemCount, setItemCount] = props.itemCountState ?? rootContext.itemCountState
  const [currentPage, setCurrentPage] = props.currentPageState ?? rootContext.currentPageState

  const totalPages = useMemo(() => Math.ceil(totalCount / itemCount), [currentPage, itemCount])

  useEffect(() => {
    setItemCount(props.defaultItemCount)
  })

  const onClickPrevPage = () => {
    const updatedValue = currentPage - 1
    setCurrentPage(updatedValue)
    
    if (onPaginate) onPaginate(updatedValue, itemCount)
  }

  const onClickNextPage = () => {
    const updatedValue = currentPage + 1
    setCurrentPage(updatedValue)
    
    if (onPaginate) onPaginate(updatedValue, itemCount)
  }

  return totalPages > 1 ?
    <ul className={`pagination mb-0 ${props.className}`.trim()}>
      <li className={`page-item ${currentPage == 0 ? 'disabled' : ''}`}>
        <button type='button' className='page-link' onClick={onClickPrevPage}>
          Prev
        </button>
      </li>
      {
        Array.from(new Array(totalPages < 3 ? totalPages : 3)).map((_, i) => {
          return (
            <li className={`page-item ${i - currentPage == 0 ? 'active' : ''}`} key={i}>
              <button className='page-link' onClick={() => setCurrentPage(i)}>{i + 1}</button>
            </li>
          )
        })
      }
      <li className={`page-item ${currentPage == totalPages - 1 ? 'disabled' : ''}`}>
        <button type='button' className='page-link' onClick={onClickNextPage}>
          Next
        </button>
      </li>
    </ul>
    :
    <></>
}