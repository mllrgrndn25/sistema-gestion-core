"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { theme } from "@/lib/theme";

interface Persona {
    idpersona: number;
    nom1: string;
    apell1: string;
    id_tipo?: number;
}

interface Test {
    codigotest: number;
    nombre_test: string;
}

interface Pregunta {
    idpregunta: number;
    pregunta: string;
    resp1: string;
    resp2: string;
    resp3: string;
    rec1: string;
    rec2: string;
    rec3: string;
}

export default function AplicarTestPage() {
    const [estudiantes, setEstudiantes] = useState<Persona[]>([]);
    const [tests, setTests] = useState<Test[]>([]);
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);

    const [estudianteId, setEstudianteId] = useState<string>("");
    const [testId, setTestId] = useState<string>("");

    const [etapa, setEtapa] = useState<"inicio" | "quiz" | "final">("inicio");
    const [preguntaActualIdx, setPreguntaActualIdx] = useState(0);
    const [respuestas, setRespuestas] = useState<number[]>([]);
    const [recomendaciones, setRecomendaciones] = useState<string[]>([]);

    const cargarDatos = async () => {
        // Buscar el ID del tipo 'Estudiante'
        const { data: tipoData } = await supabase.from("tipo_persona").select("codigotp").ilike("nombretp", "%estudiante%").limit(1);
        const idEst = tipoData?.[0]?.codigotp;

        // Cargar personas que sean estudiantes
        if (idEst) {
            const { data: pData } = await supabase.from("persona").select("idpersona, nom1, apell1").eq("id_tipo", idEst).eq("estado", true);
            if (pData) setEstudiantes(pData);
        } else {
            // Si no existe el tipo exacto, cargar todos para permitir la prueba
            const { data: pData } = await supabase.from("persona").select("idpersona, nom1, apell1").eq("estado", true);
            if (pData) setEstudiantes(pData);
        }

        // Cargar tests
        const { data: tData } = await supabase.from("test").select("codigotest, nombre_test").eq("estado", true);
        if (tData) setTests(tData);
    };

    useEffect(() => { cargarDatos(); }, []);

    const iniciarTest = async () => {
        if (!estudianteId || !testId) return alert("Selecciona estudiante y test");
        const { data } = await supabase.from("pregunta").select("*").eq("codigotest", testId).eq("estado", true).order("idpregunta", { ascending: true });
        if (!data || data.length === 0) return alert("Este test no tiene preguntas configuradas");

        setPreguntas(data);
        setRespuestas([]);
        setRecomendaciones([]);
        setPreguntaActualIdx(0);
        setEtapa("quiz");
    };

    const responder = (opcion: number) => {
        const p = preguntas[preguntaActualIdx];
        const recs = [p.rec1, p.rec2, p.rec3];

        setRespuestas([...respuestas, opcion]);
        setRecomendaciones([...recomendaciones, recs[opcion - 1]]);

        if (preguntaActualIdx < preguntas.length - 1) {
            setPreguntaActualIdx(preguntaActualIdx + 1);
        } else {
            finalizarTest([...respuestas, opcion]);
        }
    };

    const finalizarTest = async (finalResps: number[]) => {
        // Guardar aplicación
        const { data: atData, error: atErr } = await supabase.from("aplicacion_test").insert([{
            codigotest: parseInt(testId),
            idpersona: parseInt(estudianteId),
            estado: true
        }]).select();

        if (atErr) return alert("Error al guardar: " + atErr.message);

        const codigoAT = atData[0].codigoAT;

        // Guardar respuestas individuales
        const bulkResps = preguntas.map((p, i) => ({
            codigoAT: codigoAT,
            idpregunta: p.idpregunta,
            seleccion: finalResps[i]
        }));

        await supabase.from("respuesta_estudiante").insert(bulkResps);
        setEtapa("final");
    };

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: "100vh", padding: "3rem 1.5rem", color: theme.headline, fontFamily: "Inter, sans-serif" }}>
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>

                <header style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: "900" }}>Evaluación <span style={{ color: theme.accent }}>Emocional</span></h1>
                    <p style={{ color: theme.paragraph }}>🌿 Cuidado del bienestar en la comunidad</p>
                </header>

                <AnimatePresence mode="wait">
                    {etapa === "inicio" && (
                        <motion.div key="inicio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            style={{ backgroundColor: theme.surface, padding: "2.5rem", borderRadius: "24px", border: `1px solid ${theme.stroke}`, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={labelStyle}>ESTUDIANTE</label>
                                <select value={estudianteId} onChange={e => setEstudianteId(e.target.value)} style={selectStyle}>
                                    <option value="">Selecciona al estudiante...</option>
                                    {estudiantes.map(e => <option key={e.idpersona} value={e.idpersona}>{e.nom1} {e.apell1}</option>)}
                                </select>
                            </div>

                            <div style={{ marginBottom: "2rem" }}>
                                <label style={labelStyle}>EVALUACIÓN A APLICAR</label>
                                <select value={testId} onChange={e => setTestId(e.target.value)} style={selectStyle}>
                                    <option value="">Selecciona el test...</option>
                                    {tests.map(t => <option key={t.codigotest} value={t.codigotest}>{t.nombre_test}</option>)}
                                </select>
                            </div>

                            <button onClick={iniciarTest} style={{
                                width: "100%", padding: "1.2rem", backgroundColor: theme.primary,
                                color: "#fff", border: "none", borderRadius: "16px", fontWeight: "bold", fontSize: "1.1rem", cursor: "pointer"
                            }}> EMPEZAR EVALUACIÓN </button>
                        </motion.div>
                    )}

                    {etapa === "quiz" && (
                        <motion.div key="quiz" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                            style={{ backgroundColor: theme.surface, padding: "3rem", borderRadius: "24px", border: `1px solid ${theme.stroke}` }}>

                            <div style={{ color: theme.primary, fontWeight: "bold", fontSize: "0.8rem", marginBottom: "1rem" }}>
                                PREGUNTA {preguntaActualIdx + 1} DE {preguntas.length}
                            </div>

                            <h2 style={{ fontSize: "1.8rem", marginBottom: "2.5rem", lineHeight: "1.4" }}>
                                {preguntas[preguntaActualIdx].pregunta}
                            </h2>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {[preguntas[preguntaActualIdx].resp1, preguntas[preguntaActualIdx].resp2, preguntas[preguntaActualIdx].resp3].map((resp, i) => (
                                    <button key={i} onClick={() => responder(i + 1)} style={optionButtonStyle}>
                                        <span style={{ color: theme.accent, marginRight: "1rem", fontWeight: "900" }}>{i + 1}</span>
                                        {resp}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {etapa === "final" && (
                        <motion.div key="final" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            style={{ backgroundColor: theme.surface, padding: "3rem", borderRadius: "24px", textAlign: "center", border: `1px solid ${theme.primary}` }}>

                            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🌿</div>
                            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>¡Evaluación Completada!</h2>
                            <p style={{ color: theme.paragraph, marginBottom: "2rem" }}>Aquí tienes tus recomendaciones según tus respuestas:</p>

                            <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "2.5rem" }}>
                                {recomendaciones.map((rec, i) => (
                                    <div key={i} style={{ padding: "1rem", backgroundColor: "#ffffff08", borderRadius: "12px", borderLeft: `4px solid ${theme.accent}`, fontSize: "0.9rem" }}>
                                        {rec}
                                    </div>
                                ))}
                            </div>

                            <Link href="/dashboard" style={{
                                display: "inline-block", padding: "1rem 2.5rem", backgroundColor: theme.primary,
                                color: "#fff", textDecoration: "none", borderRadius: "50px", fontWeight: "bold"
                            }}> FINALIZAR Y VOLVER </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

const labelStyle = { display: "block", color: theme.primary, fontSize: "0.75rem", fontWeight: "bold", letterSpacing: "1px", marginBottom: "0.6rem" };
const selectStyle = { width: "100%", padding: "1rem", backgroundColor: theme.inputBg, border: `1px solid ${theme.stroke}`, color: theme.headline, borderRadius: "14px", outline: "none", fontSize: "1rem" };
const optionButtonStyle = {
    display: "flex", alignItems: "center", textAlign: "left" as any, padding: "1.4rem",
    backgroundColor: "#ffffff08", border: `1px solid ${theme.stroke}`, color: theme.headline,
    borderRadius: "16px", cursor: "pointer", fontSize: "1.1rem", transition: "0.2s"
};
