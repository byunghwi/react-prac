import React, { useState, useEffect } from 'react';
import useUserStore from '../../stores/user'; 
import '../../styles/userList.css';

export default function List() {
  const [searchType, setSearchType] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [userList, setUserList] = useState([]);

  const storeUser = useUserStore();
  const { getUserList } = storeUser;

  useEffect(() => {
    async function fetchData() {
      try {
        let userList = await getUserList(searchType, searchValue);
        setUserList(userList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, [searchType, searchValue]); // 빈 배열로 한 번만 호출되도록 설정

  const handleSearchClick = () => {
    getUserList(searchType, searchValue).then((userList) => {
      setUserList(userList);
    }).catch((error) => {
      console.error('Error during search:', error);
    });
  }
  
  return (
    <div className="wrap-list">
      <div className="title">관제 업무 관리</div>
      <div className="wrap-search">
        <select value={searchType} onChange={(e)=> setSearchType(e.target.value)}>
          <option value="">== Select ==</option>
          <option value="loginId">회원ID</option>
          <option value="userName">이름</option>
        </select>
        <input type="text" value={searchValue} onChange={(e)=> setSearchValue(e.target.value)} placeholder="search..."></input>
        <button onClick={handleSearchClick}>Search</button>
      </div>
      <div className="wrap-table">
        <table>
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
            {userList.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.loginId}</td>
                <td>{item.userName}</td>
                <td>{item.userRole}</td>
                <td>{item.authority}</td>
                <td>
                  <button /*onClick={() => handleModifyClick(item.loginId)}*/>수정</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="wrap-page">
          {/* <Pagination totalItems={cntTotalList} currentPage={pageNo} onPageChange={setPageNo} /> */}
        </div>
        <div className="wrap-reg">
          <button /*onClick={handleRegisterClick}*/>등록</button>
        </div>
      </div>
    </div>
  )
}