export const CHAVE_PREFERENCIAS = "dorama-watchlist-preferencias-v1";

// Guarda somente as escolhas pessoais, não os dados do catálogo do TMDB.
export function carregarPreferencias() {
  try {
    const conteudo = localStorage.getItem(CHAVE_PREFERENCIAS);
    if (!conteudo) return { preferencias: {}, erro: false };
    const dados = JSON.parse(conteudo);
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw new Error("Formato inválido");

    const preferencias = {};
    for (const [id, item] of Object.entries(dados)) {
      if (!/^\d+$/.test(id) || !item || typeof item !== "object" || Array.isArray(item)) continue;
      const avaliacao = item.avaliacao;
      preferencias[id] = {
        naLista: item.naLista === true,
        assistido: item.assistido === true,
        favorito: item.favorito === true,
        ...(avaliacao && Number.isInteger(avaliacao.estrelas) && avaliacao.estrelas >= 1 && avaliacao.estrelas <= 5 && typeof avaliacao.comentario === "string"
          ? { avaliacao: { estrelas: avaliacao.estrelas, comentario: avaliacao.comentario } }
          : {}),
      };
    }
    return { preferencias, erro: false };
  } catch {
    return { preferencias: {}, erro: true };
  }
}

export function salvarPreferencias(preferencias) {
  try {
    localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferencias));
    return true;
  } catch {
    return false;
  }
}
