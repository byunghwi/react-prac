import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useModalStore from '../../stores/modal';
import Constants from '../../utils/constants';
import apiService from '../../api/apiService';
import useSettingStore from '../../stores/setting';
import Pagination from '../../components/Pagination';

export default function List() {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);

  const { showLoading, hideLoading } = useModalStore();
  const { SrchType, SrchValue, pageNo, cntTotalList, setpageNo, setcntTotalList, setSrchType, setSrchValue } = useSettingStore();

  useEffect(() => {
    paginatedLoad(1);
  },[])

  const paginatedLoad = async(payload) => {
    showLoading();
    setpageNo(payload);
    setUserList(await getUserList());
    hideLoading();
  }

  const getUserList = async() => {
    try {
      let params = {}
      params.pageNo = pageNo;
      params.numOfRows = Constants.NumOfRows;
      params.srchType = SrchType;
      params.srchValue = SrchValue;
      let result = await apiService.loadUserList(params);
      setcntTotalList(result.totalCount);
      return result.userList;
    } catch (error) {
      console.log(error);
    }
  }

  const adminUserRegister = () => {
    navigate('/user/register');
  }

  const adminUserModify = (id) => {
    navigate('/user/detail/'+id);
  }

  const search = async() => {
    paginatedLoad(1);
  }

  return (
    <div className="wrap-list" >
      <div className="title">관제 업무 관리</div>
      <div className="wrap-search">
        <select value={SrchType} onChange={(e)=> setSrchType(e.target.value)}>
          <option value="">== Select ==</option>
          <option value="loginId">회원ID</option>
          <option value="userName">이름</option>
        </select>
        <input type="text" value={SrchValue} placeholder="search.." onChange={(e)=> setSrchValue(e.target.value)}/>
        <button onClick={search}>Search</button>
      </div>
      <div className="wrap-table">
        <table className="">
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>이름</th>
              <th>ROLE</th>
              <th>AUTHORITY</th>
              <th>정보</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(( item, index ) => (
            <tr key={index} >
              <td>{index + 1}</td>
              <td>{item.loginId}</td>
              <td>{item.userName}</td>
              <td>{item.userRole}</td>
              <td>{item.authority}</td>
              <td>
                <button onClick={(e)=>adminUserModify(item.loginId)}>수정</button>
              </td>
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
        <div className="wrap-reg"><button onClick={(e)=>adminUserRegister()}>등록</button></div>
      </div>
    </div>
  )
}