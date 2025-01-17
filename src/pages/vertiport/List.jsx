import {useEffect, useState} from 'react';
import useVertiportStore from "../../stores/vertiport";
import { useNavigate } from 'react-router-dom';
import useModalStore from '../../stores/modal';

export default function List() {
  const navigate = useNavigate();
  const [srchType, setSrchType] = useState("");
  const [srchValue, setSrchValue] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const { vertiportList, actions: { getVertiportList }} = useVertiportStore();
  const { showLoading, hideLoading } = useModalStore();

  const handelSearchType = (e) => {
    console.log('handleSearch type...', e.target.value);
    setSrchType(e.target.value);
  }

  const handleSearchValue = (e) => {
    console.log('handleSearch value...', e.target.value);
    setSrchValue(e.target.value);
  }

  const handleSearch = () => {
    paginatedLoad(1);
  }

  const paginatedLoad = async(payload) => {
    showLoading();
    setPageNo(payload);
    await getVertiportList(true, {pageNo: pageNo, srchType: srchType, srchValue: srchValue});
    hideLoading();
  }

  useEffect(() => {
    paginatedLoad(pageNo);
  }, [])

  const register = () => {
    navigate('/vertiport/register');
  }

  const modify = (vi) => {
    navigate('/vertiport/detail/'+vi);
  }

  return (
    <div className="wrap-list">
      <div className="title">버티포트 관리</div>
      <div className="wrap-search">
        <select value={srchType} onChange={handelSearchType}>
          <option value="">== Select ==</option>
          <option value="vertiportId">id</option>
          <option value="vertiportName">이름</option>
          <option value="vertiportAddress">주소</option>
        </select>
        <input type="text" value={srchValue} onChange={handleSearchValue} />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className='wrap-table'>
        <table className=''>
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>이름</th>
              <th>위도</th>
              <th>경도</th>
              <th>FATO</th>
              <th>STAND</th>
              <th>주소</th>
              <th>이착륙방향</th>
              <th>정보</th>
            </tr>
          </thead>
          <tbody>
            {vertiportList.map((item, index) => (
              <tr key={item.vertiportId}>
                <td>{index+1}</td>
                <td>{item.vertiportId}</td>
                <td>{item.vertiportName}</td>
                <td>{item.vertiportLat}</td>
                <td>{item.vertiportLon}</td>
                <td>{item.fatoCount}</td>
                <td>{item.standCount}</td>
                <td>{item.vertiportAddress}</td>
                <td>{item.vertiportDirection}</td>
                <td><button onClick={()=>modify(item.vertiportId)}>수정</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <div className='wrap-page'>
          <Pagenation
            totalItems={cntTotalList} // Props 전달
            currentPage={pageNo} //v-model 대체
            onPageChange={handlePaginatedLoad} //이벤트 핸들러 바인딩 대체
        </div> */}
        <div className='wrap-reg'><button onClick={register}>등록</button></div>
      </div>
    </div>
  );
}