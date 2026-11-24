export function Cabecalho({ totalTitulos, totalAssistidos }) {
  return (
    <header className="cabecalho">
      <div>
        <h1>🌸 Dorama & BL Watchlist</h1>
        <p>Gerencie seus dramas asiáticos e títulos Boys Love favoritos</p>
      </div>
      <div className="contador-box">
        <span>Assistidos: <strong>{totalAssistidos}</strong> / {totalTitulos}</span>
      </div>
    </header>
  );
}