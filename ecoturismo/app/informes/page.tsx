"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { theme } from "@/lib/theme";

interface InformeTest {
    codigoAT: number;
    fecha: string;
    hora: string;
    persona: { nom1: string; apell1: string };
    test: { nombre_test: string };
    respuestas: { idpregunta: number; seleccion: number; pregunta: { pregunta: string; resp1: string; resp2: string; resp3: string; rec1: string; rec2: string; rec3: string } }[];
}

interface Estudiante {
    idpersona: number;
    nom1: string;
    apell1: string;
    correo: string;
    tipo_persona: { nombretp: string };
}

export default function InformesPage() {
    const [aplicaciones, setAplicaciones] = useState<any[]>([]);
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [tab, setTab] = useState<"tests" | "estudiantes">("tests");
    const [detalle, setDetalle] = useState<any | null>(null);

    const cargarInformes = async () => {
        const { data } = await supabase
            .from("aplicacion_test")
            .select(`
        *,
        persona(nom1, apell1),
        test(nombre_test)
      `)
            .order("codigoAT", { ascending: false });
        if (data) setAplicaciones(data);
    };

    const cargarEstudiantes = async () => {
        const { data: tipoData } = await supabase.from("tipo_persona").select("codigotp").ilike("nombretp", "%estudiante%").limit(1);
        const idEst = tipoData?.[0]?.codigotp;

        if (idEst) {
            const { data } = await supabase
                .from("persona")
                .select("*, tipo_persona(nombretp)")
                .eq("id_tipo", idEst)
                .eq("estado", true);
            if (data) setEstudiantes(data);
        }
    };

    const verDetalle = async (codigoAT: number) => {
        const { data } = await supabase
            .from("respuesta_estudiante")
            .select(`
        seleccion,
        pregunta(pregunta, resp1, resp2, resp3, rec1, rec2, rec3)
      `)
            .eq("codigoAT", codigoAT);

        if (data) setDetalle(data);
    };

    useEffect(() => {
        cargarInformes();
        cargarEstudiantes();
    }, []);

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: "100vh", padding: "3rem 1.5rem", color: theme.headline, fontFamily: "Inter, sans-serif" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                    <div>
                        <h1 style={{ fontSize: "2.2rem", fontWeight: "900", margin: 0 }}>Informes y <span style={{ color: theme.accent }}>Resultados</span></h1>
                        <p style={{ color: theme.paragraph, marginTop: "5px" }}>Seguimiento del bienestar estudiantil</p>
                    </div>
                    <Link href="/dashboard" style={{ color: theme.headline, textDecoration: "none", fontWeight: "bold", border: `1px solid ${theme.stroke}`, padding: "10px 20px", borderRadius: "10px" }}>← VOLVER</Link>
                </header>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                    <button onClick={() => setTab("tests")} style={{ ...tabStyle, borderBottom: tab === "tests" ? `3px solid ${theme.primary}` : "none", opacity: tab === "tests" ? 1 : 0.6 }}>GESTIÓN DE TESTS</button>
                    <button onClick={() => setTab("estudiantes")} style={{ ...tabStyle, borderBottom: tab === "estudiantes" ? `3px solid ${theme.primary}` : "none", opacity: tab === "estudiantes" ? 1 : 0.6 }}>CONSULTA ESTUDIANTES</button>
                </div>

                {tab === "tests" ? (
                    <div style={{ display: "grid", gridTemplateColumns: detalle ? "1fr 400px" : "1fr", gap: "2rem" }}>
                        <div style={{ backgroundColor: theme.surface, borderRadius: "20px", border: `1px solid ${theme.stroke}`, overflow: "hidden" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ backgroundColor: theme.surface2 }}>
                                        <th style={thStyle}>ESTUDIANTE</th>
                                        <th style={thStyle}>TEST APLICADO</th>
                                        <th style={thStyle}>FECHA / HORA</th>
                                        <th style={{ ...thStyle, textAlign: "center" }}>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {aplicaciones.map((a) => (
                                        <tr key={a.codigoAT} style={{ borderBottom: `1px solid ${theme.stroke}` }}>
                                            <td style={tdStyle}>{a.persona?.nom1} {a.persona?.apell1}</td>
                                            <td style={tdStyle}><span style={{ color: theme.primary, fontWeight: "600" }}>{a.test?.nombre_test}</span></td>
                                            <td style={tdStyle}>{a.fecha} <span style={{ fontSize: "0.7rem", color: theme.paragraph }}>{a.hora}</span></td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>
                                                <button onClick={() => verDetalle(a.codigoAT)} style={{ backgroundColor: "transparent", color: theme.accent, border: `1px solid ${theme.accent}44`, padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}>VER RECOMENDACIONES</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <AnimatePresence>
                            {detalle && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    style={{ backgroundColor: theme.surface, padding: "2rem", borderRadius: "20px", border: `1.5px solid ${theme.accent}`, height: "fit-content" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                                        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Detalle de Resultados</h3>
                                        <button onClick={() => setDetalle(null)} style={{ background: "none", border: "none", color: theme.paragraph, cursor: "pointer" }}>✕</button>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        {detalle.map((d: any, i: number) => (
                                            <div key={i} style={{ padding: "1rem", backgroundColor: "#ffffff08", borderRadius: "12px", fontSize: "0.85rem" }}>
                                                <div style={{ fontWeight: "700", marginBottom: "0.5rem", color: theme.primary }}>{d.pregunta?.pregunta}</div>
                                                <div style={{ color: theme.paragraph }}>Respuesta elegida: <span style={{ color: theme.headline }}>{d.pregunta?.[`resp${d.seleccion}`]}</span></div>
                                                <div style={{ borderTop: `1px solid ${theme.stroke}`, marginTop: "0.5rem", paddingTop: "0.5rem", fontWeight: "500", fontStyle: "italic", color: theme.accent }}>
                                                    ✨ {d.pregunta?.[`rec${d.seleccion}`]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div style={{ backgroundColor: theme.surface, borderRadius: "20px", border: `1px solid ${theme.stroke}`, overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: theme.surface2 }}>
                                    <th style={thStyle}>NOMBRE COMPLETO</th>
                                    <th style={thStyle}>CORREO ELECTRÓNICO</th>
                                    <th style={thStyle}>TIPO</th>
                                    <th style={thStyle}>ESTADO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.map((e) => (
                                    <tr key={e.idpersona} style={{ borderBottom: `1px solid ${theme.stroke}` }}>
                                        <td style={tdStyle}>{e.nom1} {e.apell1}</td>
                                        <td style={tdStyle}>{e.correo}</td>
                                        <td style={tdStyle}><span style={{ backgroundColor: `${theme.primary}22`, color: theme.primary, padding: "2px 8px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "bold" }}>{e.tipo_persona?.nombretp}</span></td>
                                        <td style={tdStyle}><span style={{ color: "#4caf50", fontSize: "0.8rem" }}>● ACTIVO</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
}

const tabStyle = { background: "none", border: "none", color: theme.headline, cursor: "pointer", fontWeight: "bold", fontSize: "0.9rem", padding: "1rem" };
const thStyle = { padding: "1rem 1.5rem", color: theme.paragraph, textAlign: "left" as any, fontSize: "0.75rem" };
const tdStyle = { padding: "1.1rem 1.5rem", color: theme.headline, fontSize: "0.85rem" };
