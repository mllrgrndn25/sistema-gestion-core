"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function PersonaPage() {
  const [personas, setPersonas] = useState<any[]>([]);
  const [perfil, setPerfil] = useState("");
  const [cargando, setCargando] = useState(true);
  
  // Estado del formulario con el nuevo campo "tipo"
  const [form, setForm] = useState({
    nom1: "", nom2: "", apell1: "", apell2: "",
    correo: "", movil: "", direccion: "", tipo: "" 
  });

  const theme = {
    bg: "#0f0e17",
    headline: "#fffffe",
    paragraph: "#a7a9be",
    button: "#ff8906",
    stroke: "#2e2f3e",
    cardBg: "#16161a",
    accent: "#3da9fc"
  };

  useEffect(() => {
    setPerfil(localStorage.getItem("perfil") || "");
    cargarPersonas();
  }, []);

  const cargarPersonas = async () => {
    setCargando(true);
    const { data } = await supabase.from("persona").select("*").eq("estado", true).order("idpersona", { ascending: false });
    if (data) setPersonas(data);
    setCargando(false);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipo) return alert("Por favor, seleccione el tipo de persona");

    const { error } = await supabase.from("persona").insert([{ ...form, estado: true }]);
    if (error) alert("Error: " + error.message);
    else {
      setForm({ nom1: "", nom2: "", apell1: "", apell2: "", correo: "", movil: "", direccion: "", tipo: "" });
      cargarPersonas();
    }
  };

  const handleInhabilitar = async (id: number) => {
    if (perfil !== "Administrador") {
      alert("Acceso Denegado: Solo el Administrador puede inhabilitar registros.");
      return;
    }
    await supabase.from("persona").update({ estado: false }).eq("idpersona", id);
    cargarPersonas();
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.paragraph, fontFamily: 'Inter, sans-serif', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <motion.header 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}
        >
          <div>
            <h1 style={{ color: theme.headline, fontSize: '2.2rem', fontWeight: '900', margin: 0 }}>Gestión de <span style={{color: theme.button}}>Personas</span></h1>
            <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>Registro categorizado de personal y clientes</p>
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: theme.headline, padding: '12px 24px', borderRadius: '14px', border: `1px solid ${theme.stroke}`, fontWeight: '600', transition: '0.3s' }}>
            ← VOLVER
          </Link>
        </motion.header>

        {/* Formulario Pulido */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          style={{ backgroundColor: theme.cardBg, padding: '2.5rem', borderRadius: '24px', border: `1px solid ${theme.stroke}`, marginBottom: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
        >
          <form onSubmit={handleGuardar}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              <div className="group">
                <label style={labelStyle(theme)}>PRIMER NOMBRE</label>
                <input required style={inputStyle(theme)} value={form.nom1} onChange={e => setForm({...form, nom1: e.target.value})} placeholder="Ej: Juan" />
              </div>
              <div>
                <label style={labelStyle(theme)}>PRIMER APELLIDO</label>
                <input required style={inputStyle(theme)} value={form.apell1} onChange={e => setForm({...form, apell1: e.target.value})} placeholder="Ej: Pérez" />
              </div>
              <div>
                <label style={labelStyle(theme)}>CORREO ELECTRÓNICO</label>
                <input required type="email" style={inputStyle(theme)} value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} placeholder="juan@correo.com" />
              </div>
              <div>
                <label style={labelStyle(theme)}>CATEGORÍA / TIPO</label>
                <select required style={inputStyle(theme)} value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                  <option value="">Seleccione tipo...</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Cliente">Cliente</option>
                  <option value="Director">Director</option>
                  <option value="Proveedor">Proveedor</option>
                </select>
              </div>
              <div>
                <label style={labelStyle(theme)}>MÓVIL</label>
                <input style={inputStyle(theme)} value={form.movil} onChange={e => setForm({...form, movil: e.target.value})} placeholder="300 000 0000" />
              </div>
              <div>
                <label style={labelStyle(theme)}>DIRECCIÓN</label>
                <input style={inputStyle(theme)} value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} placeholder="Calle 123..." />
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: "#f25f4c" }} whileTap={{ scale: 0.98 }}
              type="submit"
              style={{ width: '100%', marginTop: '2rem', padding: '1.2rem', backgroundColor: theme.button, color: theme.headline, border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: '0.3s' }}
            >
              REGISTRAR EN EL SISTEMA
            </motion.button>
          </form>
        </motion.section>

        {/* Tabla con Estilo Glassmorphism */}
        <div style={{ overflowX: 'auto', borderRadius: '20px', border: `1px solid ${theme.stroke}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: theme.cardBg }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: `2px solid ${theme.stroke}` }}>
                <th style={thStyle(theme)}>PERSONA</th>
                <th style={thStyle(theme)}>CATEGORÍA</th>
                <th style={thStyle(theme)}>CONTACTO</th>
                <th style={{ ...thStyle(theme), textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {personas.map((p) => (
                  <motion.tr 
                    key={p.idpersona}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ borderBottom: `1px solid ${theme.stroke}`, transition: '0.2s' }}
                  >
                    <td style={tdStyle(theme)}>
                      <div style={{ color: theme.headline, fontWeight: '600' }}>{p.nom1} {p.apell1}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{p.correo}</div>
                    </td>
                    <td style={tdStyle(theme)}>
                      <span style={badgeStyle(p.tipo, theme)}>{p.tipo || 'Sin Tipo'}</span>
                    </td>
                    <td style={tdStyle(theme)}>{p.movil || '---'}</td>
                    <td style={{ ...tdStyle(theme), textAlign: 'center' }}>
                      <button 
                        onClick={() => handleInhabilitar(p.idpersona)}
                        style={{ color: '#ef4565', background: 'rgba(239, 69, 101, 0.1)', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}
                      >
                        INHABILITAR
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Estilos de Apoyo (Puliendo distancias y colores)
const labelStyle = (theme: any) => ({ display: 'block', marginBottom: '8px', fontSize: '0.7rem', fontWeight: '700', color: theme.button, letterSpacing: '1px' });

const inputStyle = (theme: any) => ({
  width: '100%', padding: '1rem', backgroundColor: theme.bg, border: `1px solid ${theme.stroke}`,
  color: theme.headline, borderRadius: '14px', outline: 'none', fontSize: '0.9rem', transition: '0.3s', boxSizing: 'border-box' as 'border-box'
});

const thStyle = (theme: any) => ({ padding: '1.5rem', color: theme.headline, fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' as 'uppercase' });

const tdStyle = (theme: any) => ({ padding: '1.5rem', fontSize: '0.9rem' });

const badgeStyle = (tipo: string, theme: any) => {
  let color = theme.accent;
  if (tipo === 'Director') color = "#ff8906";
  if (tipo === 'Cliente') color = "#2cb67d";
  return {
    padding: '4px 12px', borderRadius: '20px', backgroundColor: `${color}22`, color: color, fontSize: '0.75rem', fontWeight: 'bold', border: `1px solid ${color}44`
  };
};