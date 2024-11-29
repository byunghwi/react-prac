import Header from './Header'
import Menu from './Menu'
import { Outlet } from 'react-router-dom';

export default function Main() {
  return (
    <>
      <Header />
      <Menu />
      <div className="right">
        <Outlet />
      </div>
    </>
  )
}