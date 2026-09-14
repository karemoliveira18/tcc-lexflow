import { useState } from "react";
import { authAPI } from "../api";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Logo from "./Logo";
import "../styles/auth.css";

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      onLoginSuccess(response.data.user);
    } catch (err) {
      const message = err.response?.data?.message || "Erro ao processar sua solicitação";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-shell">
        <section className="login-brand-panel">
          <div className="login-brand-top"><span className="login-overline">LEXFLOW / 2026</span><span className="login-status"><i /> SISTEMA ONLINE</span></div>
          <div className="login-brand-content"><Logo size="lg" /><div className="login-divider" /><h2>Gestão jurídica<br /><em>inteligente.</em></h2><p>Organize sua rotina jurídica com mais eficiência, segurança e clareza.</p></div>
          <div className="login-brand-bottom"><ShieldCheck size={16} /> Ambiente seguro para o seu escritório</div>
          <div className="login-brand-mark login-brand-mark-one" /><div className="login-brand-mark login-brand-mark-two" />
        </section>
        <section className="login-form-panel">
          <div className="login-card">
            <div className="login-kicker">ÁREA RESTRITA</div>
            <h1>Bem-vindo de volta</h1>
            <p className="subtitle">Acesse sua conta para continuar.</p>
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              <label htmlFor="login-email">Email</label>
              <input id="login-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label htmlFor="login-password">Senha</label>
              <input id="login-password" type="password" placeholder="Digite sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" disabled={loading}>{loading ? "Entrando..." : <>Entrar <ArrowRight size={16} /></>}</button>
            </form>
            <p className="login-help">Precisa de ajuda? <span>Fale com o suporte do escritório.</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}
