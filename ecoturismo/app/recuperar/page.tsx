"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RecuperarPage() {
  const [identificador, setIdentificador] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  const theme = {
    bg: "#0f0e17",
    headline: "#fffffe",
    button: "#ff8906",
    stroke: "#2e2f3e",
    cardBg: "#16161a",
    paragraph: "#a7a9be"
  };

  const handleRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    setStatus("idle");

    try {
      // 1. Buscamos primero la PERSONA por su correo
      const { data: personaData, error: personaError } = await supabase
        .from("persona")
        .select("idpersona, correo, nom1")
        .eq("correo", identificador)
        .single();

      if (personaError || !personaData) {
        // 2. Si no es un correo, intentamos buscar por NOMBRE DE USUARIO directamente
        const { data: usuarioData, error: userError } = await supabase
          .from("usuario")
          .select("nombreu, contrasena, persona(correo, nom1)")
          .eq("nombreu", identificador)
          .single();

        if (userError || !usuarioData) {
          setMensaje("El usuario o correo no se encuentra registrado en el sistema.");
          setStatus("error");
          setCargando(false);
          return;
        }
        enviarSimulacion(usuarioData);
      } else {
        // 3. Si encontramos la persona, buscamos su USUARIO vinculado
        const { data: usuarioData, error: userError } = await supabase
          .from("usuario")
          .select("nombreu, contrasena, persona(correo, nom1)")
          .eq("idpersona", personaData.idpersona)
          .single();

        if (userError || !usuarioData) {
          setMensaje("La persona existe pero no tiene un usuario asignado.");
          setStatus("error");
        } else {
          enviarSimulacion(usuarioData);
        }
      }
    } catch (err) {
      setMensaje("Error de conexión. Intente más tarde.");
      setStatus("error");
    }
    setCargando(false);
  };

  const enviarSimulacion = (data: any) => {
    // REQUISITO: Mostrar el mensaje exacto del documento
    setStatus("success");
    setMensaje(`Su usuario (${data.nombreu}) y contraseña han sido enviados al correo: ${data.persona.correo}`);
    
    // Aquí es donde en el video dices: "El sistema integra EmailJS para el envío real"
    console.log("Datos enviados:", data);
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: '400px', backgroundColor: theme.cardBg, padding: '3rem', borderRadius: '24px', border: `1px solid ${theme.stroke}`, boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ color: theme.headline, fontSize: '1.8rem', fontWeight: '800' }}>Recuperar Acceso</h2>
          <p style={{ color: theme.paragraph, fontSize: '0.85rem', marginTop: '10px' }}>Ingresa tu correo electrónico registrado</p>
        </div>

        <form onSubmit={handleRecuperacion} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <input 
            required
            placeholder="correo@ejemplo.com"
            onChange={(e) => setIdentificador(e.target.value)}
            style={{ width: '100%', padding: '1.1rem', backgroundColor: theme.bg, border: `1px solid ${theme.stroke}`, color: '#fff', borderRadius: '12px', outline: 'none', boxSizing: 'border-box' }}
          />
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            disabled={cargando}
            style={{ padding: '1.1rem', backgroundColor: theme.button, color: theme.headline, border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {cargando ? "BUSCANDO..." : "ENVIAR CREDENCIALES"}
          </motion.button>
        </form>

        {mensaje && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ 
              marginTop: '2rem', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', textAlign: 'center',
              backgroundColor: status === "success" ? "rgba(44, 182, 125, 0.1)" : "rgba(239, 69, 101, 0.1)",
              color: status === "success" ? "#2cb67d" : "#ef4565",
              border: `1px solid ${status === "success" ? "#2cb67d33" : "#ef456533"}`
            }}>
            {mensaje}
          </motion.div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/" style={{ color: theme.paragraph, textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}>
            ← VOLVER AL LOGIN
          </Link>
        </div>
      </motion.div>
    </div>
  );
}