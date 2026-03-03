"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { theme } from "@/lib/theme";

interface TipoPersona {
    codigotp: number;
    nombretp: string;
    descripcion_tp: string;
    estado: boolean;
}

export default function TipoPersonaPage() {
    const [tipos, setTipos] = useState<TipoPersona[]>([]);
    const [nombretp, setNombretp] = useState("");
    const [descripcion_tp, setDescripcion_tp] = useState("");
    const [cargando, setCargando] = useState(false);

    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [editandoNombre, setEditandoNombre] = useState("");
    const [editandoDesc, setEditandoDesc] = useState("");

    const cargarTipos = async () => {
        setCargando(true);
        const { data } = await supabase
            .from("tipo_persona")
            .select("*")
            .eq("estado", true)
            .order("codigotp", { ascending: true });
        if (data) setTipos(data);
        setCargando(false);
    };

    useEffect(() => { cargarTipos(); }, []);

    const guardarTipo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombretp.trim()) return;
        const { error } = await supabase
            .from("tipo_persona")
            .insert([{ nombretp: nombretp.trim(), descripcion_tp: descripcion_tp.trim(), estado: true }]);

        if (error) {
            alert("Error al crear: " + error.message);
        } else {
            setNombretp("");
            setDescripcion_tp("");
            cargarTipos();
        }
    };

    const iniciarEdicion = (t: TipoPersona) => {
        setEditandoId(t.codigotp);
        setEditandoNombre(t.nombretp);
        setEditandoDesc(t.descripcion_tp || "");
    };

    const guardarEdicion = async (id: number) => {
        if (!editandoNombre.trim()) return;
        const { error } = await supabase
            .from("tipo_persona")
            .update({ nombretp: editandoNombre.trim(), descripcion_tp: editandoDesc.trim() })
            .eq("codigotp", id);

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            setEditandoId(null);
            cargarTipos();
        }
    };

    const inhabilitarTipo = async (id: number) => {
        if (!confirm("¿Está seguro de inhabilitar este tipo de persona?")) return;
        const { error } = await supabase
            .from("tipo_persona")
            .update({ estado: false })
            .eq("codigotp", id);
        if (!error) cargarTipos();
    };

    return (
        <div style={{
            backgroundColor: theme.bg,
            minHeight: "100vh",
            padding: "3rem 1.5rem",
            fontFamily: "Inter, system-ui, sans-serif",
            backgroundImage: "radial-gradient(ellipse at 10% 80%, #1a3521 0%, transparent 50%)",
        }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>

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
                            Tipos de <span style={{ color: theme.accent }}>Persona</span>
                        </h1>
                        <p style={{ color: theme.paragraph, fontSize: "0.85rem", marginTop: "4px" }}>
                            Categorización para procesos de evaluación y gestión
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
                        ➕ NUEVA CATEGORÍA
                    </h2>
                    <form onSubmit={guardarTipo} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1rem", alignItems: "end" }}>
                        <div>
                            <label style={{ display: "block", color: theme.primary, fontSize: "0.7rem", fontWeight: "700", marginBottom: "0.5rem" }}>NOMBRE</label>
                            <input
                                required
                                placeholder="Ej: Estudiante, Docente..."
                                value={nombretp}
                                onChange={(e) => setNombretp(e.target.value)}
                                style={{
                                    width: "100%", padding: "0.9rem", backgroundColor: theme.inputBg,
                                    border: `1px solid ${theme.stroke}`, color: theme.headline,
                                    borderRadius: "10px", outline: "none", fontSize: "0.9rem",
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", color: theme.primary, fontSize: "0.7rem", fontWeight: "700", marginBottom: "0.5rem" }}>DESCRIPCIÓN</label>
                            <input
                                placeholder="Breve descripción..."
                                value={descripcion_tp}
                                onChange={(e) => setDescripcion_tp(e.target.value)}
                                style={{
                                    width: "100%", padding: "0.9rem", backgroundColor: theme.inputBg,
                                    border: `1px solid ${theme.stroke}`, color: theme.headline,
                                    borderRadius: "10px", outline: "none", fontSize: "0.9rem",
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                padding: "0.9rem 1.8rem", backgroundColor: theme.primary,
                                color: "#fff", border: "none", borderRadius: "10px",
                                fontWeight: "bold", cursor: "pointer",
                            }}
                        >
                            AGREGAR
                        </button>
                    </form>
                </motion.section>

                <div style={{
                    backgroundColor: theme.surface,
                    borderRadius: "16px",
                    border: `1px solid ${theme.stroke}`,
                    overflow: "hidden",
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: theme.surface2 }}>
                                <th style={{ padding: "1rem 1.5rem", color: theme.paragraph, textAlign: "left", fontSize: "0.75rem" }}>ID</th>
                                <th style={{ padding: "1rem 1.5rem", color: theme.paragraph, textAlign: "left", fontSize: "0.75rem" }}>NOMBRE</th>
                                <th style={{ padding: "1rem 1.5rem", color: theme.paragraph, textAlign: "left", fontSize: "0.75rem" }}>DESCRIPCIÓN</th>
                                <th style={{ padding: "1rem 1.5rem", color: theme.paragraph, textAlign: "center", fontSize: "0.75rem" }}>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {tipos.map((t) => (
                                    <motion.tr
                                        key={t.codigotp}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{ borderBottom: `1px solid ${theme.stroke}` }}
                                    >
                                        <td style={{ padding: "1.1rem 1.5rem", color: theme.paragraph, fontSize: "0.85rem" }}>#{t.codigotp}</td>
                                        <td style={{ padding: "1.1rem 1.5rem" }}>
                                            {editandoId === t.codigotp ? (
                                                <input
                                                    value={editandoNombre}
                                                    onChange={(e) => setEditandoNombre(e.target.value)}
                                                    style={{
                                                        width: "100%", padding: "0.5rem", backgroundColor: theme.inputBg,
                                                        border: `1px solid ${theme.primary}`, color: theme.headline, borderRadius: "6px",
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ color: theme.headline, fontWeight: "600" }}>{t.nombretp}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "1.1rem 1.5rem" }}>
                                            {editandoId === t.codigotp ? (
                                                <input
                                                    value={editandoDesc}
                                                    onChange={(e) => setEditandoDesc(e.target.value)}
                                                    style={{
                                                        width: "100%", padding: "0.5rem", backgroundColor: theme.inputBg,
                                                        border: `1px solid ${theme.primary}`, color: theme.headline, borderRadius: "6px",
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ color: theme.paragraph, fontSize: "0.85rem" }}>{t.descripcion_tp || "—"}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "1.1rem 1.5rem", textAlign: "center" }}>
                                            {editandoId === t.codigotp ? (
                                                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                                                    <button onClick={() => guardarEdicion(t.codigotp)} style={{ color: theme.primary, background: "none", border: "none", fontWeight: "bold", cursor: "pointer" }}>GUARDAR</button>
                                                    <button onClick={() => setEditandoId(null)} style={{ color: theme.paragraph, background: "none", border: "none", cursor: "pointer" }}>CANCELAR</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                                                    <button onClick={() => iniciarEdicion(t)} style={{ color: theme.accent, background: "none", border: "none", fontWeight: "bold", cursor: "pointer" }}>EDITAR</button>
                                                    <button onClick={() => inhabilitarTipo(t.codigotp)} style={{ color: theme.danger, background: "none", border: "none", fontWeight: "bold", cursor: "pointer" }}>ELIMINAR</button>
                                                </div>
                                            )}
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
