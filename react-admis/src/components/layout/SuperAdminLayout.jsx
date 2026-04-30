import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  HiChartPie,
  HiUsers,
  HiTicket,
  HiPlusCircle,
  HiPresentationChartLine,
  HiCog,
  HiOfficeBuilding,
  HiAdjustments,
  HiLogout,
  HiTruck,
  HiCollection,
  HiChat
} from "react-icons/hi";

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser || storedUser.role !== "SUPER_ADMIN") {
      navigate("/");
    } else {
      setUser(storedUser);

      // Heartbeat (Ping) toutes les 45 secondes
      const pingInterval = setInterval(() => {
        fetch(`http://192.168.0.100:8080/api/auth/ping/${storedUser.id}`, { method: 'POST' })
          .catch(err => console.error("Ping error", err));
      }, 45000);

      return () => clearInterval(pingInterval);
    }
  }, [navigate]);

  const logout = async () => {
    if (user && user.id) {
      try {
        await fetch(`http://192.168.0.100:8080/api/auth/logout/${user.id}`, { method: 'POST' });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("user");
    navigate("/");
  };

  const navLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    borderRadius: "12px",
    textDecoration: "none",
    color: isActive ? "#fff" : "rgba(255, 255, 255, 0.7)",
    background: isActive ? "var(--accent-blue)" : "transparent",
    fontWeight: isActive ? "600" : "500",
    transition: "all 0.2s ease",
    marginBottom: "4px",
    boxShadow: isActive ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "none",

  });

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f8fafc" }}>

      {/* SIDEBAR */}
      <aside style={sidebarStyle}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {/* BRAND/LOGO */}
          <div style={brandBox}>
            <div style={logoWrapper}>
              <img src="/logo.png" alt="Logo" style={logoImage} />
            </div>
            <div style={{ marginTop: "10px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "1px" }}>Entreprise</div>
              <h4 style={brandTitle}>L-DTM</h4>
            </div>
            <div style={separator}></div>
          </div>

          {/* MENU NAV */}
          <nav style={{ ...navContainer, flex: 1, overflowY: "auto", paddingRight: "8px" }}>
            <div style={menuGroupLabel}>GÉNÉRAL</div>
            <NavLink to="/super-admin/dashboard" style={navLinkStyle}>
              <HiChartPie size={20} /> Dashboard
            </NavLink>

            <div style={menuGroupLabel}>GESTION</div>
            <NavLink to="/super-admin/tickets" style={navLinkStyle}>
              <HiTicket size={20} /> Tickets
            </NavLink>
            <NavLink to="/super-admin/creer-ticket" style={navLinkStyle}>
              <HiPlusCircle size={20} /> Créer Ticket
            </NavLink>
            <NavLink to="/super-admin/users" style={navLinkStyle}>
              <HiUsers size={20} /> Utilisateurs
            </NavLink>
            <NavLink to="/super-admin/messagerie" style={navLinkStyle}>
              <HiChat size={20} /> Messagerie
            </NavLink>
            <NavLink to="/super-admin/machines" style={navLinkStyle}>
              <HiCog size={20} /> Machines
            </NavLink>

            <div style={menuGroupLabel}>PRODUCTION</div>
            <NavLink to="/super-admin/processes" style={navLinkStyle}>
              <HiAdjustments size={20} /> Processes
            </NavLink>
            <NavLink to="/super-admin/secteurs" style={navLinkStyle}>
              <HiOfficeBuilding size={20} /> Segments
            </NavLink>
            <NavLink to="/super-admin/fournisseurs" style={navLinkStyle}>
              <HiTruck size={20} /> Fournisseurs
            </NavLink>
            <NavLink to="/super-admin/pieces-rechange" style={navLinkStyle}>
              <HiCollection size={20} /> Pièces Rechange
            </NavLink>

            <div style={menuGroupLabel}>ANALYSE</div>
            <NavLink to="/super-admin/stats" style={navLinkStyle}>
              <HiPresentationChartLine size={20} /> Statistiques
            </NavLink>
          </nav>
        </div>

        {/* BOTTOM SECTION: USER & LOGOUT */}
        <div style={bottomSection}>
          {user && (
            <div style={userCard}>
              <div style={avatarCircle}>
                {user.nom?.charAt(0).toUpperCase()}
              </div>
              <div style={userDetails}>
                <div style={userName}>{user.nom}</div>
                <div style={userBadge}>SUPER ADMIN</div>
              </div>
            </div>
          )}

          <button onClick={logout} style={logoutButton}>
            <HiLogout size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={mainWrapper}>
        <div style={contentCard}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/* ===== ADVANCED INDUSTRIAL STYLES ===== */

const sidebarStyle = {
  width: "280px",
  background: "var(--primary-bg)",
  color: "var(--sidebar-text)",

  padding: "24px 16px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
  zIndex: 100,
};

const brandBox = {
  textAlign: "center",
  marginBottom: "32px",
};

const logoWrapper = {
  width: "60px",
  height: "60px",
  background: "white",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 12px",
  overflow: "hidden",
  padding: "4px",
};

const logoImage = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const brandTitle = {
  fontSize: "18px",
  fontWeight: "700",
  letterSpacing: "1px",
  color: "white",
  margin: 0,
};

const separator = {
  height: "1px",
  background: "rgba(148, 163, 184, 0.2)",
  width: "80%",
  margin: "16px auto 0",
};

const navContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const menuGroupLabel = {
  fontSize: "11px",
  fontWeight: "700",
  color: "rgba(255, 255, 255, 0.4)",

  letterSpacing: "1.5px",
  marginTop: "20px",
  marginBottom: "8px",
  paddingLeft: "12px",
};

const bottomSection = {
  marginTop: "auto",
  paddingTop: "24px",
  borderTop: "1px solid rgba(148, 163, 184, 0.1)",
};

const userCard = {
  background: "rgba(255, 255, 255, 0.1)",
  padding: "12px",
  borderRadius: "16px",

  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "16px",
  border: "1px solid rgba(148, 163, 184, 0.1)",
};

const avatarCircle = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  background: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  fontSize: "18px",
  color: "white",
  boxShadow: "0 4px 8px rgba(37, 99, 235, 0.2)",
};

const userDetails = {
  flex: 1,
  overflow: "hidden",
};

const userName = {
  fontWeight: "600",
  fontSize: "14px",
  color: "white",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const userBadge = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#38bdf8",
  textTransform: "uppercase",
};

const logoutButton = {
  width: "100%",
  background: "rgba(239, 68, 68, 0.15)",
  color: "#f87171",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  padding: "12px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "0.2s",
};

const mainWrapper = {
  flex: 1,
  padding: "32px",
  background: "#f1f5f9",
  overflowY: "auto",
};

const contentCard = {
  background: "white",
  minHeight: "100%",
  borderRadius: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 10px 40px rgba(0,0,0,0.03)",
  padding: "30px",
};
