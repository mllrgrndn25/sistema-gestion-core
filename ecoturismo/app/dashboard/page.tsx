"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { theme } from "@/lib/theme";

export default function DashboardPage() {
  const [perfil, setPerfil] = useState("");

  useEffect(() => {
    setPerfil(localStorage.getItem("perfil") || "Usuario");
  }, []);

  const modulos = [
    { title: "Personas", desc: "Gestión de empleados, clientes y proveedores", link: "/persona", icon: "👤", color: theme.accent },
    { title: "Perfiles", desc: "Roles y privilegios del sistema", link: "/perfil", icon: "🛡️", color: theme.primary, admin: true },
    { title: "Usuarios", desc: "Cuentas y acceso al sistema", link: "/usuario", icon: "🔑", color: "#42a5f5", admin: true },
  ].filter(m => !m.admin || perfil === "Administrador");

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const item: Variants = {
    hidden: { y: 25, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 90 } },
  };

  return (
    <div style={{
      backgroundColor: theme.bg,
      minHeight: "100vh",
      padding: "4rem 2rem",
      fontFamily: "Inter, system-ui, sans-serif",
      backgroundImage: "radial-gradient(ellipse at 10% 20%, #1a3521 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, #0f2d14 0%, transparent 50%)",
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "5rem" }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🌿</div>
          <span style={{ color: theme.primary, fontWeight: "bold", letterSpacing: "3px", fontSize: "0.75rem" }}>
            ECOCORE — PANEL CENTRAL
          </span>
          <h1 style={{ color: theme.headline, fontSize: "3rem", fontWeight: "900", margin: "0.5rem 0" }}>
            Bienvenido, <span style={{ color: theme.accent }}>{perfil}</span>
          </h1>
          <p style={{ color: theme.paragraph, fontSize: "0.9rem" }}>
            Selecciona un módulo para continuar
          </p>
          <div style={{ width: "60px", height: "3px", background: theme.primary, margin: "1.5rem auto 0", borderRadius: "10px" }} />
        </motion.header>

        {/* Módulos */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}
        >
          {modulos.map((m, i) => (
            <Link href={m.link} key={i} style={{ textDecoration: "none" }}>
              <motion.div
                variants={item}
                whileHover={{ y: -10, borderColor: m.color, backgroundColor: theme.surface2 }}
                style={{
                  backgroundColor: theme.surface,
                  padding: "2.5rem 2rem",
                  borderRadius: "20px",
                  border: `1px solid ${theme.stroke}`,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "2.8rem", marginBottom: "1.2rem" }}>{m.icon}</div>
                <h3 style={{ color: theme.headline, fontSize: "1.4rem", margin: "0 0 0.5rem" }}>{m.title}</h3>
                <p style={{ color: theme.paragraph, fontSize: "0.88rem", lineHeight: "1.6", margin: 0 }}>{m.desc}</p>
                <div style={{ marginTop: "1.8rem", height: "3px", width: "35%", background: m.color, borderRadius: "10px" }} />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Cerrar sesión */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ textAlign: "center", marginTop: "5rem" }}
        >
          <button
            onClick={() => { localStorage.clear(); window.location.href = "/"; }}
            style={{
              background: "none", border: `1px solid ${theme.stroke}`,
              color: theme.paragraph, padding: "12px 32px",
              borderRadius: "50px", cursor: "pointer",
              fontSize: "0.8rem", fontWeight: "600", transition: "0.3s",
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = theme.primary}
            onMouseOut={(e) => e.currentTarget.style.borderColor = theme.stroke}
          >
            🌱 CERRAR SESIÓN
          </button>
        </motion.div>
      </div>
    </div>
  );
}