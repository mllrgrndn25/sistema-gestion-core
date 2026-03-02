"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";
import { theme } from "@/lib/theme";

export default function RecuperarPage() {
  const [identificador, setIdentificador] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  const handleRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    setStatus("idle");

    try {
      // 1. Buscar la PERSONA por su correo
      const { data: personaData, error: personaError } = await supabase
        .from("persona")
        .select("idpersona, correo, nom1")
        .eq("correo", identificador)
        .single();

      if (personaError || !personaData) {
        // 2. Si no encontró por correo, buscar por NOMBRE DE USUARIO
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
        // 3. Si encontró la persona, buscar su USUARIO vinculado
        const { data: usuarioData, error: userError } = await supabase
          .from("usuario")
          .select("nombreu, contrasena, persona(correo, nom1)")
          .eq("idpersona", personaData.idpersona)
          .single();

        if (userError || !usuarioData) {
          setMensaje("La persona existe pero no tiene un usuario asignado en el sistema.");
          setStatus("error");
        } else {
          enviarSimulacion(usuarioData);
        }
      }
    } catch {
      setMensaje("Error de conexión. Por favor intente más tarde.");
      setStatus("error");
    }
    setCargando(false);
  };

  const enviarSimulacion = (data: any) => {
    setStatus("success");
    setMensaje(`Su usuario (${data.nombreu}) y contraseña han sido enviados al correo: ${data.persona.correo}`);
    console.log("[EcoCore] Recuperación simulada:", data);
  };

  return (
    <div style={{
      backgroundColor: theme.bg,
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      fontFamily: "Inter, system-ui, sans-serif",
      backgroundImage: "radial-gradient(ellipse at 30% 70%, #1a3521 0%, transparent 50%)",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: theme.surface,
          padding: "3rem",
          borderRadius: "24px",
          border: `1px solid ${theme.stroke}`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>🔓</div>
          <h1 style={{ color: theme.headline, fontSize: "1.7rem", fontWeight: "800", margin: 0 }}>
            Recuperar Acceso
          </h1>
          <p style={{ color: theme.paragraph, fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Ingresa tu correo electrónico o nombre de usuario registrado
          </p>
        </div>

        <form onSubmit={handleRecuperacion} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={{ display: "block", color: theme.primary, fontSize: "0.7rem", fontWeight: "700", letterSpacing: "1px", marginBottom: "0.5rem" }}>
              CORREO O USUARIO
            </label>
            <input
              required
              placeholder="correo@ejemplo.com o usuario"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              style={{
                width: "100%", padding: "1rem", backgroundColor: theme.inputBg,
                border: `1px solid ${theme.stroke}`, color: theme.headline,
                borderRadius: "12px", outline: "none", fontSize: "0.9rem", boxSizing: "border-box",
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            disabled={cargando}
            type="submit"
            style={{
              padding: "1.1rem", backgroundColor: theme.primary,
              color: "#fff", border: "none", borderRadius: "12px",
              fontWeight: "bold", cursor: "pointer", fontSize: "1rem",
            }}
          >
            {cargando ? "BUSCANDO..." : "ENVIAR CREDENCIALES"}
          </motion.button>
        </form>

        {mensaje && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "1.8rem", padding: "1rem 1.2rem",
              borderRadius: "12px", fontSize: "0.88rem", textAlign: "center",
              backgroundColor: status === "success" ? `${theme.primary}15` : `${theme.danger}15`,
              color: status === "success" ? theme.primary : theme.danger,
              border: `1px solid ${status === "success" ? `${theme.primary}44` : `${theme.danger}44`}`,
              lineHeight: "1.6",
            }}
          >
            {status === "success" ? "✅ " : "⚠️ "}{mensaje}
          </motion.div>
        )}

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link href="/" style={{ color: theme.paragraph, textDecoration: "none", fontSize: "0.8rem", fontWeight: "600" }}>
            ← VOLVER AL LOGIN
          </Link>
        </div>
      </motion.div>
    </div>
  );
}