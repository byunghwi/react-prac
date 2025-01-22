import React, { useEffect, useState, useMemo } from 'react';

const Pagination = ({ totalItems, rowsPerPage = 10, pageNo, onPaginatedLoad }) => {
  const [currentPage, setCurrentPage] = useState(pageNo || 1);
  const [displayPage] = useState(10); // 한번에 표시할 페이지 개수

  const maxPage = useMemo(() => {
    const page = Math.floor((totalItems - 1) / rowsPerPage) + 1;
    return page === 0 ? 1 : page;
  }, [totalItems, rowsPerPage]);

  const startPage = useMemo(() => {
    return Math.floor((currentPage - 1) / displayPage) * displayPage + 1;
  }, [currentPage, displayPage]);

  const endPage = useMemo(() => {
    let end = startPage + displayPage - 1;
    return end < maxPage ? end : maxPage;
  }, [startPage, displayPage, maxPage]);

  const pages = useMemo(() => {
    const list = [];
    for (let index = startPage; index <= endPage; index++) {
      list.push(index);
    }
    return list;
  }, [startPage, endPage]);

  const changePage = (clickPage, type) => {
    if (type === 'page') {
      setCurrentPage(clickPage);
      onPaginatedLoad(clickPage); // 페이지 변경 이벤트
    } else if (type === 'prev' && currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPaginatedLoad(newPage);
    } else if (type === 'next' && currentPage < maxPage) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPaginatedLoad(newPage);
    }
  };

  useEffect(() => {
    setCurrentPage(pageNo);
  }, [pageNo]);

  return (
    <div className="pagination">
      <ul>
        <li>
          <button onClick={() => changePage(1, 'page')} type="button" className="btnPrevEnd">
            &lt;&lt;
          </button>
        </li>
        <li>
          <button onClick={() => changePage('', 'prev')} type="button" className="btnPrev">
            &lt;
          </button>
        </li>
        {pages.map((p) => (
          <li key={p} className={`paginationNum ${currentPage === p ? 'on' : ''}`}>
            <button onClick={() => changePage(p, 'page')} type="button">
              {p}
            </button>
          </li>
        ))}
        <li id="btnNext">
          <button onClick={() => changePage('', 'next')} type="button" className="btnNext">
            &gt;
          </button>
        </li>
        <li>
          <button onClick={() => changePage(maxPage, 'page')} type="button" className="btnNextEnd">
            &gt;&gt;
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
