import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BaseMap from '../../components/BaseMap'
import useMapStore from '../../stores/map';
import useModalStore from '../../stores/modal';
import apiService from '../../api/apiService';

export default function Modify() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { corridorDetail, mySector, rightTools, drawCorridors, hideCorridors, setmySector, setcorridorDetail, setcorridorTypes } = useMapStore();
  const { showLoading, hideLoading } = useModalStore();

  const [roleList, setroleList] = useState([]);
  const [authList, setauthList] = useState([]);
  const [tempCorridorList, settempCorridorList] = useState([]);
  const [selectedAuth, setselectedAuth] = useState([]);
  const [selectedRole, setselectedRole] = useState("");
  const [userDetail, setuserDetail] = useState([]);
  const [vertiportList, setvertiportList] = useState([]);
  const [corridorList, setcorridorList] = useState([]);

  useEffect(() => {
    const init = async() => {
      showLoading();
      await getUserDetail(id);
      setmySector([]);
      setcorridorDetail("");
      await getVertiportList();
      await getCorridorList();
      setcorridorTypes(['center', 'waypoint', 'name']);
      let res1 = await getRoleList();
      setroleList(res1);
      let res2 = await getAuthList();
      setauthList(res2);
      rightTools.removeSector = true;
      hideLoading();
    }
    init();

    return () => {
      rightTools.removeSector = false;
    }

  },[id])

  useEffect(() => {
    if(userDetail.userRole) setselectedRole(userDetail.userRole);
    if(userDetail.authorityKey) setselectedAuth(JSON.parse(userDetail.authorityKey));
  },[userDetail])

  const getCorridorList = async() => {
    try {
      let params = {dataType: "JSON"}
      let result = await apiService.loadCorridorList(params);
      setcorridorList(result.corridorList);
    } catch (error) {
      console.log(error);
    }
  }

  const getVertiportList = async() => {
    try {
      let params = {dataType: "JSON"}
      let result = await apiService.loadVertiportList(params);
      setvertiportList(result.vertiportList);
    } catch (error) {
      console.log(error);
    }
  }

  const getRoleList = async() => {
    try {
      let response = await apiService.loadRoleList();
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  const getAuthList = async() => {
    try {
      let response = await apiService.loadAuthList();
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  const getUserDetail = async(id) => {
    try {
      let response = await apiService.loadUserDetail(id);
      if(response) {
        setuserDetail(response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const selectRole = (target) => {
    setselectedAuth(JSON.parse(roleList.find(ind=>ind.roleName===target).authorityKey));
  }

  const checkVertiport = (checked, item) => {
    if(checked){
      settempCorridorList([]);
      setcorridorDetail("");
      settempCorridorList(corridorList.filter(ind=>ind.depature===item.vertiportId || ind.destination===item.vertiportId))
      hideCorridors('mySector');
      // selectVertiport(item.vertiportId)
    }else{
      // unSelectVertiport(item.vertiportId)
    }
  }

  const selectCorridor = (target) => {
    drawCorridors([tempCorridorList.find(ind=>ind.corridorCode===target)], 'mySector', true)
  }

  const list = () => {
    return navigate("/user/list")
  }

  const save = () => {
  }

  return (
    <div className="wrap-list" >
    <div className="title">관제사 섹터 배정</div>
    <div className="wrap-map">
      <div className="wrap-table-cell">
        <table className="">
          <tbody>
            <tr>
              <td>ID</td><td><input type="text" value={userDetail.loginId || ""} onChange={(e)=>userDetail.loginId=e.target}/></td>
            </tr>
            <tr>
              <td>관제사 명</td><td><input type="text" value={userDetail.userName || ""} onChange={(e)=>userDetail.userName=e.target}/></td>
            </tr>
            <tr>
              <td>ROLE/AUTH</td>
              <td>
                <select value={selectedRole} onChange={(e)=>selectRole(e.target)}>
                  <option value="">== Select ==</option>
                  {roleList.map(( item, index )=>(
                    <option value={item.roleName} key={index}>{ item.roleName }</option>
                  ))}
                </select>
                <ul>
                  {authList.map(( item, index )=>(
                    <li key={index}>
                      <input type="checkbox" value={item.authorityKey} checked={selectedAuth.includes(item.authorityKey)} disabled /> {item.authority}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
            <tr>
              <td>VERTIPORT</td>
              <td>
                <ul>
                  {vertiportList.map(( item, index )=>(
                    <li key={index}>
                      <input type="radio" name="vertiport" onClick={(e)=>checkVertiport(e.target.checked,item)}/> { item.vertiportId }
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
            <tr>
              <td>CORRIDOR</td>
              <td>
                <select id={corridorDetail} onChange={(e)=>selectCorridor(e.target)}>
                  <option value="">== select ==</option>
                  {tempCorridorList.map(( item, index )=>(
                    <option key={index} value={item.corridorCode} >{ item.corridorCode }</option>
                  ))}

                </select>
              </td>
            </tr>
            <tr>
              <td>WAYPOINT</td>
              <td>
                <ul>
                  {mySector.map(( item, index ) => (
                    <li key={index}>{ item.corridor } : { item.prev }-{ item.next }</li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BaseMap />
    </div>
    <div className="wrap-reg">
        <button onClick={save}>저장</button>
        <button onClick={list}>목록</button>
      </div>
  </div>
  )
}