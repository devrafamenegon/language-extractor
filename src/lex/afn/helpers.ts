import { LabeledAfn, MatchResult, Afn, AfnState } from './types';
import { alternate, createEmptyAfn } from './builders';

/**
 * Helpers para trabalhar com AFNs compostos:
 * - Rotular estados de aceitação com (label, priority)
 * - Combinar múltiplos AFNs por alternação
 * - Fechar por epsilon, mover via transições condicionais
 * - Encontrar o match mais longo com desempate por prioridade
 */

/**
 * Aplica rótulo e prioridade a todos os estados de aceitação do AFN fornecido.
 */
export function labelAccepts(afn: Afn, label: string, priority: number): Afn {
  for (const a of afn.accepts) {
    a.acceptLabel = label;
    a.priority = priority;
  }
  return afn;
}

/**
 * Combina uma lista de AFNs rotulados em um único AFN por alternação.
 * Mantém rótulos e prioridades para o match posterior.
 */
export function combineAlternation(labeled: ReadonlyArray<LabeledAfn>): Afn {
  let acc: Afn | null = null;
  for (const item of labeled) {
    labelAccepts(item.afn, item.label, item.priority);
    acc = acc ? alternate(acc, item.afn) : item.afn;
  }
  return acc ?? createEmptyAfn();
}

/**
 * Fecha um conjunto de estados por transições epsilon.
 */
function epsilonClosure(states: Set<AfnState>): Set<AfnState> {
  const stack: AfnState[] = [...states];
  const visited = new Set<AfnState>(states);
  while (stack.length) {
    const s = stack.pop()!;
    for (const e of s.epsilon) {
      if (!visited.has(e)) {
        visited.add(e);
        stack.push(e);
      }
    }
  }
  return visited;
}

/**
 * Move via transições condicionais consumindo um caractere.
 */
function move(states: Set<AfnState>, ch: string): Set<AfnState> {
  const out = new Set<AfnState>();
  for (const s of states) {
    for (const t of s.transitions) {
      if (t.test(ch)) out.add(t.to);
    }
  }
  return out;
}

/**
 * Encontra o match mais longo a partir de `startIndex` no input, usando um AFN
 * composto (mega). Em empate de comprimento, escolhe o menor `priority`.
 */
export function matchLongest(input: string, startIndex: number, mega: Afn): MatchResult | null {
  let current = epsilonClosure(new Set([mega.start]));
  let best: MatchResult | null = null;
  let i = startIndex;
  while (i < input.length) {
    for (const s of current) {
      if (s.acceptLabel !== undefined) {
        const candidate: MatchResult = {
          length: i - startIndex,
          label: s.acceptLabel,
          priority: s.priority ?? Number.MAX_SAFE_INTEGER,
        };
        if (
          best === null ||
          candidate.length > best.length ||
          (candidate.length === best.length && candidate.priority < best.priority)
        ) {
          best = candidate;
        }
      }
    }
    const ch = input.charAt(i);
    const moved = move(current, ch);
    if (moved.size === 0) break;
    current = epsilonClosure(moved);
    i++;
  }
  // Considera aceitação no ponto onde não há mais transições válidas
  for (const s of current) {
    if (s.acceptLabel !== undefined) {
      const candidate: MatchResult = {
        length: i - startIndex,
        label: s.acceptLabel,
        priority: s.priority ?? Number.MAX_SAFE_INTEGER,
      };
      if (
        best === null ||
        candidate.length > best.length ||
        (candidate.length === best.length && candidate.priority < best.priority)
      ) {
        best = candidate;
      }
    }
  }
  return best;
}


