import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/superAdmin/Login";

import Dashboard from "../pages/superAdmin/Dashboard";
import Users from "../pages/superAdmin/Users";
import Tickets from "../pages/superAdmin/Tickets";
import Stats from "../pages/superAdmin/Stats";

import SuperAdminLayout from "../components/layout/SuperAdminLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        {/* SUPER ADMIN ROUTES */}
        <Route path="/super-admin" element={<SuperAdminLayout />}>

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="stats" element={<Stats />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
