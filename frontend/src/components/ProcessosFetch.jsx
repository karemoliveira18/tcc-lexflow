import { useEffect, useState } from "react";

// Componente simples que demonstra conexão direta com a API usando fetch()
// Mostra a lista de processos em JSON usando o mesmo token da sessão autenticada.
export default function ProcessosFetch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/processos`, {
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

  return null;
}
