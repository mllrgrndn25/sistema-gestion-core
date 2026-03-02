"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { theme } from "@/lib/theme";

interface Usuario {
  idusuario: number;
  nombreu: string;
  contrasena: string;
  idpersona: number;
  idperfil: number;
  estado: boolean;
  persona?: { nom1: string; apell1: string };
  perfil?: { descripc: string };
}

interface Persona { idpersona: number; nom1: string; apell1: string; }
interface Perfil { idperfil: number; descripc: string; }

export default function UsuarioPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({ nombreu: "", contrasena: "", idpersona: "", idperfil: "" });

  // Estado para edición de perfil inline en tabla
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoPerfil, setEditandoPerfil] = useState("");

  const cargarDatos = async () => {
    setCargando(true);
    const { data: users } = await supabase
      .from("usuario")
      .select("*, persona(nom1, apell1), perfil(descripc)")
      .eq("estado", true);
    const { data: pers } = await supabase.from("persona").select("idpersona, nom1, apell1").eq("estado", true);
    const { data: perf } = await supabase.from("perfil").select("idperfil, descripc").eq("estado", true);

    if (users) setUsuarios(users);
    if (pers) setPersonas(pers);
    if (perf) setPerfiles(perf);
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  // CREATE
  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idpersona || !form.idperfil) return alert("Debe seleccionar una persona y un perfil.");
    const { error } = await supabase.from("usuario").insert([{
      nombreu: form.nombreu,
      contrasena: form.contrasena,
      idpersona: parseInt(form.idpersona),
      idperfil: parseInt(form.idperfil),
      estado: true,
    }]);
    if (error) {
      alert("Error: El usuario ya existe o la persona ya tiene un usuario asignado.");
    } else {
      setForm({ nombreu: "", contrasena: "", idpersona: "", idperfil: "" });
      cargarDatos();
    }
  };

  // UPDATE perfil
  const iniciarEdicionPerfil = (u: Usuario) => {
    setEditandoId(u.idusuario);
    setEditandoPerfil(String(u.idperfil));
  };

  const guardarEdicionPerfil = async (id: number) => {
    if (!editandoPerfil) return;
    const { error } = await supabase
      .from("usuario")
      .update({ idperfil: parseInt(editandoPerfil) })
      .eq("idusuario", id);
    if (error) alert("Error al actualizar: " + error.message);
    else {
      setEditandoId(null);
      cargarDatos();
    }
  };

  // DELETE lógico
  const inhabilitarUsuario = async (id: number) => {
    if (!confirm("¿Está seguro de inhabilitar este usuario? Perderá acceso al sistema.")) return;
    const { error } = await supabase.from("usuario").update({ estado: false }).eq("idusuario", id);
    if (!error) cargarDatos();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.9rem 1rem", backgroundColor: theme.inputBg,
    border: `1px solid ${theme.stroke}`, color: theme.headline,
    borderRadius: "12px", outline: "none", fontSize: "0.9rem", boxSizing: "border-box",
  };

  return (
    <div style={{
      backgroundColor: theme.bg,
      minHeight: "100vh",
      padding: "3rem 1.5rem",
      fontFamily: "Inter, system-ui, sans-serif",
      backgroundImage: "radial-gradient(ellipse at 20% 80%, #1a3521 0%, transparent 50%)",
    }}>
      <div style={{ maxWidth: "950px", margin: "0 auto" }}>

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
              Gestión de <span style={{ color: "#42a5f5" }}>Usuarios</span>
            </h1>
            <p style={{ color: theme.paragraph, fontSize: "0.85rem", marginTop: "4px" }}>
              Cuentas de acceso y seguridad del sistema
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

        {/* Formulario CREATE */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            backgroundColor: theme.surface,
            padding: "2.5rem",
            borderRadius: "20px",
            border: `1px solid ${theme.stroke}`,
            marginBottom: "2.5rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <h2 style={{ color: theme.headline, fontSize: "1rem", margin: "0 0 1.5rem", fontWeight: "700", letterSpacing: "1px" }}>
            ➕ CREAR ACCESO AL SISTEMA
          </h2>
          <form onSubmit={guardarUsuario}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
              <div>
                <label style={{ display: "block", color: theme.primary, fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1px", marginBottom: "0.5rem" }}>NOMBRE DE USUARIO *</label>
                <input required placeholder="username" style={inputStyle} value={form.nombreu} onChange={e => setForm({ ...form, nombreu: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", color: theme.primary, fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1px", marginBottom: "0.5rem" }}>CONTRASEÑA *</label>
                <input required type="password" placeholder="••••••••" style={inputStyle} value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", color: theme.primary, fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1px", marginBottom: "0.5rem" }}>ASIGNAR A PERSONA *</label>
                <select required style={{ ...inputStyle, color: form.idpersona ? theme.headline : theme.paragraph }}
                  value={form.idpersona} onChange={e => setForm({ ...form, idpersona: e.target.value })}>
                  <option value="">Seleccione una persona...</option>
                  {personas.map(p => <option key={p.idpersona} value={p.idpersona}>{p.nom1} {p.apell1}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: theme.primary, fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1px", marginBottom: "0.5rem" }}>ROL / PERFIL *</label>
                <select required style={{ ...inputStyle, color: form.idperfil ? theme.headline : theme.paragraph }}
                  value={form.idperfil} onChange={e => setForm({ ...form, idperfil: e.target.value })}>
                  <option value="">Seleccione un perfil...</option>
                  {perfiles.map(p => <option key={p.idperfil} value={p.idperfil}>{p.descripc}</option>)}
                </select>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit"
              style={{
                width: "100%", marginTop: "1.5rem", padding: "1.1rem",
                backgroundColor: theme.primary, color: "#fff",
                border: "none", borderRadius: "14px",
                fontWeight: "bold", cursor: "pointer", fontSize: "1rem",
              }}
            >
              ✅ CREAR USUARIO
            </motion.button>
          </form>
        </motion.section>

        {/* Tabla READ + UPDATE + DELETE */}
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: "20px",
          border: `1px solid ${theme.stroke}`,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}>
          <div style={{ padding: "1.5rem 2rem", borderBottom: `1px solid ${theme.stroke}` }}>
            <h2 style={{ color: theme.headline, fontSize: "1rem", margin: 0, fontWeight: "700", letterSpacing: "1px" }}>
              📋 USUARIOS ACTIVOS ({usuarios.length})
            </h2>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: theme.surface2 }}>
                {["USUARIO", "PERSONA VINCULADA", "ROL ACTUAL", "ACCIONES"].map(h => (
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
                  <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: theme.paragraph }}>Cargando...</td></tr>
                ) : usuarios.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: theme.paragraph, opacity: 0.6 }}>🌿 No hay usuarios activos.</td></tr>
                ) : (
                  usuarios.map((u) => (
                    <motion.tr
                      key={u.idusuario}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ borderBottom: `1px solid ${theme.stroke}` }}
                    >
                      <td style={{ padding: "1.2rem 1.5rem", color: theme.headline, fontWeight: "600" }}>
                        🔑 {u.nombreu}
                      </td>
                      <td style={{ padding: "1.2rem 1.5rem", color: theme.paragraph, fontSize: "0.9rem" }}>
                        {u.persona?.nom1} {u.persona?.apell1}
                      </td>
                      <td style={{ padding: "1.2rem 1.5rem" }}>
                        {editandoId === u.idusuario ? (
                          <select
                            value={editandoPerfil}
                            onChange={e => setEditandoPerfil(e.target.value)}
                            style={{
                              padding: "0.5rem", backgroundColor: theme.inputBg,
                              border: `1px solid ${theme.primary}`, color: theme.headline,
                              borderRadius: "8px", outline: "none", fontSize: "0.85rem",
                            }}
                          >
                            {perfiles.map(p => <option key={p.idperfil} value={p.idperfil}>{p.descripc}</option>)}
                          </select>
                        ) : (
                          <span style={{
                            backgroundColor: `${theme.primary}22`, color: theme.primary,
                            padding: "4px 12px", borderRadius: "20px",
                            fontSize: "0.78rem", fontWeight: "bold",
                            border: `1px solid ${theme.primary}44`,
                          }}>
                            {u.perfil?.descripc}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "1.2rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                          {editandoId === u.idusuario ? (
                            <>
                              <button
                                onClick={() => guardarEdicionPerfil(u.idusuario)}
                                style={{
                                  padding: "6px 14px", backgroundColor: theme.primary,
                                  color: "#fff", border: "none", borderRadius: "8px",
                                  cursor: "pointer", fontSize: "0.72rem", fontWeight: "bold",
                                }}
                              >✔ GUARDAR</button>
                              <button
                                onClick={() => setEditandoId(null)}
                                style={{
                                  padding: "6px 14px", backgroundColor: "transparent",
                                  color: theme.paragraph, border: `1px solid ${theme.stroke}`,
                                  borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem",
                                }}
                              >CANCELAR</button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => iniciarEdicionPerfil(u)}
                                style={{
                                  padding: "6px 14px", backgroundColor: `${theme.accent}22`,
                                  color: theme.accent, border: `1px solid ${theme.accent}44`,
                                  borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "bold",
                                }}
                              >✏ EDITAR ROL</button>
                              <button
                                onClick={() => inhabilitarUsuario(u.idusuario)}
                                style={{
                                  padding: "6px 14px", backgroundColor: `${theme.danger}22`,
                                  color: theme.danger, border: `1px solid ${theme.danger}44`,
                                  borderRadius: "8px", cursor: "pointer", fontSize: "0.72rem", fontWeight: "bold",
                                }}
                              >✖ INHABILITAR</button>
                            </>
                          )}
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
  );
}