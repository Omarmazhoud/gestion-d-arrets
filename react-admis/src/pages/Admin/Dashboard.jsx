import { useEffect, useState } from "react";
import {
  HiTicket,
  HiExclamationCircle,
  HiUsers,
  HiCog,
  HiCollection,
  HiClipboardList,
  HiBadgeCheck
} from "react-icons/hi";
import { getStats } from "../../services/statsService";
import { getTickets } from "../../services/ticketService";
import { getMachines } from "../../services/machineService";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [tickets, setTickets] = useState([]);
  const [machines, setMachines] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    loadData();
    const timer = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const statsData = await getStats();
      setStats(statsData);

      const ticketsRes = await getTickets();
      setTickets(ticketsRes.data || ticketsRes);

      const machinesRes = await getMachines();
      setMachines(machinesRes.data || machinesRes);
    } catch (e) {
      console.error("Error loading dashboard data", e);
    }
  };

  // Calculs pour l'analyse
  const machinesEnArret = machines.filter(m => m.enArret).length;
  const machinesOperationnelles = machines.length - machinesEnArret;

  const ticketsOuverts = tickets.filter(t => t.statut === "OUVERTE").length;
  const ticketsEnCours = tickets.filter(t => t.statut === "EN_COURS").length;
  const ticketsFermes = tickets.filter(t => t.statut === "FERMEE").length;
  
  const pieData = {
    labels: ["Ouverts", "En Cours", "Fermés"],
    datasets: [
      {
        data: [ticketsOuverts, ticketsEnCours, ticketsFermes],
        backgroundColor: ["#ef4444", "#f59e0b", "#22c55e"],
        borderWidth: 0
      }
    ]
  };

  const pieOptions = {
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
    },
    maintainAspectRatio: false
  };

  const dashboardCards = [
    {
      title: "Parc Machines",
      value: machines.length || 0,
      icon: <HiCog />,
      color: "#2563eb",
      subtitle: "Total actifs"
    },
    {
      title: "Total Tickets",
      value: tickets.length || 0,
      icon: <HiTicket />,
      color: "#1e293b",
      subtitle: "Historique"
    },
    {
      title: "Tickets Ouverts",
      value: ticketsOuverts || 0,
      icon: <HiExclamationCircle />,
      color: "#ef4444",
      subtitle: "Urgent"
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers || 0,
      icon: <HiUsers />,
      color: "#6366f1",
      subtitle: "Personnel"
    }
  ];

  return (
    <div style={containerStyle}>

      {/* WELCOME BANNER */}
      <div style={welcomeBanner}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={welcomeIcon}><HiCollection size={30} /></div>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>Centre de Contrôle L-DTM Admin</h2>
            <p style={{ margin: "4px 0 0 0", opacity: 0.9 }}>Bienvenue, {user?.nom}. Supervision en temps réel de votre secteur.</p>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div style={gridStyle}>
        {dashboardCards.map((card, idx) => (
          <div key={idx} style={cardWrapper(card.color)}>
            <div style={cardContent}>
              <div>
                <p style={cardSubtitle}>{card.subtitle}</p>
                <h3 style={cardTitle}>{card.title}</h3>
                <h2 style={cardValue}>{card.value}</h2>
              </div>
              <div style={iconBox(card.color)}>
                {card.icon}
              </div>
            </div>
            <div style={cardFooter(card.color)}></div>
          </div>
        ))}
      </div>

      {/* MAIN SECTION: TICKETS + SUMMARY */}
      <div style={mainContentLayout}>

        {/* LEFT: RECENT TICKETS */}
        <div style={ticketsSection}>
          <div style={sectionHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <HiClipboardList size={22} color="#2563eb" />
              <h3 style={sectionTitle}>Interventions Récentes</h3>
            </div>
            <span style={countLabel}>{tickets.length} tickets</span>
          </div>

          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Statut</th>
                  <th style={thStyle}>Poste</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 10).map(ticket => (
                  <tr key={ticket.id} style={trStyle}>
                    <td style={tdIdStyle}>#{ticket.id.toString().slice(-4)}</td>
                    <td style={tdStyle}>{ticket.description}</td>
                    <td style={tdStyle}>
                      <span style={statusBadge(ticket.statut)}>
                        {ticket.statut}
                      </span>
                      {ticket.priorite === "HAUTE" && (
                        <span style={{ marginLeft: "8px", fontSize: "16px" }} title="Priorité Haute">🔥</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={machineTag}>
                        {ticket.typePoste === "MACHINE" 
                          ? `Machine: ${ticket.machine?.nom || "Non spécifié"}`
                          : (ticket.typePoste || "Non spécifié")
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: SUMMARY CARD */}
        <div style={summarySidebar}>
          <div style={summaryCard}>
            <div style={sectionHeader}>
              <h3 style={sectionTitle}>Résumé Analytique</h3>
            </div>
            <div style={summaryItem}>
              <span>Tickets Ouverts</span>
              <strong style={{ color: "#ef4444" }}>{ticketsOuverts}</strong>
            </div>
            <div style={summaryItem}>
              <span>En Cours d'intervention</span>
              <strong style={{ color: "#f59e0b" }}>{ticketsEnCours}</strong>
            </div>
            <div style={summaryItem}>
              <span>Machines opérationnelles</span>
              <strong style={{ color: "#22c55e" }}>
                {machines.length > 0 ? `${machinesOperationnelles} / ${machines.length}` : "--"}
              </strong>
            </div>
            <div style={summarySeparator}></div>
            
            {/* GRAPHIQUE */}
            <div style={{ height: "200px", marginBottom: "20px" }}>
              <Pie data={pieData} options={pieOptions} />
            </div>

            <div style={statQuote}>
              <HiBadgeCheck color="#22c55e" size={20} />
              <span>{machinesOperationnelles === machines.length && machines.length > 0 ? "Parc machine sous contrôle." : "Interventions nécessaires en cours."}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const containerStyle = { width: "100%" };

const welcomeBanner = {
  background: "linear-gradient(135deg, var(--primary-bg) 0%, var(--accent-blue) 100%)",
  color: "white",
  padding: "32px",
  borderRadius: "24px",
  marginBottom: "32px",
  boxShadow: "0 10px 40px rgba(37, 99, 235, 0.15)",
};

const welcomeIcon = {
  width: "64px",
  height: "64px",
  background: "rgba(255,255,255,0.15)",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "24px",
  marginBottom: "32px",
};

const cardWrapper = (color) => ({
  background: "white",
  borderRadius: "20px",
  overflow: "hidden",
  border: "1px solid #f1f5f9",
  boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
});

const cardContent = {
  padding: "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const cardSubtitle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "4px",
};

const cardTitle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#334155",
  margin: "0 0 8px 0",
};

const cardValue = {
  fontSize: "28px",
  fontWeight: "800",
  color: "var(--primary-bg)",
  margin: 0,
};

const iconBox = (color) => ({
  width: "50px",
  height: "50px",
  borderRadius: "14px",
  background: `${color}10`,
  color: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
});

const cardFooter = (color) => ({
  height: "4px",
  background: color,
  width: "100%",
});

const mainContentLayout = {
  display: "flex",
  gap: "24px",
};

const ticketsSection = {
  flex: 2,
  background: "white",
  borderRadius: "24px",
  padding: "24px",
  border: "1px solid #f1f5f9",
  boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
};

const summarySidebar = {
  flex: 1,
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "var(--primary-bg)",
  margin: 0,
};

const countLabel = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#64748b",
  background: "#f1f5f9",
  padding: "4px 12px",
  borderRadius: "20px",
};

const tableWrapper = {
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #f1f5f9",
  fontSize: "12px",
  fontWeight: "700",
  color: "#94a3b8",
  textTransform: "uppercase",
};

const trStyle = {
  borderBottom: "1px solid #f8fafc",
};

const tdStyle = {
  padding: "16px 12px",
  fontSize: "14px",
  color: "#334155",
};

const tdIdStyle = {
  padding: "16px 12px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#2563eb",
};

const statusBadge = (status) => {
  let bg = "#f1f5f9";
  let color = "#475569";
  if (status === "OUVERTE") { bg = "#fee2e2"; color = "#ef4444"; }
  if (status === "EN_COURS") { bg = "#fff7ed"; color = "#f59e0b"; }
  if (status === "A_VERIFIER_QUALITE") { bg = "#ede9fe"; color = "#7c3aed"; }
  if (status === "FERMEE") { bg = "#dcfce7"; color = "#22c55e"; }

  return {
    background: bg,
    color: color,
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
  };
};

const machineTag = {
  background: "#f8fafc",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "600",
  border: "1px solid #e2e8f0",
};

const summaryCard = {
  background: "white",
  borderRadius: "24px",
  padding: "24px",
  border: "1px solid #f1f5f9",
  height: "100%",
};

const summaryItem = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 0",
  borderBottom: "1px dashed #f1f5f9",
  fontSize: "14px",
  color: "#64748b",
};

const summarySeparator = {
  height: "20px",
};

const statQuote = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#f0fdf4",
  padding: "16px",
  borderRadius: "16px",
  color: "#166534",
  fontSize: "13px",
  fontWeight: "600",
};
