import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useModalStore from '../../stores/modal';
import Pagination from '../../components/Pagination';
import Constants from '../../utils/constants'
import apiService from '../../api/apiService';
import useSettingStore from "../../stores/setting";

export default function List() {
  const navigate = useNavigate();

  const { showLoading, hideLoading } = useModalStore();
  const { SrchType, SrchValue, pageNo, cntTotalList, setpageNo, setcntTotalList, setSrchType, setSrchValue } = useSettingStore();

  const [ vertiportList, setVertiportList ] = useState([]);

  useEffect(() => {
    paginatedLoad(pageNo);
  }, [])

  const paginatedLoad = async(payload) => {
    showLoading();
    setpageNo(payload);
    setVertiportList(await getVertiportList());
    hideLoading();
  }

  const getVertiportList = async() => {
    try {
      let params = {dataType: "JSON"}
      params.pageNo = pageNo;
      params.numOfRows = Constants.NumOfRows;
      params.srchType = SrchType;
      params.srchValue = SrchValue;
      let result = await apiService.loadVertiportList(params);
      setcntTotalList(result.totalCount);
      return result.vertiportList;
    } catch (error) {
      console.log(error);
    }
  }

  const modify = (id) => {
    navigate('/vertiport/detail/'+id);
  }

  const Register = () => {
    navigate('/vertiport/register');
  }

  const search = async() => {
    paginatedLoad(1);
  }

  return (
    <div className="wrap-list" >
      <div className="title">버티포트 관리</div>
      <div className="wrap-search">
        <select value={SrchType} onChange={(e)=> setSrchType(e.target.value)}>
          <option value="">== Select ==</option>
          <option value="vertiportId">id</option>
          <option value="vertiportName">이름</option>
          <option value="vertiportAddress">주소</option>
        </select>
        <input type="text" value={SrchValue} placeholder="search.." onChange={(e)=> setSrchValue(e.target.value)}/>
        <button onClick={()=>search()}>Search</button>
      </div>
      <div className="wrap-table">
        <table className="">
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
            {vertiportList.map(( item, index ) => (
              <tr key={index} >
                <td>{ index + 1 }</td>
                <td>{ item.vertiportId }</td>
                <td>{ item.vertiportName }</td>
                <td>{ item.vertiportLat }</td>
                <td>{ item.vertiportLon }</td>
                <td>{ item.fatoCount }</td>
                <td>{ item.standCount }</td>
                <td>{ item.vertiportAddress }</td>
                <td>{ item.vertiportDepDirection } / { item.vertiportDesDirection }</td>
                <td><button onClick={()=>modify(item.vertiportId)}>수정</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="wrap-page">
          <Pagination
            totalItems={cntTotalList}
            pageNo={pageNo}
            onPaginatedLoad={paginatedLoad}
          />
        </div>
        <div className="wrap-reg"><button onClick={()=>Register()}>등록</button></div>
      </div>
    </div>
  );
}

