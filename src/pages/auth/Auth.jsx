import { useState, useEffect } from "react";
import useUserStore from "../../stores/user";
import "../../styles/auth.css";

export default function Auth() {
  const [selectedAuth, setSelectedAuth] = useState([]);
  const [isShowAuth, setIsShowAuth] = useState(false);
  const {
    roleList, authList,
    getAuthList, getRoleList, modifyRole, saveRole, deleteRole, setRoleList
  } = useUserStore();

  const viewRole = (role) => {
    const updatedRoleList = roleList.map((item) => ({
      ...item,
      isSelect: item.roleGroupId === role.roleGroupId,
    }));
    setRoleList(updatedRoleList);
    setIsShowAuth(true);
    setSelectedAuth(role?.authorityKey ? JSON.parse(role.authorityKey) : []);
  };

  const handleRoleNameChange = (newRoleName, targetRole) => {
    const updatedRoleList = roleList.map((item) => {
      if (item.roleGroupId === targetRole.roleGroupId) {
        return { ...item, roleName: newRoleName };
      }
      return item;
    });

    setRoleList(updatedRoleList);
  };

  const handleAuthChange = (key) => {
    setSelectedAuth(
      (prev) =>
        prev.includes(key)
          ? prev.filter((item) => item !== key) // 체크 해제
          : [...prev, key] // 체크
    );
  };

  const addRole = () => {
    const addRoleList = [
      ...roleList.map((item) => ({ ...item, isSelect: false })),
      { roleGroupId: 0, roleName: "", isSelect: true },
    ];

    setRoleList(addRoleList);
    setIsShowAuth(true);
    setSelectedAuth([]);
  };

  const cancel = () => {
    const cancleRoleList = roleList
      .filter(
        (ind) => !(ind.roleGroupId === 0 && ind.roleName === "" && ind.isSelect)
      )
      .map((ind) => ({ ...ind, isSelect: false })); // 모든 항목의 isSelect를 false로 설정
    setRoleList(cancleRoleList);
  };

  const modify = async (role) => {
    const updatedRole = { ...role, authorityKey: JSON.stringify(selectedAuth) };
    delete updatedRole.isSelect; //api 통신 data에 isSelect없으므로 제거

    const modifyResult = await modifyRole(updatedRole);
    if (modifyResult === "success") initAuth();
  };

  const remove = async (role) => {
    const res = await deleteRole(role.roleGroupId);
    if (res === "success") initAuth();
  };

  const save = async (role) => {
    const updatedRole = { ...role, authorityKey: JSON.stringify(selectedAuth) };
    delete updatedRole.isSelect; //api 통신 data에 isSelect없으므로 제거

    const res = await saveRole(updatedRole);
    if (res === "success") initAuth();
  };

  const initAuth = async () => {
    await getRoleList();
    await getAuthList();
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
                  <div className="a-sc-btn">
                    {item.roleGroupId && item.isSelect ? (
                      <>
                        <button onClick={() => modify(item)}>수정</button>
                        <button onClick={() => remove(item)}>삭제</button>
                      </>
                    ) : null}
                  </div>
                  <div className="a-sc-btn">
                    {!item.roleGroupId && item.isSelect ? (
                      <>
                        <button onClick={() => save(item)}>저장</button>
                        <button onClick={() => cancel(item)}>취소</button>
                      </>
                    ) : null}
                  </div>
                </li>
              );
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
                      checked={selectedAuth.includes(item.authorityKey || "")}
                      onChange={() => handleAuthChange(item.authorityKey)}
                      value={item.authorityKey || ""}
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
