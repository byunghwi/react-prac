import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useModalStore from '../../stores/modal';
import Constants from '../../utils/constants'
import apiService from '../../api/apiService';
import useSettingStore from "../../stores/setting";
import Pagination from '../../components/Pagination';

export default function List() {
  const navigate = useNavigate();

  const { showLoading, hideLoading } = useModalStore();
  const { SrchType, SrchValue, pageNo, cntTotalList, setpageNo, setcntTotalList, setSrchType, setSrchValue } = useSettingStore();

  const [corridorList, setcorridorList] = useState([]);

  useEffect(() => {
    paginatedLoad(pageNo);
  },[])

  const paginatedLoad = async(payload) => {
    showLoading();
    setpageNo(payload);
    await getCorridorList(true);
    hideLoading();
  }

  const getCorridorList = async(isPaging) => {
    try {
      let params = {dataType: "JSON"}
      if(isPaging){
        params.pageNo = pageNo;
        params.numOfRows = Constants.NumOfRows;
      }
      params.srchType = SrchType;
      params.srchValue = SrchValue;
      let result = await apiService.loadCorridorList(params);
      setcorridorList(result.corridorList);
      setcntTotalList(result.totalCount);
    } catch (error) {
      console.log(error);
    }
  }

  const modify = async(id) => {
    navigate('/corridor/detail/'+id);
  }

  const register = () => {
    navigate('/corridor/register');
  }

  const search = async() => {
    paginatedLoad(1);
  }

  return (
    <div className="wrap-list" >
      <div className="title">회랑 관리</div>
      <div className="wrap-search">
        <select value={SrchType} onChange={(e)=> setSrchType(e.target.value)}>
          <option value="">== Select ==</option>
          <option value="corridorCode">ID</option>
          <option value="corridorName">이름</option>
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
              <th>Width(NM)</th>
              <th>Height(FT)</th>
              <th>정보</th>
            </tr>
          </thead>
          <tbody>
            {corridorList.map(( item, index ) => (
              <tr key={index} >
                <td>{ index + 1 }</td>
                <td>{ item.corridorCode }</td>
                <td>{ item.corridorName }</td>
                <td>{ item.width }</td>
                <td>{ item.height }</td>
                <td><button onClick={()=>modify(item.corridorCode)}>수정</button></td>
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
        <div className="wrap-reg"><button onClick={()=>register}>등록</button></div>
      </div>
    </div>
  )
}

