export default function Welcome() {
  return (<main className="panel" style={{ maxWidth: 560, margin: "30px auto" }}><span className="badge">Payment received</span><h2>Your shop is open 🎉</h2>
    <p>We've emailed your login details to the address you gave. It can take a minute to arrive, so check spam too.</p>
    <p><a href="/login"><button>Go to login</button></a></p>
    <p className="muted">No email? Open the login page and use “Email me a new password”.</p></main>);
}
