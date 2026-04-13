import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  validateUser,
  deleteUser,
  updateUser
} from "../../services/userService";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editingId, setEditingId] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = storedUser?.role === "SUPER_ADMIN";

  const [form, setForm] = useState({
    nom: "",
    email: "",
    password: "",
    matricule: "",
    role: "ADMIN"
  });

  const roles = ["SUPER_ADMIN", "ADMIN", "DEMANDEUR", "EXECUTEUR"];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const resetForm = () => {
    setForm({
      nom: "",
      email: "",
      password: "",
      matricule: "",
      role: "ADMIN"
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await updateUser(editingId, form);
    } else {
      await createUser(form);
    }

    resetForm();
    loadUsers();
  };

  const handleEdit = (user) => {
    setForm({
      nom: user.nom,
      email: user.email,
      password: "",
      matricule: user.matricule,
      role: user.role
    });
    setEditingId(user.id);
  };

  const handleValidate = async (id) => {
    await validateUser(id);
    loadUsers();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cet utilisateur ?")) {
      await deleteUser(id);
      loadUsers();
    }
  };

  // Filtrage
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.nom?.toLowerCase().includes(search.toLowerCase()) ||
      user.matricule?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      filterRole === "" || user.role === filterRole;

    const matchesStatus =
      filterStatus === "" ||
      (filterStatus === "ACTIF" && user.actif) ||
      (filterStatus === "INACTIF" && !user.actif);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Gestion des Utilisateurs</h2>

      {/* FORMULAIRE - Visible Super Admin uniquement */}
      {isSuperAdmin && (
      <div className="card shadow mb-4">
        <div className="card-header bg-dark text-white">
          {editingId ? "Modifier Utilisateur" : "Ajouter Utilisateur"}
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="Nom"
                  value={form.nom}
                  onChange={(e) =>
                    setForm({ ...form, nom: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-2">
                <input
                  className="form-control"
                  placeholder="Matricule"
                  value={form.matricule}
                  onChange={(e) =>
                    setForm({ ...form, matricule: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-2">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Mot de passe"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required={!editingId}
                />
              </div>

              <div className="col-md-2">
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                >
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="mt-3 text-end">
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={resetForm}
                >
                  Annuler
                </button>
              )}

              <button className="btn btn-success">
                {editingId ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* FILTRES */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher nom ou matricule..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">Tous les rôles</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">En attente</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow">
        <div className="card-header bg-white fw-bold">
          Liste des Utilisateurs
        </div>

        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nom</th>
                <th>Matricule</th>
                <th>Email</th>
                <th>Role</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.nom}</td>
                  <td>{user.matricule}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge bg-primary">
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      user.actif ? "bg-success" : "bg-secondary"
                    }`}>
                      {user.actif ? "Actif" : "En attente"}
                    </span>
                  </td>
                  <td>
                    {isSuperAdmin && (
                      <>
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => handleEdit(user)}
                    >
                      Modifier
                    </button>

                    {!user.actif && (
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleValidate(user.id)}
                      >
                        Valider
                      </button>
                    )}

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(user.id)}
                    >
                      Supprimer
                    </button>
                      </>
                    )}
                    {!isSuperAdmin && <span className="text-muted">-</span>}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Users;