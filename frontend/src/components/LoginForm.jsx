import { useState } from "react";
import { authAPI } from "../api";
import "../styles/auth.css";

export default function LoginForm({ onLoginSuccess }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = isRegisterMode
        ? await authAPI.register(email, password, nome)
        : await authAPI.login(email, password);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      onLoginSuccess(response.data.user);
    } catch (err) {
      setError(
        err.response?.data?.error || "Erro ao processar sua solicitação",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError("");
    setIsRegisterMode((prev) => !prev);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>LexFlow</h1>
        <p className="subtitle">
          {isRegisterMode
            ? "Cadastro de usuário"
            : "Sistema de Gestão de Processos Jurídicos"}
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          {isRegisterMode && (
            <input
              type="text"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? isRegisterMode
                ? "Cadastrando..."
                : "Entrando..."
              : isRegisterMode
                ? "Cadastrar"
                : "Entrar"}
          </button>
        </form>

        <p className="signup-link">
          {isRegisterMode ? (
            <>
              Já tem conta?{" "}
              <button
                type="button"
                className="link-button"
                onClick={toggleMode}
              >
                Entrar
              </button>
            </>
          ) : (
            <>
              Não tem conta?{" "}
              <button
                type="button"
                className="link-button"
                onClick={toggleMode}
              >
                Cadastre-se
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
