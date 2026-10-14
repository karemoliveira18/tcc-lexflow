import { useEffect, useState } from "react";

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  }

  return 'http://localhost:5000/api';
};

// Componente auxiliar que não renderiza visualmente para evitar tela em branco.
export default function ProcessosFetch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/processos`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Erro ao carregar processos via fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return <div style={{ display: 'none' }} aria-hidden="true" />;
}
