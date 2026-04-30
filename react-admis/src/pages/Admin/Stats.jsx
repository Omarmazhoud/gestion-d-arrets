import { useEffect, useState } from "react";
import { getMachines } from "../../services/machineService";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function Stats() {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    getMachines().then((res) => setMachines(res.data));
  }, []);

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

  const barData = {
    labels: ["Total", "Actives", "En arrêt"],
    datasets: [
      {
        label: "Machines",
        data: [total, actifs, enArret],
        backgroundColor: ["#3498db", "#2ecc71", "#e74c3c"]
      }
    ]
  };

  return (
    <div style={{ padding: "30px", background: "#f4f6f9", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "30px" }}>Statistiques Machines</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "40px"
      }}>

        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
        }}>
          <h4>Gestion des Machines</h4>
          <Pie data={pieData} />
        </div>

        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
        }}>
          <h4>Comparaison</h4>
          <Bar data={barData} />
        </div>

      </div>
    </div>
  );
}

export default Stats;
