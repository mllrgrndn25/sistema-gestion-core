"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { theme } from "@/lib/theme";

interface Persona {
  idpersona: number;
  nom1: string;
  nom2: string;
  apell1: string;
  apell2: string;
  correo: string;
  movil: string;
  direccion: string;
  tipo: string;
  estado: boolean;
}

const TIPOS = ["Empleado", "Cliente", "Director", "Proveedor"];

const formVacio = { nom1: "", nom2: "", apell1: "", apell2: "", correo: "", movil: "", direccion: "", tipo: "" };

export default function PersonaPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [perfil, setPerfil] = useState("");
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    setPerfil(localStorage.getItem("perfil") || "");
    cargarPersonas();
  }, []);

  const cargarPersonas = async () => {
    setCargando(true);
    const { data } = await supabase
      .from("persona").select("*").eq("estado", true).order("idpersona", { ascending: false });
    if (data) setPersonas(data);
    setCargando(false);
  };

  // CREATE / UPDATE
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipo) return alert("Por favor, seleccione el tipo de persona.");

    if (editandoId !== null) {
      // UPDATE
      const { error } = await supabase.from("persona").update({ ...form }).eq("idpersona", editandoId);
      if (error) alert("Error al actualizar: " + error.message);
      else {
        setForm(formVacio);
        setEditandoId(null);
        cargarPersonas();
      }
    } else {
      // INSERT
      const { error } = await supabase.from("persona").insert([{ ...form, estado: true }]);
      if (error) alert("Error al registrar: " + error.message);
      else {
        setForm(formVacio);
        cargarPersonas();
      }
    }
  };

  const iniciarEdicion = (p: Persona) => {
    setEditandoId(p.idpersona);
    setForm({
      nom1: p.nom1, nom2: p.nom2 || "", apell1: p.apell1, apell2: p.apell2 || "",
      correo: p.correo, movil: p.movil || "", direccion: p.direccion || "", tipo: p.tipo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm(formVacio);
  };

  // DELETE lógico
  const handleInhabilitar = async (id: number) => {
    if (perfil !== "Administrador") {
      return alert("Acceso Denegado: Solo el Administrador puede inhabilitar registros.");
    }
    if (!confirm("¿Está seguro de inhabilitar esta persona? Se desactivará del sistema.")) return;
    const { error } = await supabase.from("persona").update({ estado: false }).eq("idpersona", id);
    if (!error) cargarPersonas();
  };

  const badgeColor = (tipo: string) => {
    const c: Record<string, string> = {
      Director: theme.accent,
      Cliente: "#4caf50",
      Empleado: "#42a5f5",
      Proveedor: "#ab47bc",
    };
    return c[tipo] || theme.paragraph;
  };

  return (
    <div style={{
      backgroundColor: theme.bg,
      minHeight: "100vh",
      padding: "3rem 1.5rem",
      fontFamily: "Inter, system-ui, sans-serif",
      backgroundImage: "radial-gradient(ellipse at 90% 10%, #1a3521 0%, transparent 50%)",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: theme.primary, fontWeight: "700", letterSpacing: "2px", marginBottom: "0.3rem" }}>
              🌿 ECOCORE
            </div>
            <h1 style={{ color: theme.headline, fontSize: "2rem", fontWeight: "900", margin: 0 }}>
              Gestión de <span style={{ color: theme.accent }}>Personas</span>
            </h1>
            <p style={{ color: theme.paragraph, fontSize: "0.85rem", marginTop: "4px" }}>
              Registro categorizado de personal, clientes y proveedores
            </p>
          </div>
          <Link href="/dashboard" style={{
            color: theme.headline, textDecoration: "none", fontWeight: "600",
            border: `1px solid ${theme.stroke}`, padding: "10px 20px",
            borderRadius: "10px", fontSize: "0.85rem",
          }}>
            ← VOLVER
          </Link>
        </motion.header>

        {/* Formulario CREATE / EDIT */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            backgroundColor: theme.surface,
            padding: "2.5rem",
            borderRadius: "20px",
            border: `1px solid ${editandoId ? theme.accent : theme.stroke}`,
            marginBottom: "2.5rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            transition: "border-color 0.3s",
          }}
        >
          <h2 style={{ color: theme.headline, fontSize: "1rem", margin: "0 0 1.5rem", fontWeight: "700", letterSpacing: "1px" }}>
            {editandoId ? `✏ EDITANDO PERSONA #${editandoId}` : "➕ REGISTRAR NUEVA PERSONA"}
          </h2>

          <form onSubmit={handleGuardar}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
              {[
                { label: "PRIMER NOMBRE *", key: "nom1", placeholder: "Juan", required: true },
                { label: "SEGUNDO NOMBRE", key: "nom2", placeholder: "Carlos" },
                { label: "PRIMER APELLIDO *", key: "apell1", placeholder: "Pérez", required: true },
                { label: "SEGUNDO APELLIDO", key: "apell2", placeholder: "García" },
                { label: "CORREO ELECTRÓNICO *", key: "correo", placeholder: "juan@correo.com", type: "email", required: true },
                { label: "MÓVIL", key: "movil", placeholder: "300 000 0000" },
                { label: "DIRECCIÓN", key: "direccion", placeholder: "Calle 123..." },
              ].map(({ label, key, placeholder, type, required }) => (
                <div key={key}>
                  <label style={{ display: "block", color: theme.primary, fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1px", marginBottom: "0.5rem" }}>
                    {label}
                  </label>
                  <input
                    required={required}
                    type={type || "text"}
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={{
                      width: "100%", padding: "0.9rem", backgroundColor: theme.inputBg,
                      border: `1px solid ${theme.stroke}`, color: theme.headline,
                      borderRadius: "12px", outline: "none", fontSize: "0.9rem", boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", color: theme.primary, fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1px", marginBottom: "0.5rem" }}>
                  CATEGORÍA / TIPO *
                </label>
                <select
                  required
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                  style={{
                    width: "100%", padding: "0.9rem", backgroundColor: theme.inputBg,
                    border: `1px solid ${theme.stroke}`, color: form.tipo ? theme.headline : theme.paragraph,
                    borderRadius: "12px", outline: "none", fontSize: "0.9rem", boxSizing: "border-box",
                  }}
                >
                  <option value="">Seleccione tipo...</option>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit"
                style={{
                  flex: 1, padding: "1.1rem",
                  backgroundColor: editandoId ? theme.accent : theme.primary,
                  color: "#fff", border: "none", borderRadius: "14px",
                  fontWeight: "bold", cursor: "pointer", fontSize: "1rem",
                }}
              >
                {editandoId ? "💾 ACTUALIZAR PERSONA" : "✅ REGISTRAR EN EL SISTEMA"}
              </motion.button>
              {editandoId && (
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  style={{
                    padding: "1.1rem 1.5rem", backgroundColor: "transparent",
                    color: theme.paragraph, border: `1px solid ${theme.stroke}`,
                    borderRadius: "14px", cursor: "pointer", fontWeight: "600",
                  }}
                >
                  CANCELAR
                </button>
              )}
            </div>
          </form>
        </motion.section>

        {/* Tabla READ */}
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: "20px",
          border: `1px solid ${theme.stroke}`,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}>
          <div style={{ padding: "1.5rem 2rem", borderBottom: `1px solid ${theme.stroke}` }}>
            <h2 style={{ color: theme.headline, fontSize: "1rem", margin: 0, fontWeight: "700", letterSpacing: "1px" }}>
              📋 PERSONAS ACTIVAS ({personas.length})
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: theme.surface2 }}>
                  {["PERSONA", "CATEGORÍA", "CONTACTO", "DIRECCIÓN", "ACCIONES"].map(h => (
                    <th key={h} style={{
                      padding: "1rem 1.5rem", color: theme.paragraph,
                      textAlign: h === "ACCIONES" ? "center" : "left",
                      fontSize: "0.72rem", letterSpacing: "1px", fontWeight: "700",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {cargando ? (
                    <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: theme.paragraph }}>Cargando...</td></tr>
                  ) : personas.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: theme.paragraph, opacity: 0.6 }}>🌿 No hay personas registradas.</td></tr>
                  ) : (
                    personas.map((p) => (
                      <motion.tr
                        key={p.idpersona}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ borderBottom: `1px solid ${theme.stroke}` }}
                      >
                        <td style={{ padding: "1.2rem 1.5rem" }}>
                          <div style={{ color: theme.headline, fontWeight: "600" }}>{p.nom1} {p.apell1}</div>
                          <div style={{ color: theme.paragraph, fontSize: "0.75rem", marginTop: "2px" }}>{p.correo}</div>
                        </td>
                        <td style={{ padding: "1.2rem 1.5rem" }}>
                          <span style={{
                            padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold",
                            backgroundColor: `${badgeColor(p.tipo)}22`,
                            color: badgeColor(p.tipo),
                            border: `1px solid ${badgeColor(p.tipo)}44`,
                          }}>
                            {p.tipo || "Sin Tipo"}
                          </span>
                        </td>
                        <td style={{ padding: "1.2rem 1.5rem", color: theme.paragraph, fontSize: "0.9rem" }}>
                          {p.movil || "—"}
                        </td>
                        <td style={{ padding: "1.2rem 1.5rem", color: theme.paragraph, fontSize: "0.85rem" }}>
                          {p.direccion || "—"}
                        </td>
                        <td style={{ padding: "1.2rem 1.5rem", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                            <button
                              onClick={() => iniciarEdicion(p)}
                              style={{
                                padding: "6px 14px", backgroundColor: `${theme.accent}22`,
                                color: theme.accent, border: `1px solid ${theme.accent}44`,
                                borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "bold",
                              }}
                            >
                              ✏ EDITAR
                            </button>
                            <button
                              onClick={() => handleInhabilitar(p.idpersona)}
                              style={{
                                padding: "6px 14px", backgroundColor: `${theme.danger}22`,
                                color: theme.danger, border: `1px solid ${theme.danger}44`,
                                borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "bold",
                              }}
                            >
                              ✖ INHABILITAR
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}