"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { theme } from "@/lib/theme";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    const { data, error } = await supabase
      .from("usuario")
      .select("*, perfil(descripc)")
      .eq("nombreu", usuario)
      .eq("estado", true)
      .single();

    if (error || !data || data.contrasena !== password) {
      setMensaje("Credenciales inválidas. Verifique su usuario y contraseña.");
      setCargando(false);
    } else {
      localStorage.setItem("perfil", data.perfil.descripc);
      router.push("/dashboard");
    }
  };

  return (
    <div style={{
      backgroundColor: theme.bg,
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      fontFamily: "Inter, system-ui, sans-serif",
      backgroundImage: "radial-gradient(ellipse at 20% 50%, #1a3521 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, #0f2d14 0%, transparent 50%)",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: theme.surface,
          padding: "3.5rem",
          borderRadius: "24px",
          border: `1px solid ${theme.stroke}`,
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo / Marca */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🌿</div>
          <h1 style={{ color: theme.headline, fontSize: "2rem", fontWeight: "900", margin: 0, letterSpacing: "-1px" }}>
            ECO<span style={{ color: theme.primary }}>CORE</span>
          </h1>
          <p style={{ color: theme.paragraph, fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Sistema de Gestión Ecoturismo
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={{ display: "block", color: theme.paragraph, fontSize: "0.75rem", fontWeight: "700", letterSpacing: "1px", marginBottom: "0.5rem" }}>
              USUARIO
            </label>
            <input
              required
              placeholder="Nombre de usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              style={{
                width: "100%", padding: "1rem", backgroundColor: theme.inputBg,
                border: `1px solid ${theme.stroke}`, borderRadius: "12px",
                color: theme.headline, outline: "none", fontSize: "0.95rem", boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: theme.paragraph, fontSize: "0.75rem", fontWeight: "700", letterSpacing: "1px", marginBottom: "0.5rem" }}>
              CONTRASEÑA
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%", padding: "1rem", backgroundColor: theme.inputBg,
                border: `1px solid ${theme.stroke}`, borderRadius: "12px",
                color: theme.headline, outline: "none", fontSize: "0.95rem", boxSizing: "border-box",
              }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "#43a047" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={cargando}
            style={{
              padding: "1.1rem", backgroundColor: theme.primary,
              color: "#fff", border: "none", borderRadius: "12px",
              fontWeight: "bold", cursor: "pointer", fontSize: "1rem",
              marginTop: "0.5rem", transition: "0.3s",
            }}
          >
            {cargando ? "VERIFICANDO..." : "INGRESAR AL SISTEMA"}
          </motion.button>
        </form>

        {mensaje && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: theme.danger, textAlign: "center", marginTop: "1.2rem", fontSize: "0.85rem" }}
          >
            {mensaje}
          </motion.p>
        )}

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link href="/recuperar" style={{ color: theme.paragraph, textDecoration: "none", fontSize: "0.8rem" }}>
            ¿Olvidaste tus credenciales?
          </Link>
        </div>
      </motion.div>
    </div>
  );
}