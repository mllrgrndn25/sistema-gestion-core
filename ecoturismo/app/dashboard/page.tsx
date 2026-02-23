"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [perfil, setPerfil] = useState("");
  const theme = {
    bg: "#0f0e17", // Fondo más profundo
    headline: "#fffffe",
    paragraph: "#a7a9be",
    button: "#ff8906", // Naranja vibrante para resaltar
    stroke: "#2e2f3e",
    cardBg: "rgba(255, 255, 255, 0.03)"
  };

  useEffect(() => {
    setPerfil(localStorage.getItem("perfil") || "Usuario");
  }, []);

  const modulos = [
    { title: "Personas", desc: "Gestión de datos y registros", link: "/persona", icon: "👤", color: "#3da9fc", admin: false },
    { title: "Perfiles", desc: "Roles y privilegios", link: "/perfil", icon: "🛡️", color: "#ef4565", admin: true },
    { title: "Usuarios", desc: "Cuentas y seguridad", link: "/usuario", icon: "🔑", color: "#7f5af0", admin: true },
  ].filter(m => !m.admin || perfil === "Administrador");

  // Animaciones
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '5rem 2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <motion.header 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', marginBottom: '5rem' }}
        >
          <span style={{ color: theme.button, fontWeight: 'bold', letterSpacing: '3px', fontSize: '0.8rem' }}>DASHBOARD CENTRAL</span>
          <h1 style={{ color: theme.headline, fontSize: '3.5rem', fontWeight: '900', margin: '10px 0' }}>
            Bienvenido, <span style={{ color: theme.button }}>{perfil}</span>
          </h1>
          <div style={{ width: '60px', h: '4px', background: theme.button, margin: '20px auto', borderRadius: '10px' }} />
        </motion.header>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}
        >
          {modulos.map((m, i) => (
            <Link href={m.link} key={i} style={{ textDecoration: 'none' }}>
              <motion.div 
                variants={item}
                whileHover={{ y: -12, backgroundColor: "rgba(255,255,255,0.06)", borderColor: m.color }}
                style={{ 
                  backgroundColor: theme.cardBg, 
                  padding: '3rem 2rem', 
                  borderRadius: '24px', 
                  border: `1px solid ${theme.stroke}`,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{m.icon}</div>
                <h3 style={{ color: theme.headline, fontSize: '1.5rem', marginBottom: '0.5rem' }}>{m.title}</h3>
                <p style={{ color: theme.paragraph, lineHeight: '1.6', fontSize: '0.9rem' }}>{m.desc}</p>
                <div style={{ marginTop: '2rem', height: '2px', width: '30%', background: m.color }} />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ textAlign: 'center', marginTop: '6rem' }}>
          <button 
            onClick={() => { localStorage.clear(); window.location.href="/"; }}
            style={{ background: 'none', border: `1px solid ${theme.stroke}`, color: theme.paragraph, padding: '12px 30px', borderRadius: '50px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', transition: '0.3s' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = theme.button}
            onMouseOut={(e) => e.currentTarget.style.borderColor = theme.stroke}
          >
            CERRAR SESIÓN SEGURA
          </button>
        </motion.div>
      </div>
    </div>
  );
}