export default function DashboardPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Minimal institutional overview (scaffold).</p>
      <nav>
        <a href="/dashboard/assets">My assets</a>
        {' · '}
        <a href="/dashboard/tokenization">New tokenization</a>
        {' · '}
        <a href="/dashboard/history">History</a>
        {' · '}
        <a href="/dashboard/profile">Profile & certificates</a>
      </nav>
    </main>
  );
}
