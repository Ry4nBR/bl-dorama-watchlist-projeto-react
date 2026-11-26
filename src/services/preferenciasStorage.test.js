import test from "node:test";
import assert from "node:assert/strict";
import { carregarPreferencias, salvarPreferencias, CHAVE_PREFERENCIAS } from "./preferenciasStorage.js";

test("salva e recupera preferências de séries, inclusive as fora do catálogo atual", () => {
  const dados = new Map();
  globalThis.localStorage = {
    getItem: (chave) => dados.get(chave) ?? null,
    setItem: (chave, valor) => dados.set(chave, valor),
  };
  const preferencias = {
    123: { naLista: true, assistido: true, favorito: true, avaliacao: { estrelas: 5, comentario: "Gostei!" } },
    456: { naLista: true, assistido: false, favorito: false },
  };
  assert.equal(salvarPreferencias(preferencias), true);
  assert.ok(dados.has(CHAVE_PREFERENCIAS));
  assert.deepEqual(carregarPreferencias(), { preferencias, erro: false });
});

test("ignora registros inválidos e sinaliza armazenamento corrompido ou indisponível", () => {
  globalThis.localStorage = { getItem: () => JSON.stringify({ 123: { naLista: true, avaliacao: { estrelas: 9, comentario: "x" } }, invalido: {} }) };
  assert.deepEqual(carregarPreferencias(), { preferencias: { 123: { naLista: true, assistido: false, favorito: false } }, erro: false });
  globalThis.localStorage = { getItem: () => "{", setItem: () => { throw new Error("indisponível"); } };
  assert.equal(carregarPreferencias().erro, true);
  assert.equal(salvarPreferencias({}), false);
  delete globalThis.localStorage;
});
