import React, { useState, useEffect } from 'react';
import useModalStore from '../../stores/modal';
import apiService from '../../api/apiService';
import "../../styles/auth.css";

export default function UserAuth() {
  const { openModal, showLoading, hideLoading } = useModalStore();

  const [roleList, setRoleList] = useState([]);
  const [authList, setAuthList] = useState([]);
  const [selectedAuth, setSelectedAuth] = useState([]);
  const [isShowAuth, setIsShowAuth] = useState(false);

  useEffect(() => {
    initAuth();
  },[])

  const initAuth = async() => {
    showLoading();
    let roleResult = await getRoleList();
    if(roleResult) setRoleList(roleResult);
    setAuthList(await getAuthList());
    setSelectedAuth([]);
    setIsShowAuth(false);
    hideLoading();
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

  const addRole = () => {
    roleList?.map(ind=>{
      ind.isSelect = false;
    })
    roleList?.push({roleGroupId:0, roleName:'', isSelect: true})
    setIsShowAuth(true);
    setSelectedAuth([]);
  }

  const viewRole = (item) => {
    roleList?.map(ind=>{
      ind.isSelect = false;
    })
    item.isSelect = true;
    setIsShowAuth(true);
    setSelectedAuth(item?.authorityKey ? JSON.parse(item.authorityKey) : []);
  }

  const modify = async(item) => {
    if(selectedAuth.length===0){
      openModal('권한 관리',"AUTH를 하나 이상 선택해 주세요.",true);
      return false;
    }
    if(item.roleName===""){
      openModal('권한 관리',"ROLE명을 입력해 주세요.",true);
      return false;
    }
    delete item.isSelect
    showLoading();
    item.authorityKey = JSON.stringify(selectedAuth)
    await apiService.modifyRole(item);
    initAuth();
  }

  const remove = async(item) => {
    await apiService.deleteRole(item.roleGroupId);
    initAuth();
  }

  const save = async(item) => {
    if(selectedAuth.length===0){
      openModal('권한 관리',"AUTH를 하나 이상 선택해 주세요.",true);
      return false;
    }
    if(item.roleName===""){
      openModal('권한 관리',"ROLE명을 입력해 주세요.",true);
      return false;
    }
    delete item.isSelect
    showLoading();
    item.authorityKey = JSON.stringify(selectedAuth)
    await apiService.saveRole(item);
    initAuth();
  }

  const cancel = () => {
    const cancleRoleList = roleList
      .filter(
        (ind) => !(ind.roleGroupId === 0 && ind.roleName === "" && ind.isSelect)
      )
      .map((ind) => ({ ...ind, isSelect: false })); // 모든 항목의 isSelect를 false로 설정
      setRoleList(cancleRoleList);
    };

  const handleRoleNameChange = (newRoleName, targetRole) => {
    const updatedRoleList = roleList.map((item) => {
      if (item.roleGroupId === targetRole.roleGroupId) {
        return { ...item, roleName: newRoleName };
      }
      return item;
    });

    setRoleList(updatedRoleList);
  }

  const handleAuthChange = (key) => {
    setSelectedAuth(
      (prev) =>
        prev.includes(key)
          ? prev.filter((item) => item !== key) // 체크 해제
          : [...prev, key] // 체크
    );
  }

  return (
    <div className="wrap-list" >
      <div className="title">권한 관리</div>
      <div className="wrap-map">
        <div className="wrap-table-auth">
          <p>ROLE <button onClick={()=>addRole()}>추가</button></p>
          <div className="sc-wrap">
            <ul>
              {roleList.map(( item, index ) => (
              <li key={index}>
                <input
                  type="radio"
                  checked={item.isSelect || false}
                  name="role"
                  onChange={() => viewRole(item)}
                />
                <input
                  type="text"
                  value={item.roleName || ""}
                  disabled={!item.isSelect}
                  onChange={(e) => handleRoleNameChange(e.target.value, item)}
                />
                {item.isSelect ? (
                  item.roleGroupId ?
                    (<div className="sc-btn"><button onClick={()=>modify(item)}>수정</button> <button onClick={()=>remove(item)}>삭제</button></div>)
                    :
                    (<div className="sc-btn" ><button onClick={()=>save(item)}>저장</button><button onClick={()=>cancel(item)}>취소</button></div>)
                ) : (null)}
              </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="wrap-table-auth">
          <p>AUTH</p>
          {isShowAuth && <div className="sc-wrap">
            <ul>
              {authList.map(( item, index ) => (
              <li key={index}>
                <input
                  type="checkbox"
                  checked={selectedAuth.includes(item.authorityKey || "")}
                  onChange={() => handleAuthChange(item.authorityKey)}
                  value={item.authorityKey || ""}
                /> {item.authority}
              </li>
              ))}
            </ul>
          </div>}
        </div>
      </div>
    </div>
  )
}
