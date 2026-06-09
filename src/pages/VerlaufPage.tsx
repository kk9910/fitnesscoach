export function VerlaufPage() {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div style={{ padding: '20px 20px 40px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 className="large-title" style={{ margin: 0 }}>Verlauf</h1>
          <p className="subhead" style={{ margin: '4px 0 0', color: 'var(--clr-text-3)' }}>
            Deine Trainingsgeschichte
          </p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div className="subhead" style={{ color: 'var(--clr-text-3)' }}>
            Verlauf-Charts folgen in Stufe 2
          </div>
        </div>
      </div>
    </div>
  );
}
