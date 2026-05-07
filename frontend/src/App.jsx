import { FolderKanban, LayoutDashboard, ListTodo, LogOut } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <ProtectedRoute>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">TT</div>
            <div>
              <strong>Task Manager</strong>
              <span>{user?.role === "ADMIN" ? "Admin workspace" : "Member workspace"}</span>
            </div>
          </div>

          <nav className="nav-list">
            <NavLink to="/dashboard">
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink to="/projects">
              <FolderKanban size={18} />
              Projects
            </NavLink>
            <NavLink to="/tasks">
              <ListTodo size={18} />
              Tasks
            </NavLink>
          </nav>

          <div className="profile-box">
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <button className="icon-button" onClick={handleLogout} title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        <main className="main-panel">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
