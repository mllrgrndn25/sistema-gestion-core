"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { theme } from "@/lib/theme";

interface Perfil {
  idperfil: number;
  descripc: string;
  estado: boolean;
}

export default function PerfilPage() {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [descripc, setDescripc] = useState("");
  const [cargando, setCargando] = useState(false);

  // Estado para edición inline
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoValor, setEditandoValor] = useState("");

  const cargarPerfiles = async () => {
    setCargando(true);
    const { data } = await supabase
      .from("perfil")
      .select("*")
      .eq("estado", true)
      .order("idperfil", { ascending: true });
    if (data) setPerfiles(data);
    setCargando(false);
  };

  useEffect(() => { cargarPerfiles(); }, []);

  // CREATE
  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripc.trim()) return;
    const { error } = await supabase
      .from("perfil")
      .insert([{ descripc: descripc.trim(), estado: true }]);
    if (error) {
      alert("Error al crear el perfil: " + error.message);
    } else {
      setDescripc("");
      cargarPerfiles();
    }
  };

  // UPDATE
  const iniciarEdicion = (p: Perfil) => {
    setEditandoId(p.idperfil);
    setEditandoValor(p.descripc);
  };

  const guardarEdicion = async (id: number) => {
    if (!editandoValor.trim()) return;
    const { error } = await supabase
      .from("perfil")
      .update({ descripc: editandoValor.trim() })
      .eq("idperfil", id);
    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      setEditandoId(null);
      setEditandoValor("");
      cargarPerfiles();
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditandoValor("");
  };

  // DELETE lógico
  const inhabilitarPerfil = async (id: number) => {
    if (!confirm("¿Está seguro de inhabilitar este perfil? Esta acción lo desactivará del sistema.")) return;
    const { error } = await supabase
      .from("perfil")
      .update({ estado: false })
      .eq("idperfil", id);
    if (!error) cargarPerfiles();
  };

  return (
    <div style={{
      backgroundColor: theme.bg,
      minHeight: "100vh",
      padding: "3rem 1.5rem",
      fontFamily: "Inter, system-ui, sans-serif",
      backgroundImage: "radial-gradient(ellipse at 80% 20%, #1a3521 0%, transparent 50%)",
    }}>
      <div style={{ maxWidth: "850px", margin: "0 auto" }}>

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
              Gestión de <span style={{ color: theme.primary }}>Perfiles</span>
            </h1>
            <p style={{ color: theme.paragraph, fontSize: "0.85rem", marginTop: "4px" }}>
              Definición de roles y privilegios del sistema
            </p>
          </div>
          <Link href="/dashboard" style={{
            color: theme.headline, textDecoration: "none", fontWeight: "600",
            border: `1px solid ${theme.stroke}`, padding: "10px 20px",
            borderRadius: "10px", fontSize: "0.85rem", transition: "0.3s",
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
            padding: "2rem",
            borderRadius: "16px",
            border: `1px solid ${theme.stroke}`,
            marginBottom: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <h2 style={{ color: theme.headline, fontSize: "1rem", margin: "0 0 1.2rem", fontWeight: "700", letterSpacing: "1px" }}>
            ➕ NUEVO PERFIL / ROL
          </h2>
          <form onSubmit={guardarPerfil} style={{ display: "flex", gap: "1rem" }}>
            <input
              required
              placeholder="Ej: Administrador, Operador, Guía Turístico..."
              value={descripc}
              onChange={(e) => setDescripc(e.target.value)}
              style={{
                flex: 1, padding: "0.9rem 1rem", backgroundColor: theme.inputBg,
                border: `1px solid ${theme.stroke}`, color: theme.headline,
                borderRadius: "10px", outline: "none", fontSize: "0.95rem",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.9rem 1.8rem", backgroundColor: theme.primary,
                color: "#fff", border: "none", borderRadius: "10px",
                fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              AGREGAR ROL
            </button>
          </form>
        </motion.section>

        {/* Tabla READ + UPDATE + DELETE */}
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: "16px",
          border: `1px solid ${theme.stroke}`,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}>
          <div style={{ padding: "1.5rem 2rem", borderBottom: `1px solid ${theme.stroke}` }}>
            <h2 style={{ color: theme.headline, fontSize: "1rem", margin: 0, fontWeight: "700", letterSpacing: "1px" }}>
              📋 PERFILES ACTIVOS ({perfiles.length})
            </h2>
          </div>

          {cargando ? (
            <div style={{ padding: "3rem", textAlign: "center", color: theme.paragraph }}>
              Cargando perfiles...
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: theme.surface2 }}>
                  <th style={{ padding: "1rem 1.5rem", color: theme.paragraph, textAlign: "left", fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "700" }}>ID</th>
                  <th style={{ padding: "1rem 1.5rem", color: theme.paragraph, textAlign: "left", fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "700" }}>DESCRIPCIÓN DEL PERFIL</th>
                  <th style={{ padding: "1rem 1.5rem", color: theme.paragraph, textAlign: "center", fontSize: "0.75rem", letterSpacing: "1px", fontWeight: "700" }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {perfiles.map((p) => (
                    <motion.tr
                      key={p.idperfil}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ borderBottom: `1px solid ${theme.stroke}` }}
                    >
                      <td style={{ padding: "1.1rem 1.5rem", color: theme.paragraph, fontSize: "0.9rem" }}>
                        #{p.idperfil}
                      </td>
                      <td style={{ padding: "1.1rem 1.5rem" }}>
                        {editandoId === p.idperfil ? (
                          <input
                            value={editandoValor}
                            onChange={(e) => setEditandoValor(e.target.value)}
                            autoFocus
                            style={{
                              width: "100%", padding: "0.6rem 0.8rem",
                              backgroundColor: theme.inputBg,
                              border: `1px solid ${theme.primary}`,
                              color: theme.headline, borderRadius: "8px",
                              outline: "none", fontSize: "0.9rem",
                            }}
                          />
                        ) : (
                          <span style={{ color: theme.headline, fontWeight: "600" }}>{p.descripc}</span>
                        )}
                      </td>
                      <td style={{ padding: "1.1rem 1.5rem", textAlign: "center" }}>
                        {editandoId === p.idperfil ? (
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                            <button
                              onClick={() => guardarEdicion(p.idperfil)}
                              style={{
                                padding: "6px 14px", backgroundColor: theme.primary,
                                color: "#fff", border: "none", borderRadius: "8px",
                                cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold",
                              }}
                            >
                              ✔ GUARDAR
                            </button>
                            <button
                              onClick={cancelarEdicion}
                              style={{
                                padding: "6px 14px", backgroundColor: "transparent",
                                color: theme.paragraph, border: `1px solid ${theme.stroke}`,
                                borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem",
                              }}
                            >
                              CANCELAR
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                            <button
                              onClick={() => iniciarEdicion(p)}
                              style={{
                                padding: "6px 14px", backgroundColor: `${theme.accent}22`,
                                color: theme.accent, border: `1px solid ${theme.accent}44`,
                                borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold",
                              }}
                            >
                              ✏ EDITAR
                            </button>
                            <button
                              onClick={() => inhabilitarPerfil(p.idperfil)}
                              style={{
                                padding: "6px 14px", backgroundColor: `${theme.danger}22`,
                                color: theme.danger, border: `1px solid ${theme.danger}44`,
                                borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold",
                              }}
                            >
                              ✖ INHABILITAR
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {perfiles.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: "3rem", textAlign: "center", color: theme.paragraph, opacity: 0.6 }}>
                      🌿 No hay perfiles activos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}