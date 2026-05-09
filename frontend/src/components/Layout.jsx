import { Activity, Dumbbell, Home, UserCircle2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { clearAuthSession, getStoredUser } from '../services/auth'

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Workout', to: '/workout', icon: Dumbbell },
  { label: 'Dashboard', to: '/dashboard', icon: Activity },
  { label: 'Account', to: '/auth', icon: UserCircle2 },
]

function Layout({ children }) {
  const user = getStoredUser()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">FitVision AI</div>
        {user ? (
          <div className="user-box">
            <p>{user.name}</p>
            <button className="btn btn-ghost" onClick={() => { clearAuthSession(); window.location.reload() }}>
              Logout
            </button>
          </div>
        ) : null}
        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
      <main className="content">{children}</main>
    </div>
  )
}

export default Layout
