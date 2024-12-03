import { useState, useEffect } from "react";
import useUserStore from "../../stores/user";
import "../../styles/auth.css";

export default function Auth() {
  const [roleList, setRoleList] = useState([]);
  const [authList, setAuthList] = useState([]);
  const [selectedAuth, setSelectedAuth] = useState([]);
  const [isShowAuth, setIsShowAuth] = useState(false);

  const storeUser = useUserStore();
  const { getAuthList, getRoleList, modifyRole, saveRole, deleteRole } = storeUser;

  const handleAuthChange = (key) => {
    setSelectedAuth((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key) // 체크 해제
        : [...prev, key] // 체크
    );
  };

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
  
  const addRole = () => {
    setRoleList((prevRoleList) => [
      ...prevRoleList.map((role) => ({ ...role, isSelect: false })),
      { roleGroupId: 0, roleName: '', isSelect: true },
    ]);

    setIsShowAuth(true);
    setSelectedAuth([]);
  };

  
  const cancel = () => {
    setRoleList((prevRoleList) => {
      // 새로 추가된 행을 제외하고 나머지 행을 업데이트
      return prevRoleList
        .filter((ind) => !(ind.roleGroupId === 0 && ind.roleName === '' && ind.isSelect))
        .map((ind) => ({ ...ind, isSelect: false })); // 모든 항목의 isSelect를 false로 설정
    });
  };

  const modify = async(role) => {
    const updatedRole = { ...role, authorityKey: JSON.stringify(selectedAuth) };
    delete updatedRole.isSelect;  //api 통신 data에 isSelect없으므로 제거
  
    const modifyResult = await modifyRole(updatedRole);
    if (modifyResult === 'success') initAuth();
  };

  const viewRole = (role) => {
    setRoleList((prevRoleList) =>
      prevRoleList.map((item) => ({
        ...item,
        isSelect: item === role, // 선택된 역할만 true로 설정
      }))
    );
    setIsShowAuth(true);
    setSelectedAuth(role?.authorityKey ? JSON.parse(role.authorityKey) : []);
  };

  const remove = async(role) => {
    const res = await deleteRole(role.roleGroupId);
    if (res === 'success') initAuth();
  };

  const save = async(role) => {
    const updatedRole = { ...role, authorityKey: JSON.stringify(selectedAuth) };
    delete updatedRole.isSelect; //api 통신 data에 isSelect없으므로 제거

    const res = await saveRole(updatedRole);
    if (res === 'success') initAuth();
  };

  const initAuth = async () => {
    let roleResult = await getRoleList();
    if (roleResult) {
      const updatedRoleList = roleResult.map((role) => ({
        ...role,
        isSelect: false, // 모든 객체에 isSelect: false 추가
      }));
      setRoleList(updatedRoleList);
    }
    
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
                    onChange={()=>viewRole(item)}
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
                      <>
                        <button onClick={()=>save(item)}>저장</button>
                        <button onClick={()=>cancel(item)}>취소</button>
                      </>
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
