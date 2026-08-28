import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

export default function AppLayout() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header />
      <div className="layout">
        <Sidebar />
        <main className="main" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </>
  )
}
