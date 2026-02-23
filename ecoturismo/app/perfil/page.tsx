"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PerfilPage() {
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [descripc, setDescripc] = useState("");
  const [cargando, setCargando] = useState(false);

  const theme = {
    bg: "#16161a",
    headline: "#fffffe",
    paragraph: "#94a1b2",
    button: "#7f5af0",
    stroke: "#242629",
    inputBg: "#010101",
    tertiary: "#2cb67d"
  };

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

  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripc) return;

    const { error } = await supabase
      .from("perfil")
      .insert([{ descripc, estado: true }]);

    if (error) {
      alert("Error al crear el perfil");
    } else {
      setDescripc("");
      cargarPerfiles();
    }
  };

  const inhabilitarPerfil = async (id: number) => {
    // REQUISITO: Borrado lógico
    const { error } = await supabase
      .from("perfil")
      .update({ estado: false })
      .eq("idperfil", id);
    
    if (!error) cargarPerfiles();
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '2rem', color: theme.paragraph, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ color: theme.headline, margin: 0 }}>Gestión de Perfiles</h1>
            <p style={{ fontSize: '0.85rem' }}>Definición de Roles de Usuario</p>
          </div>
          <Link href="/dashboard" style={{ color: theme.button, textDecoration: 'none', fontWeight: 'bold', border: `1px solid ${theme.stroke}`, padding: '0.5rem 1rem', borderRadius: '8px' }}>
            VOLVER
          </Link>
        </header>

        {/* Formulario de Registro */}
        <section style={{ backgroundColor: theme.inputBg, padding: '2rem', borderRadius: '12px', border: `1px solid ${theme.stroke}`, marginBottom: '2rem' }}>
          <form onSubmit={guardarPerfil} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              required
              placeholder="Ej: Administrador, Operador, Consultor..."
              value={descripc}
              onChange={(e) => setDescripc(e.target.value)}
              style={{ 
                flex: 1, padding: '0.8rem', backgroundColor: theme.bg, 
                border: `1px solid ${theme.stroke}`, color: theme.headline, borderRadius: '8px', outline: 'none' 
              }}
            />
            <button 
              type="submit"
              style={{ 
                padding: '0.8rem 2rem', backgroundColor: theme.button, 
                color: theme.headline, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' 
              }}
            >
              AGREGAR ROL
            </button>
          </form>
        </section>

        {/* Tabla de Perfiles */}
        <div style={{ backgroundColor: theme.inputBg, borderRadius: '12px', border: `1px solid ${theme.stroke}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.stroke}`, textAlign: 'left' }}>
                <th style={{ padding: '1.2rem', color: theme.headline }}>ID</th>
                <th style={{ padding: '1.2rem', color: theme.headline }}>Descripción del Perfil</th>
                <th style={{ padding: '1.2rem', color: theme.headline, textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {perfiles.map((p) => (
                <tr key={p.idperfil} style={{ borderBottom: `1px solid ${theme.stroke}` }}>
                  <td style={{ padding: '1rem' }}>#{p.idperfil}</td>
                  <td style={{ padding: '1rem', color: theme.headline, fontWeight: '500' }}>{p.descripc}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => inhabilitarPerfil(p.idperfil)}
                      style={{ background: 'none', border: 'none', color: '#ff4e4e', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                    >
                      [ INHABILITAR ]
                    </button>
                  </td>
                </tr>
              ))}
              {perfiles.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No hay perfiles activos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}