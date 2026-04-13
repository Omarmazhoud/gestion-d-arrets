import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import SuperAdminLayout from "./components/layout/SuperAdminLayout";
import AdminLayout from "./components/layout/AdminLayout";

import Dashboard from "./pages/superAdmin/Dashboard";
import Users from "./pages/superAdmin/Users";
import SuperAdminTickets from "./pages/superAdmin/Tickets";
import Stats from "./pages/superAdmin/Stats";
import Machines from "./pages/superAdmin/Machines";

import AdminDashboard from "./pages/Admin/Dashboard";
import AdminTickets from "./pages/Admin/Tickets";
import Processes from "./pages/superAdmin/Processes";
import Secteurs from "./pages/superAdmin/Secteurs";
import CreateTicket from "./pages/superAdmin/CreateTicket";
import Fournisseurs from "./pages/superAdmin/Fournisseurs";
import PiecesRechange from "./pages/superAdmin/PiecesRechange";
import Messagerie from "./pages/Messagerie";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        {/* Routes Super Admin */}
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="tickets" element={<SuperAdminTickets />} />
          <Route path="stats" element={<Stats />} />
          <Route path="machines" element={<Machines />} />
          <Route path="processes" element={<Processes />} />
          <Route path="secteurs" element={<Secteurs />} />
          <Route path="fournisseurs" element={<Fournisseurs />} />
          <Route path="pieces-rechange" element={<PiecesRechange />} />
          <Route path="creer-ticket" element={<CreateTicket />} />
          <Route path="messagerie" element={<Messagerie />} />
        </Route>

        {/* Routes Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
           <Route path="stats" element={<Stats />} />
           <Route path="processes" element={<Processes />} />
           <Route path="secteurs" element={<Secteurs />} />
           <Route path="fournisseurs" element={<Fournisseurs />} />
           <Route path="pieces-rechange" element={<PiecesRechange />} />
           <Route path="users" element={<Users />} />
           <Route path="tickets" element={<SuperAdminTickets />} />
           <Route path="machines" element={<Machines />} />
           <Route path="creer-ticket" element={<CreateTicket />} />
           <Route path="messagerie" element={<Messagerie />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
