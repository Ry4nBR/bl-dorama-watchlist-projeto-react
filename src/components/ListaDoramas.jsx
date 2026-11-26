import { CardDorama } from "./CardDorama";

export function ListaDoramas({ doramas, aoAlternarStatus, aoAlternarLista }) {
  if (doramas.length === 0) {
    return (
      <div className="lista-vazia">
        <p>Nenhum dorama ou BL encontrado com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <section className="grid-doramas">
      {doramas.map((dorama) => (
        <CardDorama
          key={dorama.id}
          dorama={dorama}
          aoAlternarStatus={aoAlternarStatus}
          aoAlternarLista={aoAlternarLista}
        />
      ))}
    </section>
  );
}
