import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  validateUser,
  deleteUser,
  updateUser
} from "../../services/userService";
import { 
    FaUserPlus, 
    FaUserEdit, 
    FaTrash, 
    FaCheck, 
    FaSearch, 
    FaFilter, 
    FaEnvelope, 
    FaIdCard, 
    FaUserTag,
    FaLock,
    FaTools
} from "react-icons/fa";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = storedUser?.role === "SUPER_ADMIN";

  const [form, setForm] = useState({
    nom: "",
    email: "",
    password: "",
    matricule: "",
    role: "DEMANDEUR",
    typeExecuteur: "maintenance"
  });

  const roles = ["SUPER_ADMIN", "ADMIN", "DEMANDEUR", "EXECUTEUR"];
  const typesExec = [
    "maintenance",
    "informatique",
    "qualite",
    "logistique",
    "process",
    "batiment",
    "production",
    "autre"
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ nom: "", email: "", password: "", matricule: "", role: "DEMANDEUR", typeExecuteur: "maintenance" });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setForm({
      nom: user.nom,
      email: user.email,
      password: "",
      matricule: user.matricule,
      role: user.role,
      typeExecuteur: user.typeExecuteur || "maintenance"
    });
    setEditingId(user.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (editingId) {
            await updateUser(editingId, form);
        } else {
            await createUser(form);
        }
        setShowModal(false);
        loadUsers();
    } catch (err) {
        alert(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleValidate = async (id) => {
    if (window.confirm("Valider ce compte utilisateur ?")) {
        await validateUser(id);
        loadUsers();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer définitivement cet utilisateur ?")) {
      await deleteUser(id);
      loadUsers();
    }
  };

  // Filtrage
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.nom?.toLowerCase().includes(search.toLowerCase()) ||
      user.matricule?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "" ||
      (filterStatus === "ACTIF" && user.actif) ||
      (filterStatus === "INACTIF" && !user.actif);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Gestion des Utilisateurs</h1>
          <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Pilotez les accès et les rôles de vos collaborateurs.</p>
        </div>
        
        {isSuperAdmin && (
          <button
            onClick={handleOpenCreate}
            style={{
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 10px 15px -3px rgba(15,23,42,0.2)",
              transition: "transform 0.2s"
            }}
          >
            <FaUserPlus /> Nouvel Utilisateur
          </button>
        )}
      </div>

      {/* FILTRES BAR */}
      <div style={{ background: "white", padding: "20px", borderRadius: "18px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "30px", display: "flex", gap: "20px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <FaSearch style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Rechercher par nom ou matricule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 12px 12px 45px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", background: "#f8fafc" }}
          />
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", color: "#475569", cursor: "pointer" }}
          >
            <option value="">Tous les rôles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", color: "#475569", cursor: "pointer" }}
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="INACTIF">En attente</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: "white", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
            <tr>
              <th style={thStyle}>Profil</th>
              <th style={thStyle}>Matricule</th>
              <th style={thStyle}>Rôle</th>
              <th style={thStyle}>Type Exécuteur</th>
              <th style={thStyle}>Statut</th>
              {isSuperAdmin && <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }}>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e293b", fontWeight: "bold" }}>
                      {user.nom?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", color: "#0f172a" }}>{user.nom}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}><span style={{ fontFamily: "monospace", color: "#64748b" }}>{user.matricule}</span></td>
                <td style={tdStyle}>
                    <span style={roleBadge(user.role)}>{user.role}</span>
                </td>
                <td style={tdStyle}>
                    {user.role === "EXECUTEUR" ? (
                        <span style={{ fontSize: "13px", color: "#475569", fontWeight: "600" }}>{user.typeExecuteur || "N/A"}</span>
                    ) : "-"}
                </td>
                <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: user.actif ? "#10b981" : "#94a3b8" }}></div>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: user.actif ? "#065f46" : "#475569" }}>
                            {user.actif ? "Actif" : "En attente"}
                        </span>
                    </div>
                </td>
                {isSuperAdmin && (
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        {user.actif ? (
                            <button onClick={() => handleOpenEdit(user)} style={actionBtn("#3b82f6")} title="Modifier">
                                <FaUserEdit />
                            </button>
                        ) : (
                            <button onClick={() => handleValidate(user.id)} style={actionBtn("#10b981")} title="Valider le compte">
                                <FaCheck />
                            </button>
                        )}
                        <button onClick={() => handleDelete(user.id)} style={actionBtn("#ef4444")} title="Supprimer">
                            <FaTrash />
                        </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Aucun utilisateur correspondant à votre recherche.</div>
        )}
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={{ marginBottom: "25px" }}>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
                    {editingId ? "Édition du collaborateur" : "Créer un nouvel accès"}
                </h3>
                <p style={{ margin: "5px 0 0 0", color: "#64748b", fontSize: "14px" }}>Remplissez les informations obligatoires.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                        <label style={labelStyle}><FaIdCard /> Nom Complet</label>
                        <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required style={inputStyle} placeholder="Jean Dupont" />
                    </div>
                    <div>
                        <label style={labelStyle}><FaUserTag /> Matricule</label>
                        <input value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} required style={inputStyle} placeholder="L2024-X" />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}><FaEnvelope /> Adresse Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required style={inputStyle} placeholder="email@leoni.com" />
                </div>

                {!editingId && (
                    <div>
                        <label style={labelStyle}><FaLock /> Mot de passe provisoire</label>
                        <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required style={inputStyle} placeholder="••••••••" />
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                        <label style={labelStyle}>Rôle Système</label>
                        <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={inputStyle}>
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    
                    {form.role === "EXECUTEUR" && (
                        <div>
                            <label style={labelStyle}><FaTools /> Spécialité</label>
                            <select value={form.typeExecuteur} onChange={e => setForm({...form, typeExecuteur: e.target.value})} style={inputStyle}>
                                {typesExec.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "15px" }}>
                    <button type="button" onClick={() => setShowModal(false)} style={{ ...btnBase, background: "#f1f5f9", color: "#475569" }}>Annuler</button>
                    <button type="submit" style={{ ...btnBase, background: "#0f172a", color: "white", flex: 2 }}>
                        {editingId ? "Sauvegarder les modifications" : "Créer le compte"}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== STYLES ===== */
const thStyle = { padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" };
const tdStyle = { padding: "16px 24px", fontSize: "14px" };
const labelStyle = { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "8px", textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", background: "#f8fafc" };
const btnBase = { padding: "12px", borderRadius: "12px", border: "none", fontWeight: "700", cursor: "pointer", transition: "opacity 0.2s" };

const actionBtn = (color) => ({
    width: "35px", height: "35px", borderRadius: "10px", background: `${color}15`, color: color, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", fontSize: "16px"
});

const roleBadge = (role) => ({
    padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", background: role === "SUPER_ADMIN" ? "#fef2f2" : role === "ADMIN" ? "#eff6ff" : "#f0fdf4", color: role === "SUPER_ADMIN" ? "#ef4444" : role === "ADMIN" ? "#3b82f6" : "#22c55e", border: "1px solid currentColor"
});

const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(6px)" };
const modalContent = { background: "white", padding: "40px", borderRadius: "24px", width: "500px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" };

export default Users;