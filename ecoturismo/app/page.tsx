"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const theme = { bg: "#0f0e17", headline: "#fffffe", button: "#ff8906", stroke: "#2e2f3e", input: "#16161a" };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setCargando(true);
    const { data, error } = await supabase.from("usuario").select("*, perfil(descripc)").eq("nombreu", usuario).eq("estado", true).single();
    if (error || !data || data.contrasena !== password) {
      setMensaje("Credenciales inválidas.");
      setCargando(false);
    } else {
      localStorage.setItem("perfil", data.perfil.descripc);
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: '420px', backgroundColor: '#16161a', padding: '3.5rem', borderRadius: '32px', border: `1px solid ${theme.stroke}`, boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ color: theme.headline, fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>CORE<span style={{ color: theme.button }}>.</span></h2>
          <p style={{ color: "#a7a9be", fontSize: '0.9rem' }}>Ingresa tus credenciales</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input 
            placeholder="Usuario" 
            onChange={(e) => setUsuario(e.target.value)} 
            style={{ width: '100%', padding: '1.2rem', backgroundColor: '#0f0e17', border: '1px solid #2e2f3e', borderRadius: '16px', color: '#fff', outline: 'none' }} 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '1.2rem', backgroundColor: '#0f0e17', border: '1px solid #2e2f3e', borderRadius: '16px', color: '#fff', outline: 'none' }} 
          />
          
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "#f25f4c" }}
            whileTap={{ scale: 0.98 }}
            style={{ padding: '1.2rem', backgroundColor: theme.button, color: theme.headline, border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
          >
            {cargando ? "Validando..." : "Iniciar Sesión"}
          </motion.button>
        </form>

        {mensaje && <p style={{ color: '#ef4565', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>{mensaje}</p>}

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <Link href="/recuperar" style={{ color: "#a7a9be", textDecoration: 'none', fontSize: '0.8rem' }}>¿Problemas para entrar?</Link>
        </div>
      </motion.div>
    </div>
  );
}