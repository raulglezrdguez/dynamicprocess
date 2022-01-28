import React from 'react';

import { Button } from "react-bootstrap";

import './Pagination.css';

const Pagination = (props) => {
  const {currentPage, totalPages, onChangePage} = props;

  let firstPage = Math.max(1, currentPage - 5);
  let lastPage = Math.min(totalPages, firstPage + 10);
  firstPage = Math.max(1, lastPage - 10);

  let first = null;
  // if (currentPage !== 1) {
  if (firstPage !== 1) {
    first = <Button className='PaginationItem' onClick={() => onChangePage(1)} >Primera</Button>
  }

  // let previous = null;
  // if (currentPage > 1){
  //   previous = <li>
  //       <a href="#" onClick={() => onChangePage(currentPage - 1)}>Anterior</a>
  //   </li>
  // }


  let pages = [];
  for(let i = firstPage; i <= lastPage; i++) {
    if (currentPage === i)
      pages.push(<Button key={i} className='PaginationItem' disabled >{i}</Button>);
    else
      pages.push(<Button key={i} className='PaginationItem' onClick={() => onChangePage(i)} >{i}</Button>);
  }

  // let next = null;
  // if (currentPage < totalPages) {
  //   next = <li>
  //       <a href="#" onClick={() => onChangePage(currentPage + 1)}>Próxima</a>
  //   </li>
  // }

  let last = null;
  // if (currentPage < totalPages){
  if (lastPage < totalPages){
    last = <Button className='PaginationItem' onClick={() => onChangePage(totalPages)} >Última</Button>
  }

  return(
    totalPages > 1 ?
      <div className='Pagination'>
            {first}

            {pages}

            {last}
      </div>
    : null
  )
}

export default Pagination;
