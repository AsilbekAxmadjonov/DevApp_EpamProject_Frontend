import LeftNav from "./LeftNav";
import RightSidebar from "./RightSidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-3">
        <div className="flex gap-4">
          <LeftNav />
          {/* center */}
          <main className="flex-1 h-screen overflow-y-auto py-4">
            {/* narrow feed like Instagram */}
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
