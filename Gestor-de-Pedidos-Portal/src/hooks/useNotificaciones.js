import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function useNotificaciones() {
  const { session } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [nuevas, setNuevas] = useState(0);

  useEffect(() => {
    if (!session?.clienteId) return;

    const url = `${import.meta.env.VITE_API_BASE_URL || ""}/notificaciones/suscribir/${session.clienteId}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener("pago_completado", (e) => {
      const data = JSON.parse(e.data);
      setNotificaciones(prev => [{ ...data, id: Date.now() }, ...prev]);
      setNuevas(n => n + 1);
    });

    eventSource.addEventListener("reembolso_aprobado", (e) => {
      const data = JSON.parse(e.data);
      setNotificaciones(prev => [{ ...data, id: Date.now() }, ...prev]);
      setNuevas(n => n + 1);
    });

    eventSource.addEventListener("pedido_actualizado", (e) => {
      const data = JSON.parse(e.data);
      setNotificaciones(prev => [{ ...data, id: Date.now() }, ...prev]);
      setNuevas(n => n + 1);
    });

    return () => eventSource.close();
  }, [session?.clienteId]);

  const marcarLeidas = () => setNuevas(0);

  return { notificaciones, nuevas, marcarLeidas };
}
