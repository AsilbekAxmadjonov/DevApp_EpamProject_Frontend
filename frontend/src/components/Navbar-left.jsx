import { NavLink, useNavigate } from "react-router-dom";
import {
  House,
  PlusSquare,
  Bookmark,
  BoxArrowRight,
  PersonCircle,
} from "react-bootstrap-icons";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function LeftNav() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition
     ${
       isActive
         ? "bg-white/10 text-white"
         : "text-white/80 hover:bg-white/10 hover:text-white"
     }`;

  return (
    <aside className="sticky top-0 h-screen w-64 px-3 py-4 glass">
      <div className="text-white text-2xl font-extrabold px-4 py-3">
        DevLogs
      </div>

      <nav className="mt-1 flex flex-col gap-1">
        <NavLink to="/home" className={linkClass}>
          <House size={22} />
          <span className="font-medium">Home</span>
        </NavLink>

        <NavLink to="/create" className={linkClass}>
          <PlusSquare size={22} />
          <span className="font-medium">Create</span>
        </NavLink>

        <NavLink to="/bookmarks" className={linkClass}>
          <Bookmark size={22} />
          <span className="font-medium">Bookmarks</span>
        </NavLink>

        <NavLink to="/profile" className={linkClass}>
          <PersonCircle size={22} />
          <span className="font-medium">Profile</span>
        </NavLink>

        <button
          className="mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl text-white/80 hover:bg-white/10 hover:text-white"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <BoxArrowRight size={22} />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  );
}
