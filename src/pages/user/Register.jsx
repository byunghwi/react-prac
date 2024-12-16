import { useEffect, useState } from "react";
import useUserStore from "../../stores/user";
import useCorridorStore from "../../stores/corridor";
import useVertiportStore from "../../stores/vertiport";
import useMapStore from "../../stores/map";
import BaseMap from "../../components/BaseMap";
import { useNavigate } from "react-router-dom";
import "../../styles/register.css"

export default function Register() {
  // 자체 State
  const [selectedRole, setSelectRole] = useState("");
  const [selectedAuth, setSelectedAuth] = useState([]);
  const [tempCorridorList, setTempCorridorList] = useState([]);

  const navigate = useNavigate();

  const {
    roleList,
    authList,
    actions: { getRoleList, getAuthList },
  } = useUserStore();

  const {
    vertiportList,
    vertiportDetail,
    actions: { getVertiportList },
  } = useVertiportStore();

  const {
    corridorList,
    corridorDetail,
    selectedCorridors,
    mySector,
    SrchType,
    SrchValue,
    pageNo,
    cntTotalList,
    actions: { getCorridorList, setCorridorDetail },
  } = useCorridorStore();

  useEffect(() => {
    async function fetchData() {
      try {
        await getVertiportList();
        await getCorridorList();
        await getRoleList();
        await getAuthList();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const handleRoleChange = (target) => {
    setSelectRole(target);
    setSelectedAuth(
      JSON.parse(roleList.find((ind) => ind.roleName == target).authorityKey)
    );
  };

  const handleCheckVertiport = (e, target) => {
    if (e.target.checked) {
      setTempCorridorList([]);
      setCorridorDetail("");
      let filtering = corridorList.filter(
        (ind) =>
          ind.departure == target.vertiportId ||
          ind.destination == target.vertiportId
      );
      setTempCorridorList(filtering);
      //hideCorridors('mySector');
    }
  };

  const handleSelectCorridor = (e) => {
    console.log("tempCorridorList", tempCorridorList);
    //drawCorridors([tempCorridorList.find(ind=>ind.corridorCode==e.target.value)], 'mySector', true)
  };

  const list = () => {
    navigate("/user/list");
  };

  const save = () => {
    console.log("save...");
  };

  return (
    <div className="wrap-list">
      <div className="title">관제사 섹터 배정</div>
      <div className="wrap-map">
        <div className="wrap-table-cell">
          <table className="">
            <tbody>
            <tr>
              <td>ID</td>
              <td>
                <input type="text" />
              </td>
            </tr>
            <tr>
              <td>관제사 명</td>
              <td><input type="text" /></td>
            </tr>
            <tr>
              <td>ROLE/AUTH</td>
              <td>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  <option value="">== Select ==</option>
                  {roleList.map((item, index) => (
                    <option key={index}>{item.roleName}</option>
                  ))}
                </select>
                <ul>
                  {authList.map((item, index) => (
                    <li key={index}>
                      <input
                        type="checkbox"
                        value={item.authorityKey}
                        checked={selectedAuth.includes(item.authorityKey)}
                        disabled
                      />
                      {item.authority}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
            <tr>
              <td>VERTIPORT</td>
              <td>
                <ul>
                  {vertiportList.map((vertiport, index) => (
                    <li key={index}>
                      <input
                        type="radio"
                        name="vertiport"
                        onClick={(e) => handleCheckVertiport(e, vertiport)}
                      />
                      {vertiport.vertiportId}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
            <tr>
              <td>CORRIDOR</td>
              <td>
                <select
                  value={corridorDetail}
                  onChange={(e) => handleSelectCorridor(e)}
                >
                  <option value="">== Select ==</option>
                  {tempCorridorList.map((corridor) => (
                    <option
                      key={corridor.corridorCode}
                      value={corridor.corridorCode}
                    >
                      {corridor.corridorCode}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <BaseMap />
      </div>
      <div className="wrap-reg">
        <button onClick={() => save()}>저장</button>
        <button onClick={() => list()}>목록</button>
      </div>
    </div>
  );
}
