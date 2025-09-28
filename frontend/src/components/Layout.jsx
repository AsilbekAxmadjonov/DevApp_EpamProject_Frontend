import LeftNav from "./Navbar-left";
import RightSidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto w-full px-3">
        <div className="flex gap-4">
          <LeftNav />
          <main className="flex-1 h-screen overflow-y-auto py-4">
            <div className="max-w-2xl mx-auto">
              <Outlet />
            </div>
          </main>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
