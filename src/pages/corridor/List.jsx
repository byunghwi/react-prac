import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCorridorStore from '../../stores/corridor'

export default function List() {
  const navigate = useNavigate();
  const [srchType, setSrchType] = useState("");
  const [srchValue, setSrchValue] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const { corridorList, actions: { getCorridorList }} = useCorridorStore();

  const handelSearchType = (e) => {
    setSrchType(e.target.value);
  } 

  const handleSearchValue = (e) => {
    setSrchValue(e.target.value);
  }

  const handleSearch = () => {
    paginatedLoad(1)
  }

  const paginatedLoad = async(payload) => {

  }

  const register = () => {
    navigate('/corridor/register');
  }
  
  const modify = (ci) => {
    navigate('/corridor/detail/'+ci)
  }

  useEffect(() => {
    paginatedLoad(pageNo)
  }, [])

  return (
    <div className='wrap-list'>
      <div className='title'>회랑 관리</div>
      <div className='wrap-search'>
        <select value={srchType} onChange={handelSearchType}>
          <option value="">== Select ==</option>
          <option value="corridorCode">ID</option>
          <option value="corridorName">이름</option>
        </select>
        <input type="text" value={srchValue} onChange={handleSearchValue} placeholder='Search...'  />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className='wrap-table'>
        <table className=''>
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
            {corridorList.map((item, index)=>(
              <tr key={item.corridorCode}>
                <td>{index+1}</td>
                <td>{item.corridorCode}</td>
                <td>{item.corridorName}</td>
                <td>{item.width}</td>
                <td>{item.height}</td>
                <td><button onClick={()=>modify(item.corridorCode)}>수정</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='wrap-page'>
        </div>
        <div className='wrap-reg'><button onClick={register}>등록</button></div>
      </div>
    </div>
  )
}