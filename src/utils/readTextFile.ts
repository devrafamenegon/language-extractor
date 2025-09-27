import { promises as fs } from 'fs';

/**
 * Lê um arquivo de texto como UTF-8.
 * Exemplo:
 *   const txt = await readTextFile('/abs/codigo.cpp');
 *   // txt contém o conteúdo do arquivo como string
 */
export async function readTextFile(absoluteFilePath: string): Promise<string> {
  const fileStats = await fs.stat(absoluteFilePath);
  if (!fileStats.isFile()) {
    throw new Error(`O caminho informado não é um arquivo: ${absoluteFilePath}`);
  }
  const fileBuffer = await fs.readFile(absoluteFilePath);
  return fileBuffer.toString('utf8');
}


