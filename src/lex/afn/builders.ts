import { CharPredicate, Afn, AfnState } from './types';

/**
 * Construtores e combinadores para AFNs no estilo Thompson.
 * Fornece primitivas para criar AFNs e combiná-los (concatenação, alternação,
 * fecho de Kleene, etc.), além de utilitários como literal e classes de caracteres.
 */

// Gerador incremental de IDs de estado (útil para depuração)
let nextStateId = 1;

/** Cria um estado vazio, sem transições. */
function createState(): AfnState {
  return { id: nextStateId++, epsilon: [], transitions: [] };
}

/**
 * AFN vazio (aceita cadeia vazia). Útil para optional e construção incremental.
 */
export function createEmptyAfn(): Afn {
  const s = createState();
  const a = createState();
  s.epsilon.push(a);
  return { start: s, accepts: new Set([a]) };
}

/** AFN que consome um único caractere que satisfaz o predicado fornecido. */
export function createCharAfn(test: CharPredicate): Afn {
  const s = createState();
  const a = createState();
  s.transitions.push({ test, to: a });
  return { start: s, accepts: new Set([a]) };
}

/**
 * Concatenação: liga todos os estados de aceitação de `a` ao início de `b`
 * por epsilon, resultando em um AFN que reconhece L(a)L(b).
 */
export function concatenate(a: Afn, b: Afn): Afn {
  for (const acc of a.accepts) {
    acc.epsilon.push(b.start);
  }
  return { start: a.start, accepts: new Set(b.accepts) };
}

/**
 * Alternação (união): cria um novo início que aponta para `a` e `b` por epsilon
 * e um novo aceitação único, para onde os aceites de `a` e `b` convergem.
 */
export function alternate(a: Afn, b: Afn): Afn {
  const s = createState();
  const t = createState();
  s.epsilon.push(a.start, b.start);
  for (const acc of a.accepts) acc.epsilon.push(t);
  for (const acc of b.accepts) acc.epsilon.push(t);
  return { start: s, accepts: new Set([t]) };
}

/**
 * Fecho de Kleene: reconhece zero ou mais repetições de `afn`.
 */
export function kleeneStar(afn: Afn): Afn {
  const s = createState();
  const t = createState();
  s.epsilon.push(afn.start, t);
  for (const acc of afn.accepts) {
    acc.epsilon.push(afn.start, t);
  }
  return { start: s, accepts: new Set([t]) };
}

/**
 * Clona profundamente um AFN preservando rótulos e prioridades.
 * Útil para construir `plus(afn)` sem compartilhar estruturas.
 */
function cloneAfn(afn: Afn): Afn {
  const map = new Map<AfnState, AfnState>();
  function cloneState(s: AfnState): AfnState {
    if (map.has(s)) return map.get(s)!;
    const ns: AfnState = { id: nextStateId++, epsilon: [], transitions: [] };
    if (s.acceptLabel !== undefined) ns.acceptLabel = s.acceptLabel;
    if (s.priority !== undefined) ns.priority = s.priority;
    map.set(s, ns);
    for (const e of s.epsilon) ns.epsilon.push(cloneState(e));
    for (const tr of s.transitions) ns.transitions.push({ test: tr.test, to: cloneState(tr.to) });
    return ns;
  }
  const start = cloneState(afn.start);
  const accepts = new Set<AfnState>();
  for (const a of afn.accepts) accepts.add(map.get(a)!);
  return { start, accepts };
}

/** Uma ou mais repetições de `afn`. */
export function plus(afn: Afn): Afn {
  return concatenate(afn, kleeneStar(cloneAfn(afn)));
}

/** Zero ou uma ocorrência de `afn`. */
export function optional(afn: Afn): Afn {
  return alternate(afn, createEmptyAfn());
}

/** AFN que casa exatamente a string literal fornecida. */
export function literal(str: string): Afn {
  let afn = createEmptyAfn();
  for (const ch of str) {
    afn = concatenate(afn, createCharAfn(c => c === ch));
  }
  return afn;
}

/** Atalho para criar AFN a partir de uma classe de caracteres (predicado). */
export function charClass(predicate: CharPredicate): Afn {
  return createCharAfn(predicate);
}


