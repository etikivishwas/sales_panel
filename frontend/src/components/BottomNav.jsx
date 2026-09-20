import { NavLink } from "react-router-dom";
import { FiGrid, FiUser, FiUsers } from "react-icons/fi";

export default function BottomNav() {
  return (
    <nav className="bottom">
      <NavLink to="/dashboard">
        <FiGrid />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/leads">
        <FiUsers />
        <span>Leads</span>
      </NavLink>
      <NavLink to="/profile">
        <FiUser />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
