import { useEffect, useState } from "react";
import useUserStore from '../../stores/user'

export default function Register() {
  const [selectedRole, setSelectRole] = useState("");
  const [selectedAuth, setSelectedAuth] = useState([]);
  const {
    roleList, authList,
    actions: {getRoleList, getAuthList}
  } = useUserStore();

  useEffect(() => {
    async function fetchData() {
      try {
        await getRoleList();
        await getAuthList();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const handleRoleChange = (target) => {
    setSelectRole(target);
    setSelectedAuth(JSON.parse(roleList.find(ind=>ind.roleName==target).authorityKey))
  }

  return (
    <div className="wrap-list">
      <div className="title">관제사 섹터 배정</div>
      <div className="wrap-table">
        <table className="">
          <tr>
            <td>ID</td><td><input type="text" /></td>
          </tr>
          <tr><td>관제사 명</td><input type="text" /></tr>
          <tr>
            <td>ROLE/AUTH</td>
            <td>
              <select value={selectedRole} onChange={(e) => handleRoleChange(e.target.value)}>
                <option value="">== Select ==</option>
                {roleList.map((item, index) => (
                  <option key={index} >{item.roleName}</option>
                ))}
              </select>
              <ul>
                {authList.map((item, index) => (<li key={index}>
                    <input type="checkbox" value={item.authorityKey} checked={selectedAuth.includes(item.authorityKey)} disabled />
                    {item.authority}
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
}