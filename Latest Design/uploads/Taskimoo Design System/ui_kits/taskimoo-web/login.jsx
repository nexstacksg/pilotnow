// Login screen — mirrors apps/web/app/login + auth.module.css
(function () {
  function Login({ onSignIn }) {
    const [email, setEmail] = React.useState('ken@nexstack.sg');
    const [pw, setPw] = React.useState('Taskimoo2026!');
    const [loading, setLoading] = React.useState(false);
    function submit(e) {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => onSignIn(), 480);
    }
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-1)', padding: 24 }}>
        <form onSubmit={submit} style={{ width: 'min(100%, 360px)', display: 'grid', gap: 14, padding: 24, border: '1px solid var(--border-1)', borderRadius: 8, background: 'var(--bg-0)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800 }}>
            <span className="sidebar-logo" style={{ backgroundImage: "url('../../assets/logo-mark.svg')" }} />
            <span>TASKIMOO<span style={{ color: 'var(--brand-orange)' }}>.</span></span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Sign in</h1>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, color: 'var(--fg-2)' }}>
            <span>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
              style={{ height: 38, border: '1px solid var(--border-1)', borderRadius: 6, padding: '0 10px', background: 'var(--bg-0)', color: 'var(--fg-0)' }} />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 12, color: 'var(--fg-2)' }}>
            <span>Password</span>
            <input value={pw} onChange={(e) => setPw(e.target.value)} type="password"
              style={{ height: 38, border: '1px solid var(--border-1)', borderRadius: 6, padding: '0 10px', background: 'var(--bg-0)', color: 'var(--fg-0)' }} />
          </label>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ height: 36, justifyContent: 'center' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="form-help" style={{ margin: 0, fontSize: 12, color: 'var(--fg-2)' }}>
            <a className="t-link" href="#">Register</a> · <a className="t-link" href="#">Reset password</a>
          </p>
        </form>
      </main>
    );
  }
  window.TkLogin = Login;
})();
