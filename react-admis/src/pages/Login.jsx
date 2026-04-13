import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const user = await login(normalizedEmail, password);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "SUPER_ADMIN") {
        navigate("/super-admin/dashboard");
      } else if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        setErrorMsg("Accès non autorisé au portail administration.");
      }
    } catch (error) {
      let msg = "Email ou mot de passe incorrect";
      if (error.response && error.response.data && error.response.data.error) {
        msg = error.response.data.error;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={loginCard}>
        {/* LOGO & TITLE */}
        <div style={headerSection}>
          <div style={logoContainer}>
            <img src="/logo.jpg" alt="LEONI Logo" style={logoStyle} />
          </div>
          <h2 style={titleStyle}>LEONI Maintenance</h2>
          <p style={subtitleStyle}>Portail d'administration industrielle</p>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div style={errorBanner}>
            {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} style={formStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>Adresse Email</label>
            <div style={inputWrapper}>
              <HiMail style={inputIcon} />
              <input
                type="email"
                placeholder="nom@leoni.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={fieldStyle}
                required
              />
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Mot de passe</label>
            <div style={inputWrapper}>
              <HiLockClosed style={inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={fieldStyle}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
              >
                {showPassword ? <HiEyeOff /> : <HiEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={submitButtonStyle(loading)}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div style={footerStyle}>
          &copy; 2026 LEONI Wiring Systems. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}

/* ===== MODERN LOGIN STYLES ===== */

const containerStyle = {
  height: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  fontFamily: "'Inter', sans-serif",
};

const loginCard = {
  width: "100%",
  maxWidth: "420px",
  background: "white",
  padding: "48px 40px",
  borderRadius: "24px",
  boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
};

const headerSection = {
  textAlign: "center",
  marginBottom: "32px",
};

const logoContainer = {
  width: "80px",
  height: "80px",
  margin: "0 auto 20px",
  background: "#f8fafc",
  padding: "10px",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

const logoStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#0f172a",
  margin: "0 0 8px 0",
};

const subtitleStyle = {
  color: "#64748b",
  fontSize: "14px",
  margin: 0,
};

const errorBanner = {
  background: "#fee2e2",
  color: "#ef4444",
  padding: "12px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "600",
  textAlign: "center",
  marginBottom: "24px",
  border: "1px solid rgba(239, 68, 68, 0.1)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const inputWrapper = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const inputIcon = {
  position: "absolute",
  left: "16px",
  fontSize: "18px",
  color: "#94a3b8",
};

const fieldStyle = {
  width: "100%",
  padding: "14px 16px 14px 48px",
  borderRadius: "14px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  fontSize: "15px",
  outline: "none",
  transition: "border-color 0.2s",
  "&:focus": {
    borderColor: "#2563eb",
  },
};

const eyeButtonStyle = {
  position: "absolute",
  right: "12px",
  background: "none",
  border: "none",
  color: "#94a3b8",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
};

const submitButtonStyle = (loading) => ({
  marginTop: "12px",
  background: loading ? "#94a3b8" : "#2563eb",
  color: "white",
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  fontSize: "16px",
  fontWeight: "700",
  cursor: loading ? "default" : "pointer",
  transition: "all 0.2s",
  boxShadow: loading ? "none" : "0 8px 20px rgba(37, 99, 235, 0.3)",
});

const footerStyle = {
  marginTop: "40px",
  textAlign: "center",
  fontSize: "11px",
  color: "#94a3b8",
  fontWeight: "500",
};

