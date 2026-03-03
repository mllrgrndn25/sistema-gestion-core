"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { theme } from "@/lib/theme";

interface Test {
    codigotest: number;
    codigott: string;
    nombre_test: string;
    estado: boolean;
}

interface Pregunta {
    idpregunta: number;
    codigotest: number;
    pregunta: string;
    resp1: string;
    resp2: string;
    resp3: string;
    rec1: string;
    rec2: string;
    rec3: string;
}

export default function TestPage() {
    const [tests, setTests] = useState<Test[]>([]);
    const [testSeleccionado, setTestSeleccionado] = useState<Test | null>(null);
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);

    // States para Test
    const [nombreTest, setNombreTest] = useState("");
    const [codigoTT, setCodigoTT] = useState("");

    // States para Pregunta
    const [formPregunta, setFormPregunta] = useState({
        pregunta: "", resp1: "", resp2: "", resp3: "", rec1: "", rec2: "", rec3: ""
    });

    const [editandoPreguntaId, setEditandoPreguntaId] = useState<number | null>(null);

    const cargarTests = async () => {
        const { data } = await supabase.from("test").select("*").eq("estado", true);
        if (data) setTests(data);
    };

    const cargarPreguntas = async (idTest: number) => {
        const { data } = await supabase.from("pregunta").select("*").eq("codigotest", idTest).eq("estado", true);
        if (data) setPreguntas(data);
    };

    useEffect(() => { cargarTests(); }, []);

    const crearTest = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from("test").insert([{
            codigott: codigoTT.trim(),
            nombre_test: nombreTest.trim()
        }]);
        if (!error) { setNombreTest(""); setCodigoTT(""); cargarTests(); }
    };

    const seleccionarTest = (t: Test) => {
        setTestSeleccionado(t);
        cargarPreguntas(t.codigotest);
        setEditandoPreguntaId(null);
        setFormPregunta({ pregunta: "", resp1: "", resp2: "", resp3: "", rec1: "", rec2: "", rec3: "" });
    };

    const guardarPregunta = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testSeleccionado) return;

        if (editandoPreguntaId) {
            const { error } = await supabase.from("pregunta").update(formPregunta).eq("idpregunta", editandoPreguntaId);
            if (!error) { setEditandoPreguntaId(null); setFormPregunta({ pregunta: "", resp1: "", resp2: "", resp3: "", rec1: "", rec2: "", rec3: "" }); cargarPreguntas(testSeleccionado.codigotest); }
        } else {
            const { error } = await supabase.from("pregunta").insert([{ ...formPregunta, codigotest: testSeleccionado.codigotest }]);
            if (!error) { setFormPregunta({ pregunta: "", resp1: "", resp2: "", resp3: "", rec1: "", rec2: "", rec3: "" }); cargarPreguntas(testSeleccionado.codigotest); }
        }
    };

    const eliminarPregunta = async (id: number) => {
        if (!confirm("¿Eliminar esta pregunta?")) return;
        const { error } = await supabase.from("pregunta").update({ estado: false }).eq("idpregunta", id);
        if (!error && testSeleccionado) cargarPreguntas(testSeleccionado.codigotest);
    };

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: "100vh", padding: "2rem", color: theme.headline }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ fontSize: "2rem", margin: 0 }}>Estructura de <span style={{ color: theme.accent }}>Tests</span></h1>
                        <p style={{ color: theme.paragraph }}>Diseño de evaluaciones y recomendaciones emocionales</p>
                    </div>
                    <Link href="/dashboard" style={{ color: theme.primary, textDecoration: "none", fontWeight: "bold" }}>← VOLVER</Link>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "2rem" }}>

                    {/* Columna Izquierda: Tests */}
                    <aside>
                        <section style={{ backgroundColor: theme.surface, padding: "1.5rem", borderRadius: "15px", marginBottom: "1.5rem" }}>
                            <h3 style={{ fontSize: "0.9rem", color: theme.primary, marginBottom: "1rem" }}>➕ NUEVO TEST</h3>
                            <form onSubmit={crearTest}>
                                <input placeholder="Código (Ej: T-01)" value={codigoTT} onChange={e => setCodigoTT(e.target.value)} required style={inputStyle} />
                                <input placeholder="Nombre del Test" value={nombreTest} onChange={e => setNombreTest(e.target.value)} required style={{ ...inputStyle, marginTop: "0.5rem" }} />
                                <button type="submit" style={{ ...btnStyle, marginTop: "1rem" }}>CREAR TEST</button>
                            </form>
                        </section>

                        <div style={{ backgroundColor: theme.surface, borderRadius: "15px", overflow: "hidden" }}>
                            <div style={{ padding: "1rem", backgroundColor: theme.surface2, fontWeight: "bold", fontSize: "0.8rem" }}>LISTA DE TESTS</div>
                            {tests.map(t => (
                                <div
                                    key={t.codigotest}
                                    onClick={() => seleccionarTest(t)}
                                    style={{
                                        padding: "1rem", borderBottom: `1px solid ${theme.stroke}`, cursor: "pointer",
                                        backgroundColor: testSeleccionado?.codigotest === t.codigotest ? "#ffffff0a" : "transparent"
                                    }}
                                >
                                    <div style={{ fontWeight: "700", color: testSeleccionado?.codigotest === t.codigotest ? theme.accent : theme.headline }}>{t.nombre_test}</div>
                                    <div style={{ fontSize: "0.7rem", color: theme.paragraph }}>{t.codigott}</div>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Columna Derecha: Preguntas */}
                    <main>
                        {testSeleccionado ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 style={{ marginBottom: "1.5rem" }}>Preguntas de: <span style={{ color: theme.primary }}>{testSeleccionado.nombre_test}</span></h2>

                                <section style={{ backgroundColor: theme.surface, padding: "2rem", borderRadius: "20px", marginBottom: "2rem" }}>
                                    <h3 style={{ fontSize: "0.9rem", color: theme.primary, marginBottom: "1.5rem" }}>{editandoPreguntaId ? "✏ EDITAR PREGUNTA" : "➕ AGREGAR PREGUNTA"}</h3>
                                    <form onSubmit={guardarPregunta}>
                                        <textarea
                                            placeholder="Escribe la pregunta aquí..."
                                            value={formPregunta.pregunta}
                                            onChange={e => setFormPregunta({ ...formPregunta, pregunta: e.target.value })}
                                            required
                                            style={{ ...inputStyle, height: "80px", marginBottom: "1.5rem" }}
                                        />

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                            <div style={optionBox}>
                                                <div style={optionLabel}>OPCIÓN 1</div>
                                                <input placeholder="Respuesta 1" value={formPregunta.resp1} onChange={e => setFormPregunta({ ...formPregunta, resp1: e.target.value })} required style={miniInput} />
                                                <textarea placeholder="Recomendación si eligen Opc 1" value={formPregunta.rec1} onChange={e => setFormPregunta({ ...formPregunta, rec1: e.target.value })} required style={miniTextarea} />
                                            </div>
                                            <div style={optionBox}>
                                                <div style={optionLabel}>OPCIÓN 2</div>
                                                <input placeholder="Respuesta 2" value={formPregunta.resp2} onChange={e => setFormPregunta({ ...formPregunta, resp2: e.target.value })} required style={miniInput} />
                                                <textarea placeholder="Recomendación si eligen Opc 2" value={formPregunta.rec2} onChange={e => setFormPregunta({ ...formPregunta, rec2: e.target.value })} required style={miniTextarea} />
                                            </div>
                                        </div>

                                        <div style={{ ...optionBox, marginTop: "1.5rem" }}>
                                            <div style={optionLabel}>OPCIÓN 3</div>
                                            <input placeholder="Respuesta 3" value={formPregunta.resp3} onChange={e => setFormPregunta({ ...formPregunta, resp3: e.target.value })} required style={miniInput} />
                                            <textarea placeholder="Recomendación si eligen Opc 3" value={formPregunta.rec3} onChange={e => setFormPregunta({ ...formPregunta, rec3: e.target.value })} required style={miniTextarea} />
                                        </div>

                                        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                                            <button type="submit" style={btnStyle}>{editandoPreguntaId ? "💾 ACTUALIZAR" : "✅ GUARDAR PREGUNTA"}</button>
                                            {editandoPreguntaId && (
                                                <button type="button" onClick={() => { setEditandoPreguntaId(null); setFormPregunta({ pregunta: "", resp1: "", resp2: "", resp3: "", rec1: "", rec2: "", rec3: "" }); }} style={{ ...btnStyle, background: "none", border: `1px solid ${theme.stroke}` }}>CANCELAR</button>
                                            )}
                                        </div>
                                    </form>
                                </section>

                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {preguntas.map((p, idx) => (
                                        <div key={p.idpregunta} style={{ backgroundColor: theme.surface, padding: "1.5rem", borderRadius: "15px", borderLeft: `4px solid ${theme.primary}` }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{idx + 1}. {p.pregunta}</div>
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button onClick={() => { setEditandoPreguntaId(p.idpregunta); setFormPregunta({ ...p }); window.scrollTo({ top: 300, behavior: "smooth" }); }} style={{ color: theme.accent, background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem" }}>EDITAR</button>
                                                    <button onClick={() => eliminarPregunta(p.idpregunta)} style={{ color: theme.danger, background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem" }}>X</button>
                                                </div>
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                                                <div style={pillResp}>1: {p.resp1}</div>
                                                <div style={pillResp}>2: {p.resp2}</div>
                                                <div style={pillResp}>3: {p.resp3}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", color: theme.paragraph, backgroundColor: theme.surface, borderRadius: "20px", border: `2px dashed ${theme.stroke}` }}>
                                👈 Selecciona un test de la izquierda para gestionar sus preguntas
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%", padding: "0.8rem", backgroundColor: theme.inputBg,
    border: `1px solid ${theme.stroke}`, color: theme.headline, borderRadius: "10px", outline: "none", boxSizing: "border-box" as any
};

const btnStyle = {
    width: "100%", padding: "1rem", backgroundColor: theme.primary, color: "#fff",
    border: "none", borderRadius: "10px", fontWeight: "bold" as any, cursor: "pointer"
};

const optionBox = { backgroundColor: "#0000001a", padding: "1rem", borderRadius: "12px", border: `1px solid ${theme.stroke}` };
const optionLabel = { fontSize: "0.65rem", fontWeight: "bold", color: theme.accent, marginBottom: "0.8rem", letterSpacing: "1px" };
const miniInput = { ...inputStyle, padding: "0.6rem", fontSize: "0.8rem", marginBottom: "0.5rem" };
const miniTextarea = { ...inputStyle, padding: "0.6rem", fontSize: "0.8rem", height: "60px" };
const pillResp = { backgroundColor: theme.bg, padding: "6px 10px", borderRadius: "8px", fontSize: "0.75rem", border: `1px solid ${theme.stroke}` };
