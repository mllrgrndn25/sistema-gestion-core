"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  // Colores de tu imagen Happy Hues
  const theme = {
    bg: "#16161a",
    headline: "#fffffe",
    paragraph: "#94a1b2",
    button: "#7f5af0",
    stroke: "#242629",
    inputBg: "#010101",
    tertiary: "#2cb67d"
  };

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from("usuario")
      .select("*")
      .eq("nombreu", usuario)
      .eq("contrasena", password)
      .eq("estado", true)
      .single();

    if (error || !data) {
      setMensaje("Acceso denegado. Revisa tus datos.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          backgroundColor: theme.bg, 
          border: `1px solid ${theme.stroke}`, 
          padding: '2.5rem', 
          borderRadius: '12px', 
          width: '100%', 
          maxWidth: '400px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <h1 style={{ color: theme.headline, fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Bienvenido</h1>
        <p style={{ color: theme.paragraph, marginBottom: '2rem' }}>Portal de Ecoturismo</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ color: theme.headline, display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Usuario</label>
            <input 
              onChange={(e) => setUsuario(e.target.value)}
              style={{ 
                width: '100%', padding: '0.75rem', backgroundColor: theme.inputBg, 
                border: `1px solid ${theme.stroke}`, color: theme.headline, borderRadius: '8px', outline: 'none' 
              }}
              placeholder="Tu usuario"
            />
          </div>

          <div>
            <label style={{ color: theme.headline, display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Contraseña</label>
            <input 
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', padding: '0.75rem', backgroundColor: theme.inputBg, 
                border: `1px solid ${theme.stroke}`, color: theme.headline, borderRadius: '8px', outline: 'none' 
              }}
              placeholder="••••••••"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            style={{ 
              width: '100%', padding: '0.75rem', backgroundColor: theme.button, 
              color: theme.headline, border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' 
            }}
          >
            INICIAR SESIÓN
          </motion.button>
        </div>

        {mensaje && (
          <p style={{ color: theme.tertiary, marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
            {mensaje}
          </p>
        )}
      </motion.div>
    </div>
  );
}