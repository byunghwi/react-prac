import { useState } from "react";
import useAuthStore from "../stores/auth";
import { useNavigate } from "react-router-dom"; // 로그인 후 페이지 이동을 위해
import logo from '../assets/images/admin_logo_2@2x.png';

export default function Login() {
  const [id, setId] = useState(""); // 로그인 ID를 위한 로컬 상태
  const [pwd, setPwd] = useState(""); // 비밀번호를 위한 로컬 상태
  const [isErr, setIsErr] = useState(false); // 로그인 실패 시 에러 상태
  const login = useAuthStore((state) => state.login); // zustand 스토어의 로그인 함수 가져오기
  const navigate = useNavigate(); // 로그인 후 이동을 위한 네비게이션 훅

  const handleLogin = async (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    // zustand 스토어의 로그인 함수를 호출하여 로그인 시도
    const result = await login({ loginId: id, loginPw: pwd });

    if (result === "fail") {
      setIsErr(true); // 로그인 실패 시 에러 메시지 표시
    } else {
      setIsErr(false); // 로그인 성공 시 에러 메시지 숨기기
      navigate("/"); // 성공적으로 로그인하면 user/list 페이지로 이동
    }
  };

  return (
    <div className="root">
      <section id="container">
        <div className="wrapper bgGrey">
          <div className="loginWrap">
            <h1>
              <a href="">
                <img
                  src={logo}
                  alt="kt TMS admin 로그인 로고"
                />
              </a>
            </h1>
            <div className="inputWrap">
              <form onSubmit={handleLogin}>
                <div>
                  <input
                    type="text"
                    className="loginId form-control"
                    aria-label="아이디 입력"
                    name="login_id"
                    placeholder="User Name"
                    value={id}
                    onChange={(e) => setId(e.target.value)} // ID 입력 시 상태 업데이트
                    tabIndex="1"
                  />
                  <button
                    type="button"
                    className="btnClr"
                    aria-label="입력내용 삭제"
                    tabIndex="2"
                    onClick={() => setId("")} // ID 입력 필드 비우기
                  >Clear</button>
                </div>
                <div>
                  <input
                    type="password"
                    className="loginPw form-control"
                    aria-label="비밀번호 입력"
                    name="login_pw"
                    placeholder="Password"
                    autoComplete="off"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)} // 비밀번호 입력 시 상태 업데이트
                    tabIndex="3"
                  />
                  <button
                    type="button"
                    className="btnClr"
                    aria-label="입력내용 삭제"
                    tabIndex="4"
                    onClick={() => setPwd("")} // 비밀번호 입력 필드 비우기
                  >Clear</button>
                </div>
                {isErr && (
                  <p className="warning">
                    아이디나 비밀번호가 올바르지 않습니다. 다시 시도해 주세요.
                  </p>
                )}
                <div className="btnWrap">
                  <button
                    type="submit"
                    className="loginBtn"
                    aria-label="로그인 버튼"
                    tabIndex="7"
                  >
                    로그인
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}