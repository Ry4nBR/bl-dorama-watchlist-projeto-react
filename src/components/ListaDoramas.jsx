import { CardDorama } from "./CardDorama";

export function ListaDoramas({ doramas, aoAvaliar, aoAlternarLista, aoAlternarAssistido, aoAlternarFavorito }) {
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
          aoAvaliar={aoAvaliar}
          aoAlternarLista={aoAlternarLista}
          aoAlternarAssistido={aoAlternarAssistido}
          aoAlternarFavorito={aoAlternarFavorito}
        />
      ))}
    </section>
  );
}
