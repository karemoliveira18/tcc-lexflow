import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, BarChart3, CalendarClock, CheckCircle2, FileText, ShieldCheck, Users } from 'lucide-react';
import Logo from '../components/Logo';
import '../styles/landing.css';

export default function Landing({ isAuthenticated }) {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-brand" aria-label="LexFlow início">
          <Logo size="sm" />
        </Link>
        <nav className="landing-nav" aria-label="Navegação principal">
          <a href="#visao">Visão geral</a>
          <a href="#recursos">Recursos</a>
          <a href="#conceito">O LexFlow</a>
        </nav>
        <Link to="/login" className="landing-login-link">Entrar <ArrowRight size={15} /></Link>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="landing-eyebrow"><span /> PLATAFORMA JURÍDICA PREMIUM</div>
          <h1>A inteligência por trás da <em>sua gestão jurídica.</em></h1>
          <p>
            Organize clientes, processos e prazos em uma única plataforma,
            desenvolvida para tornar a rotina jurídica mais eficiente.
          </p>
          <div className="landing-actions">
            <Link to="/login" className="landing-button landing-button-primary">Entrar na plataforma <ArrowRight size={17} /></Link>
            <a href="#conceito" className="landing-button landing-button-outline">Conhecer o LexFlow</a>
          </div>
          <div className="landing-trust"><ShieldCheck size={16} /> Estrutura segura para decisões mais claras</div>
        </div>

        <div className="dashboard-preview" aria-label="Prévia visual do dashboard LexFlow">
          <div className="preview-orbit preview-orbit-one" />
          <div className="preview-orbit preview-orbit-two" />
          <div className="preview-window">
            <div className="preview-window-bar"><div className="preview-dots"><span /><span /><span /></div><span>LEXFLOW / VISÃO GERAL</span><span className="preview-live">● AO VIVO</span></div>
            <div className="preview-body">
              <aside className="preview-sidebar"><Logo compact size="sm" /><div className="preview-nav-line active" /><div className="preview-nav-line" /><div className="preview-nav-line" /><div className="preview-nav-line short" /></aside>
              <div className="preview-content">
                <div className="preview-heading"><div><span>Bom dia, escritório</span><strong>Visão geral</strong></div><div className="preview-avatar">LF</div></div>
                <div className="preview-metrics">
                  <div><span>PROCESSOS ATIVOS</span><strong>124</strong><small>+12% este mês</small></div>
                  <div><span>PRÓXIMOS PRAZOS</span><strong>08</strong><small className="warning">Atenção necessária</small></div>
                </div>
                <div className="preview-lower-grid">
                  <div className="preview-chart"><div className="preview-section-title">Fluxo de processos <BarChart3 size={13} /></div><div className="chart-bars"><i /><i /><i /><i /><i /><i /><i /></div><div className="chart-axis"><span>JAN</span><span>MAR</span><span>MAI</span><span>JUL</span></div></div>
                  <div className="preview-deadlines"><div className="preview-section-title">Prazos próximos <CalendarClock size={13} /></div><div className="deadline-row"><b>12</b><span>Petição inicial<br /><small>Hoje · Cível</small></span></div><div className="deadline-row"><b>18</b><span>Reunião cliente<br /><small>Amanhã · Contratos</small></span></div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="preview-float preview-float-success"><CheckCircle2 size={16} /><span><b>Processo atualizado</b><small>há 2 minutos</small></span></div>
          <div className="preview-float preview-float-clients"><Users size={16} /><span><b>248</b><small>clientes ativos</small></span></div>
        </div>
      </section>

      <section id="conceito" className="landing-section concept-section">
        <div className="section-heading"><span className="landing-eyebrow">UM NOVO PADRÃO</span><h2>Gestão jurídica, <em>elevada</em> a outro nível.</h2><p>O LexFlow centraliza as informações essenciais do escritório para que cada decisão tenha contexto, cada prazo tenha clareza e cada cliente receba a atenção que merece.</p></div>
        <div className="concept-grid">
          <article><div className="concept-icon"><Users size={19} /></div><h3>Clientes</h3><p>Centralize informações, histórico e relacionamento em um só lugar.</p></article>
          <article><div className="concept-icon"><FileText size={19} /></div><h3>Processos</h3><p>Acompanhe cada etapa com organização, contexto e controle.</p></article>
          <article><div className="concept-icon"><CalendarClock size={19} /></div><h3>Prazos</h3><p>Tenha visibilidade dos compromissos importantes antes que eles cheguem.</p></article>
        </div>
      </section>

      <section id="recursos" className="landing-section resources-section">
        <div className="section-heading compact"><span className="landing-eyebrow">FEITO PARA A ROTINA REAL</span><h2>Tudo o que importa,<br /><em>em perspectiva.</em></h2></div>
        <div className="resource-list"><article><span>01</span><div><h3>Gestão de clientes</h3><p>Centralize informações e histórico dos seus clientes.</p></div><ArrowRight size={18} /></article><article><span>02</span><div><h3>Gestão de processos</h3><p>Acompanhe processos de forma organizada e objetiva.</p></div><ArrowRight size={18} /></article><article><span>03</span><div><h3>Controle de prazos</h3><p>Visualize compromissos e prazos importantes com antecedência.</p></div><ArrowRight size={18} /></article><article><span>04</span><div><h3>Painel inteligente</h3><p>Tenha uma visão geral da rotina jurídica em um único painel.</p></div><ArrowRight size={18} /></article></div>
      </section>

      <section id="visao" className="landing-cta"><Logo size="md" /><div><span className="landing-eyebrow">MAIS CLAREZA. MAIS CONTROLE.</span><h2>Seu escritório merece uma gestão <em>mais inteligente.</em></h2><p>Tenha uma visão clara dos seus clientes, processos e prazos.</p></div><Link to="/login" className="landing-button landing-button-primary">Acessar o LexFlow <ArrowRight size={17} /></Link></section>
      <footer className="landing-footer"><Logo compact size="sm" /><span>LEXFLOW · GESTÃO JURÍDICA INTELIGENTE</span><span>© 2026 LexFlow</span></footer>
    </main>
  );
}
