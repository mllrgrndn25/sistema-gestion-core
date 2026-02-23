"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";

export default function UsuarioPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  // Formulario siguiendo el modelo de la BD
  const [form, setForm] = useState({
    nombreu: "",
    contrasena: "",
    idpersona: "",
    idperfil: ""
  });

  const theme = {
    bg: "#16161a", headline: "#fffffe", paragraph: "#94a1b2",
    button: "#7f5af0", stroke: "#242629", inputBg: "#010101", tertiary: "#2cb67d"
  };

  const cargarDatos = async () => {
    // Traemos usuarios con el nombre de la persona y descripción del perfil (JOIN)
    const { data: users } = await supabase.from("usuario")
      .select("*, persona(nom1, apell1), perfil(descripc)")
      .eq("estado", true);
    
    const { data: pers } = await supabase.from("persona").select("*").eq("estado", true);
    const { data: perf } = await supabase.from("perfil").select("*").eq("estado", true);
    
    if (users) setUsuarios(users);
    if (pers) setPersonas(pers);
    if (perf) setPerfiles(perf);
  };

  useEffect(() => { cargarDatos(); }, []);

  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idpersona || !form.idperfil) return alert("Debe seleccionar una persona y un perfil");

    const { error } = await supabase.from("usuario").insert([{
      nombreu: form.nombreu,
      contrasena: form.contrasena,
      idpersona: parseInt(form.idpersona),
      idperfil: parseInt(form.idperfil),
      estado: true
    }]);

    if (error) {
      alert("Error: El usuario ya existe o la persona ya tiene un usuario asignado.");
    } else {
      setForm({ nombreu: "", contrasena: "", idpersona: "", idperfil: "" });
      cargarDatos();
    }
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', padding: '2rem', color: theme.paragraph, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ color: theme.headline, margin: 0 }}>Gestión de Usuarios</h1>
          <Link href="/dashboard" style={{ color: theme.button, textDecoration: 'none', fontWeight: 'bold' }}>VOLVER</Link>
        </header>

        {/* Formulario de Creación */}
        <section style={{ backgroundColor: theme.inputBg, padding: '2rem', borderRadius: '12px', border: `1px solid ${theme.stroke}`, marginBottom: '2rem' }}>
          <form onSubmit={guardarUsuario} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input 
              placeholder="Username (Login)" required
              style={inputStyle(theme)}
              value={form.nombreu}
              onChange={e => setForm({...form, nombreu: e.target.value})}
            />
            <input 
              type="password" placeholder="Password" required
              style={inputStyle(theme)}
              value={form.contrasena}
              onChange={e => setForm({...form, contrasena: e.target.value})}
            />
            
            <select 
              required style={inputStyle(theme)}
              value={form.idpersona}
              onChange={e => setForm({...form, idpersona: e.target.value})}
            >
              <option value="">Asignar a Persona...</option>
              {personas.map(p => (
                <option key={p.idpersona} value={p.idpersona}>{p.nom1} {p.apell1}</option>
              ))}
            </select>

            <select 
              required style={inputStyle(theme)}
              value={form.idperfil}
              onChange={e => setForm({...form, idperfil: e.target.value})}
            >
              <option value="">Seleccionar Perfil...</option>
              {perfiles.map(p => (
                <option key={p.idperfil} value={p.idperfil}>{p.descripc}</option>
              ))}
            </select>

            <button type="submit" style={{ gridColumn: 'span 2', padding: '1rem', backgroundColor: theme.button, color: theme.headline, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>
              CREAR ACCESO AL SISTEMA
            </button>
          </form>
        </section>

        {/* Tabla de Usuarios Activos */}
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: theme.inputBg, border: `1px solid ${theme.stroke}`, borderRadius: '12px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: theme.stroke, textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: theme.headline }}>Usuario</th>
              <th style={{ padding: '1rem', color: theme.headline }}>Persona</th>
              <th style={{ padding: '1rem', color: theme.headline }}>Perfil</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.idusuario} style={{ borderBottom: `1px solid ${theme.stroke}` }}>
                <td style={{ padding: '1rem', color: theme.headline }}>{u.nombreu}</td>
                <td style={{ padding: '1rem' }}>{u.persona?.nom1} {u.persona?.apell1}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ backgroundColor: theme.stroke, padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {u.perfil?.descripc}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = (theme: any) => ({
  width: '100%', padding: '0.8rem', backgroundColor: theme.bg, border: `1px solid ${theme.stroke}`,
  color: theme.headline, borderRadius: '8px', outline: 'none', boxSizing: 'border-box' as 'border-box'
});