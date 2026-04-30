import { useEffect, useState } from "react";
import { getStats } from "../../services/statsService";
import { getNotificationsPiece, markNotificationAsRead } from "../../services/notificationPieceService";
import {
  FaUsers,
  FaTicketAlt,
  FaExclamationCircle,
  FaSpinner,
  FaCheckCircle,
  FaUserCog,
  FaUserShield,
  FaCircle,
  FaCogs,
  FaWrench,
  FaTimes
} from "react-icons/fa";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [user, setUser] = useState(null);
  const [notifsPiece, setNotifsPiece] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    loadStats();
    if (storedUser?.role === "SUPER_ADMIN") loadNotifs();
    const timer = setInterval(() => {
      loadStats();
      if (storedUser?.role === "SUPER_ADMIN") loadNotifs();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const loadNotifs = async () => {
    try {
      const { data } = await getNotificationsPiece();
      setNotifsPiece(data);
    } catch (e) {
      console.error("Error loading piece notifications", e);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (e) {
      console.error("Error loading stats", e);
    }
  };

  const isSuper = user?.role === "SUPER_ADMIN";

  const dashboardCards = [
    {
      title: "Utilisateurs (Total)",
      value: stats.totalUsers,
      icon: <FaUsers />,
      color: "#6366f1",
      subtitle: "Compte global"
    },
    {
      title: "Demandeurs Connectés",
      value: stats.onlineDemandeurs,
      icon: <FaCircle />,
      color: "#22c55e",
      subtitle: "En temps réel"
    },
    {
      title: "Exécuteurs en ligne",
      value: stats.onlineExecuteurs,
      icon: <FaUserCog />,
      color: "#f59e0b",
      subtitle: "Techniciens actifs"
    },
    {
      title: "Admins en ligne",
      value: stats.onlineAdmins,
      icon: <FaUserShield />,
      color: "#3b82f6",
      subtitle: "Supervision"
    },
    {
      title: "Tickets (Total)",
      value: stats.totalTickets,
      icon: <FaTicketAlt />,
      color: "#64748b",
      subtitle: "Historique"
    },
    {
      title: "Tickets Ouverts",
      value: stats.ticketsOuverts,
      icon: <FaExclamationCircle />,
      color: "#ef4444",
      subtitle: "Action urgente"
    },
    {
      title: "Tickets En Cours",
      value: stats.ticketsEnCours,
      icon: <FaSpinner />,
      color: "#F39200",
      subtitle: "Maintenance active"
    },
    {
      title: "Vérifiés / Fermés",
      value: (stats.ticketsVerifier || 0) + " / " + (stats.ticketsFermes || 0),
      icon: <FaCheckCircle />,
      color: "#16a34a",
      subtitle: "Validation"
    }
  ];

  return (
    <div style={containerStyle}>
      
      {/* WELCOME BANNER (Only for Admin to "improve") */}
      {!isSuper && (
        <div style={welcomeBanner}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={welcomeIcon}><FaCogs size={30} /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px" }}>Centre de Contrôle L-DTM</h2>
              <p style={{ margin: "4px 0 0 0", opacity: 0.8 }}>Bienvenue, {user?.nom}. Supervision opérationnelle du parc machine.</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION (For Super/Global context) */}
      {isSuper && (
        <header style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Strategie & Monitoring Global</h1>
            <p style={subtitleStyle}>Vue d'ensemble de l'usine et des accès sécurisés.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div 
              style={{ position: "relative", cursor: "pointer", background: "white", padding: "10px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}
              onClick={() => setShowNotifModal(true)}
            >
              <FaWrench size={24} color="var(--primary-bg)" />
              {notifsPiece.length > 0 && (
                <div style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "12px", fontWeight: "bold", border: "2px solid #f1f5f9" }}>
                  {notifsPiece.length}
                </div>
              )}
            </div>
            
            <div style={statusBadge}>
              <div style={pulse}></div>
              Super Admin LIVE
            </div>
          </div>
        </header>
      )}

      {/* STATS GRID */}
      <div style={gridStyle(isSuper)}>
        {dashboardCards.map((card, idx) => (
          <div key={idx} style={cardWrapper(card.color, isSuper)}>
            <div style={cardContent(isSuper)}>
              <div>
                <p style={cardSubtitle(isSuper)}>{card.subtitle}</p>
                <h3 style={cardTitle(isSuper)}>{card.title}</h3>
                <h2 style={cardValue(isSuper)}>{card.value || 0}</h2>
              </div>
              <div style={iconBox(card.color, isSuper)}>
                {card.icon}
              </div>
            </div>
            <div style={cardFooter(card.color)}></div>
          </div>
        ))}
      </div>

      {/* MODAL NOTIFICATIONS */}
      {showNotifModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "500px", maxWidth: "90%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px", color: "var(--primary-bg)" }}>
                <FaWrench color="#f59e0b" /> Alertes Pièces Inconnues
              </h2>
              <button 
                onClick={() => setShowNotifModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <FaTimes size={20} />
              </button>
            </div>

            {notifsPiece.length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "20px 0" }}>Aucune nouvelle alerte.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {notifsPiece.map(n => (
                  <div key={n.id} style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: "0 0 8px 0", color: "#92400e", fontWeight: "600", fontSize: "15px" }}>
                        Une nouvelle pièce de référence "{n.referencePiece}" a été utilisée.
                      </p>
                      <span style={{ fontSize: "12px", color: "#b45309" }}>Ticket ID: {n.ticketId}</span>
                    </div>
                    <button 
                      onClick={async () => {
                        await markNotificationAsRead(n.id);
                        loadNotifs();
                      }}
                      style={{ background: "#f59e0b", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                    >
                      Marquer lu
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== ADVANCED STYLES ===== */

const containerStyle = { width: "100%" };

const welcomeBanner = {
  background: "linear-gradient(90deg, var(--primary-bg) 0%, var(--secondary-bg) 100%)",
  color: "white",
  padding: "24px 30px",
  borderRadius: "20px",
  marginBottom: "32px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const welcomeIcon = {
  width: "60px",
  height: "60px",
  background: "rgba(255,255,255,0.1)",
  borderRadius: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#38bdf8",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "32px",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "900",
  color: "var(--primary-bg)",
  margin: 0,
};

const subtitleStyle = {
  color: "#64748b",
  fontSize: "15px",
  margin: "4px 0 0 0",
};

const statusBadge = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "#f1f5f9",
  padding: "10px 20px",
  borderRadius: "30px",
  fontSize: "13px",
  fontWeight: "800",
  color: "var(--primary-bg)",
};

const pulse = {
  width: "10px",
  height: "10px",
  background: "#f59e0b",
  borderRadius: "50%",
};

const gridStyle = (isSuper) => ({
  display: "grid",
  gridTemplateColumns: isSuper ? "repeat(3, 1fr)" : "repeat(auto-fit, minmax(260px, 1fr))",
  gap: isSuper ? "30px" : "24px",
});

const cardWrapper = (color, isSuper) => ({
  background: "white",
  borderRadius: "24px",
  overflow: "hidden",
  border: "1px solid #f1f5f9",
  boxShadow: isSuper ? "0 10px 40px rgba(0,0,0,0.06)" : "0 4px 12px rgba(0,0,0,0.03)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
  }
});

const cardContent = (isSuper) => ({
  padding: isSuper ? "32px" : "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const cardSubtitle = (isSuper) => ({
  fontSize: isSuper ? "12px" : "11px",
  fontWeight: "700",
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "8px",
});

const cardTitle = (isSuper) => ({
  fontSize: isSuper ? "18px" : "16px",
  fontWeight: "700",
  color: "#334155",
  margin: "0 0 16px 0",
});

const cardValue = (isSuper) => ({
  fontSize: isSuper ? "42px" : "32px",
  fontWeight: "900",
  color: "var(--primary-bg)",
  margin: 0,
});

const iconBox = (color, isSuper) => ({
  width: isSuper ? "70px" : "55px",
  height: isSuper ? "70px" : "55px",
  borderRadius: isSuper ? "20px" : "16px",
  background: `${color}15`,
  color: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: isSuper ? "32px" : "24px",
});

const cardFooter = (color) => ({
  height: "5px",
  background: color,
  width: "100%",
});
