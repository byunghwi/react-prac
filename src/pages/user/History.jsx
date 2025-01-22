import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useModalStore from '../../stores/modal';
import Constants from '../../utils/constants'
import apiService from '../../api/apiService';
import useSettingStore from "../../stores/setting";
import Pagination from '../../components/Pagination';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function UserHistory() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useModalStore();
  const { SrchType, SrchValue, pageNo, cntTotalList, setpageNo, setcntTotalList, setSrchType, setSrchValue } = useSettingStore();

  const [userList, setuserList] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [sDate, eDate] = dateRange;

  useEffect(() => {
    let startDate = new Date();
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    startDate = parseDate(startDate)
    endDate = parseDate(endDate)
    setDateRange([startDate, endDate]);
  },[])

  useEffect(() => {
    if(sDate && eDate) paginatedLoad(pageNo);
  },[sDate,eDate])

  const paginatedLoad = async(payload) => {
    showLoading();
    setpageNo(payload);
    let list = await getUserLogList(sDate, eDate);
    setuserList(list);
    hideLoading();
  }

  const getUserLogList = async(startDate, endDate) => {
    try {
      let params = {}
      params.pageNo = pageNo;
      params.numOfRows = Constants.NumOfRows;
      if(startDate) params.startDate = startDate;
      if(endDate) params.endDate = endDate;
      params.srchType = SrchType;
      params.srchValue = SrchValue;
      let result = await apiService.loadUserLogList(params);
      setcntTotalList(result.totalCount);
      return result.logList;
    } catch (error) {
      console.log(error);
    }
  }

  const parseDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const adminUserModify = (id) => {
    navigate('/user/detail/'+id);
  }

  const search = async() => {
    paginatedLoad(1);
  }

  return (
    <div className="wrap-list" >
      <div className="title">접속 이력</div>
      <div className="wrap-search">
        <DatePicker
          isClearable={false} // clearable 옵션
          selectsRange={true}
          startDate={sDate}
          endDate={eDate}
          onChange={(update) => {
            setDateRange(update);
          }}
          dateFormat='yyyy-MM-dd'
          monthsShown={2}
          className="dark-mode-datepicker"
          withPortal
        />
        <div className="search">
          <select value={SrchType} onChange={(e)=> setSrchType(e.target)}>
            <option value="">== Select ==</option>
            <option value="loginId">회원ID</option>
            <option value="userName">이름</option>
          </select>
          <input type="text" value={SrchValue} placeholder="search.." onChange={(e)=> setSrchValue(e.target)}/>
          <button onClick={()=>search}>Search</button>
        </div>
      </div>
      <div className="wrap-table">
        <table className="">
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>이름</th>
              <th>관제영역</th>
              <th>로그인</th>
              <th>로그아웃</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(( item, index ) => (
              <tr key={index} >
                <td>{ index + 1 }</td>
                <td>{ item.loginId }</td>
                <td>{ item.userName }</td>
                <td>{ item.userRole }</td>
                <td>{ item.authority }</td>
                <td><button onClick={()=>adminUserModify(item.loginId)}>수정</button></td>
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
      </div>
    </div>
  )
}

