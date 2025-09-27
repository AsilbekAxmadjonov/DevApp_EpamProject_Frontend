import { NavLink, useNavigate } from "react-router-dom";
import {
  House,
  PlusSquare,
  Bookmark,
  BoxArrowRight,
  Person,
} from "react-bootstrap-icons";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function LeftNav() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const item = (to, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-2xl transition
         ${
           isActive
             ? "bg-white/10 text-white"
             : "text-white/80 hover:bg-white/10 hover:text-white"
         }`
      }
    >
      <Icon size={22} />
      <span className="font-medium">{label}</span>
    </NavLink>
  );

  return (
    <aside className="sticky top-0 h-screen w-64 px-3 py-4 glass">
      <div className="text-white text-2xl font-extrabold px-4 py-3">
        DevLogs
      </div>
      <nav className="mt-1 flex flex-col gap-1">
        {item("/home", "Home", House)}
        {item("/create", "Create", PlusSquare)}
        {item("/bookmarks", "Bookmarks", Bookmark)}
        {item("/profile", "Profile", Person)}
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
