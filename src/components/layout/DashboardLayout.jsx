import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="md:ml-64">
        <Topbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
