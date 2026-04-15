import { useEffect, useState } from "react";
import { getMachines } from "../../services/machineService";
import { getTickets } from "../../services/ticketService";
import { getUsers } from "../../services/userService";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

function Stats() {
  const [machines, setMachines] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(new Date().getFullYear());

  useEffect(() => {
    getMachines().then((res) => setMachines(res.data)).catch(() => {});
    getUsers().then((res) => setUsers(res)).catch(() => {});
    
    getTickets().then((res) => {
      const ticketsData = res.data;
      setTickets(ticketsData);
      
      // Auto-sélection de l'année la plus récente trouvée dans les tickets
      if (ticketsData.length > 0) {
        const annees = ticketsData
          .filter(t => t.dateCreation)
          .map(t => new Date(t.dateCreation).getFullYear());
        
        if (annees.length > 0) {
          const maxAnnee = Math.max(...annees);
          setAnneeSelectionnee(maxAnnee);
        }
      }
    }).catch(() => {});
  }, []);

  /* =========================
     1. Répartition Machines
  ========================== */
  const total = machines.length;
  const enArret = machines.filter((m) => m.enArret).length;
  const actifs = total - enArret;

  const pieData = {
    labels: ["Actives", "En arrêt"],
    datasets: [
      {
        data: [actifs, enArret],
        backgroundColor: ["#2ecc71", "#e74c3c"]
      }
    ]
  };

  /* =========================
     2. Pannes par machine (Filtré par année)
  ========================== */
  const panneParMachine = {};
  machines.forEach((m) => {
    panneParMachine[m.nom] = 0;
  });

  tickets.forEach((t) => {
    if (t.machine && t.machine.nom && t.dateCreation) {
      const d = new Date(t.dateCreation);
      if (d.getFullYear() === anneeSelectionnee) {
        const nom = t.machine.nom;
        panneParMachine[nom] = (panneParMachine[nom] || 0) + 1;
      }
    }
  });

  const panneMachineData = {
    labels: Object.keys(panneParMachine),
    datasets: [
      {
        label: `Pannes en ${anneeSelectionnee}`,
        data: Object.values(panneParMachine),
        backgroundColor: "#f39c12"
      }
    ]
  };

  /* =========================
     3. Pannes par type
  ========================== */
  const panneParType = {};
  tickets.forEach((t) => {
    const type = t.typePanne || "Autre";
    panneParType[type] = (panneParType[type] || 0) + 1;
  });

  const panneTypeData = {
    labels: Object.keys(panneParType),
    datasets: [
      {
        label: "Pannes par type",
        data: Object.values(panneParType),
        backgroundColor: "#3498db"
      }
    ]
  };

  /* =========================
     4. Temps moyen réparation par type panne
  ========================== */
  const dureeParType = {};
  const countParType = {};

  tickets.forEach((t) => {
    if (t.duree) {
      const type = t.typePanne;
      dureeParType[type] = (dureeParType[type] || 0) + t.duree;
      countParType[type] = (countParType[type] || 0) + 1;
    }
  });

  const tempsMoyenLabels = Object.keys(dureeParType);
  const tempsMoyenData = tempsMoyenLabels.map(
    (type) => (dureeParType[type] / countParType[type]).toFixed(2)
  );

  const tempsMoyenChart = {
    labels: tempsMoyenLabels,
    datasets: [
      {
        label: "Temps moyen réparation (heures)",
        data: tempsMoyenData,
        backgroundColor: "#9b59b6"
      }
    ]
  };

  /* =========================
     5. Performance exécuteur
  ========================== */
  const dureeExec = {};
  const countExec = {};

  tickets.forEach((t) => {
    if (t.duree) {
      const exec = t.typeExecuteur;
      dureeExec[exec] = (dureeExec[exec] || 0) + t.duree;
      countExec[exec] = (countExec[exec] || 0) + 1;
    }
  });

  const execLabels = Object.keys(dureeExec);
  const execData = execLabels.map(
    (e) => (dureeExec[e] / countExec[e]).toFixed(2)
  );

  const execChart = {
    labels: execLabels,
    datasets: [
      {
        label: "Performance exécuteur (temps moyen)",
        data: execData,
        backgroundColor: "#1abc9c"
      }
    ]
  };

  /* =========================
     6. Pannes par mois
  ========================== */
  const moisLabels = [
    "Jan", "Fev", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"
  ];

  const panneParMois = new Array(12).fill(0);

  tickets.forEach((t) => {
    if (t.dateCreation) {
      const d = new Date(t.dateCreation);
      const mois = d.getMonth();
      const annee = d.getFullYear();

      if (annee === anneeSelectionnee) {
        panneParMois[mois]++;
      }
    }
  });

  const moisData = {
    labels: moisLabels,
    datasets: [
      {
        label: "Nombre de pannes",
        data: panneParMois,
        borderColor: "#e67e22",
        backgroundColor: "#e67e22",
        fill: false
      }
    ]
  };

  /* =========================
     7. NOUVELLES FONCTIONS : Top 3 Pièces par mois
  ========================== */
  const countPiecesParMois = new Array(12).fill(null).map(() => ({}));
  tickets.forEach((t) => {
    if (t.dateCreation && t.referencePiece) {
      const d = new Date(t.dateCreation);
      if (d.getFullYear() === anneeSelectionnee) {
        // Gérer plusieurs pièces séparées par des virgules (ex: "Piece1, Piece2")
        const refs = t.referencePiece.split(",").map((r) => r.trim()).filter(Boolean);
        refs.forEach((r) => {
          countPiecesParMois[d.getMonth()][r] = (countPiecesParMois[d.getMonth()][r] || 0) + 1;
        });
      }
    }
  });

  const datasetTop1 = new Array(12).fill(0);
  const datasetTop2 = new Array(12).fill(0);
  const datasetTop3 = new Array(12).fill(0);
  const labelsTop1 = new Array(12).fill("");
  const labelsTop2 = new Array(12).fill("");
  const labelsTop3 = new Array(12).fill("");

  countPiecesParMois.forEach((compteurs, indexMois) => {
    const top3 = Object.entries(compteurs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (top3[0]) { datasetTop1[indexMois] = top3[0][1]; labelsTop1[indexMois] = top3[0][0]; }
    if (top3[1]) { datasetTop2[indexMois] = top3[1][1]; labelsTop2[indexMois] = top3[1][0]; }
    if (top3[2]) { datasetTop3[indexMois] = top3[2][1]; labelsTop3[indexMois] = top3[2][0]; }
  });

  const topPiecesData = {
    labels: moisLabels,
    datasets: [
      {
        label: "Top 1",
        data: datasetTop1,
        backgroundColor: "#e74c3c",
        pieceNames: labelsTop1
      },
      {
        label: "Top 2",
        data: datasetTop2,
        backgroundColor: "#f39c12",
        pieceNames: labelsTop2
      },
      {
        label: "Top 3",
        data: datasetTop3,
        backgroundColor: "#3498db",
        pieceNames: labelsTop3
      }
    ]
  };

  const topPiecesOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const pieceName = context.dataset.pieceNames[context.dataIndex];
            return pieceName ? `${pieceName} : ${context.raw} utilsations` : "Aucune";
          }
        }
      }
    }
  };


  /* =========================
     9. NOUVELLES FONCTIONS : Top 3 Machines par mois
  ========================== */
  const countMachinesParMois = new Array(12).fill(null).map(() => ({}));
  tickets.forEach((t) => {
    if (t.dateCreation && t.machine && t.machine.nom) {
      const d = new Date(t.dateCreation);
      if (d.getFullYear() === anneeSelectionnee) {
         const nom = t.machine.nom;
         countMachinesParMois[d.getMonth()][nom] = (countMachinesParMois[d.getMonth()][nom] || 0) + 1;
      }
    }
  });

  const datasetMachTop1 = new Array(12).fill(0);
  const datasetMachTop2 = new Array(12).fill(0);
  const datasetMachTop3 = new Array(12).fill(0);
  const labelsMachTop1 = new Array(12).fill("");
  const labelsMachTop2 = new Array(12).fill("");
  const labelsMachTop3 = new Array(12).fill("");

  countMachinesParMois.forEach((compteurs, indexMois) => {
    const top3 = Object.entries(compteurs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (top3[0]) { datasetMachTop1[indexMois] = top3[0][1]; labelsMachTop1[indexMois] = top3[0][0]; }
    if (top3[1]) { datasetMachTop2[indexMois] = top3[1][1]; labelsMachTop2[indexMois] = top3[1][0]; }
    if (top3[2]) { datasetMachTop3[indexMois] = top3[2][1]; labelsMachTop3[indexMois] = top3[2][0]; }
  });

  const topMachinesData = {
    labels: moisLabels,
    datasets: [
      {
        label: "Top 1",
        data: datasetMachTop1,
        backgroundColor: "#e84393",
        machineNames: labelsMachTop1
      },
      {
        label: "Top 2",
        data: datasetMachTop2,
        backgroundColor: "#fdcb6e",
        machineNames: labelsMachTop2
      },
      {
        label: "Top 3",
        data: datasetMachTop3,
        backgroundColor: "#00b894",
        machineNames: labelsMachTop3
      }
    ]
  };

  const topMachinesOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const machName = context.dataset.machineNames[context.dataIndex];
            return machName ? `${machName} : ${context.raw} pannes` : "Aucune";
          }
        }
      }
    }
  };

  return (
    <div style={{ padding: "30px", background: "#f4f6f9", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Dashboard Statistiques & IA</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontWeight: "bold" }}>Année :</label>
          <button 
            onClick={() => setAnneeSelectionnee((a) => Math.max(2020, a - 1))}
            style={btnYearLineStyle}
          >
            ◀
          </button>
          <select
            value={anneeSelectionnee}
            onChange={(e) => setAnneeSelectionnee(parseInt(e.target.value))}
            style={{ padding: "5px 10px", borderRadius: "5px", border: "1px solid #ccc", fontWeight: "bold" }}
          >
            {Array.from({ length: 16 }, (_, i) => 2020 + i).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button 
            onClick={() => setAnneeSelectionnee((a) => Math.min(2035, a + 1))}
            style={btnYearLineStyle}
          >
            ▶
          </button>
        </div>
      </div>

      <div style={grid}>
        <div style={cardStyle}>
          <h4>Répartition des Machines</h4>
          <Pie data={pieData} />
        </div>

        <div style={cardStyle}>
          <h4>Pannes par Type</h4>
          <Bar data={panneTypeData} />
        </div>

        <div style={cardStyle}>
          <h4>Temps Moyen Réparation</h4>
          <Bar data={tempsMoyenChart} />
        </div>

        <div style={cardStyle}>
          <h4>Performance Exécuteur</h4>
          <Bar data={execChart} />
        </div>

        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          <h4>Pannes par Machine</h4>
          <Bar data={panneMachineData} />
        </div>

        <div style={cardStyle}>
          <h4>Pannes par Mois</h4>
          <Line data={moisData} />
        </div>

        {/* Nouveaux graphiques des fonctionnalités */}
        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          <h4>Top 3 Pièces Rechange utilisées par mois</h4>
          <Bar data={topPiecesData} options={topPiecesOptions} />
        </div>

        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          <h4>Top 3 Machines avec pannes par mois</h4>
          <Bar data={topMachinesData} options={topMachinesOptions} />
        </div>

      </div>
    </div>
  );
}

/* ===== STYLE ===== */
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: "30px",
  marginTop: "20px"
};

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
};

const btnYearLineStyle = {
  background: "#3498db",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  transition: "0.2s"
};

export default Stats;