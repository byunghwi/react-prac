import { useState, useEffect } from "react";
import useUserStore from "../../stores/user";
import "../../styles/auth.css";

export default function Auth() {
  const [roleList, setRoleList] = useState([]);
  const [authList, setAuthList] = useState([]);
  const [selectedAuth, setSelectedAuth] = useState([]);
  const [isShowAuth, setIsShowAuth] = useState(false);

  const storeUser = useUserStore();
  const { getAuthList, getRoleList, modifyRole } = storeUser;

  const handleAuthChange = (key) => {
    setSelectedAuth((prev)=> {
      if(prev.includes(key)) {
        //체크해제
        return prev.filter((item)=> item !== key);
      } else {
        //체크
        return [...prev, key];
      }
    })
  }

  const handleRoleNameChange = (newRoleName, targetRole) => {
    setRoleList((prev) =>
      prev.map((item) => {
        if(item.roleGroupId === targetRole.roleGroupId) {
          return {...item, roleName: newRoleName};
        }
        return item;
      })
    )
  }
  
  const addRole = () => {};

  const modify = async(role) => {
    role.authorityKey = JSON.stringify(selectedAuth);
    delete role.isSelect;
    
    console.log('modify> selectedAuth: ', selectedAuth);
    console.log('modify> role: ', role);

    let modifyResult = await modifyRole(role);
    console.log('modifyResult: ', modifyResult);

  };

  const viewRole = (role) => {
    console.log('viewRole...', role, roleList);
    roleList.map((item)=>{
      item.isSelect = false;
    })
    role.isSelect = true;
    setIsShowAuth(true);

    setSelectedAuth(role?.authorityKey ? JSON.parse(role.authorityKey) : []);
  };

  const remove = () => {};

  const save = () => {};

  const initAuth = async () => {
    let roleResult = await getRoleList();
    if (roleResult) setRoleList(roleResult);
    
    let authResult = await getAuthList();
    if(authResult) setAuthList(authResult);
    setSelectedAuth([]);
    setIsShowAuth(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <div className="a-wrap-list">
      <div className="a-title">권한 관리</div>
      <div className="a-wrap-table">
        <p>
          ROLE <button onClick={addRole}>추가</button>
        </p>
        <div className="a-sc-wrap">
          <ul>
            {roleList.map((item, index) => {
              return (
                <li key={index}>
                  <input
                    type="radio"
                    checked={item.isSelect}
                    name="role"
                    onClick={()=>viewRole(item)}
                  />
                  <input
                    type="text"
                    value={item.roleName || ''}
                    disabled={!item.isSelect}
                    onChange={(e)=> handleRoleNameChange(e.target.value, item)}
                  />
                  <div className="a-sc-btn">
                    { item.roleGroupId && item.isSelect ? (
                      <>
                        <button onClick={()=>modify(item)}>수정</button>
                        <button onClick={()=>remove(item)}>삭제</button>
                      </>
                    ) : null }
                  </div>
                  <div className="a-sc-btn">
                    {!item.roleGroupId && item.isSelect ? (
                      <button onClick={()=>save(item)}>저장</button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div className="a-wrap-table">
        <p>AUTH</p>
        {isShowAuth && (
          <div className="a-sc-wrap">
            <ul>
              {authList.map((item, index) => {
                return (
                  <li key={index}>
                    <input
                      type="checkbox"
                      checked={selectedAuth.includes(item.authorityKey || '')}
                      onChange={()=>handleAuthChange(item.authorityKey)}
                      value={item.authorityKey || ''}
                    />
                    {item.authorityKey}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
