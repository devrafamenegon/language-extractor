"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTextFile = readTextFile;
const fs_1 = require("fs");
/**
 * Lê um arquivo de texto como UTF-8.
 * Exemplo:
 *   const txt = await readTextFile('/abs/codigo.cpp');
 *   // txt contém o conteúdo do arquivo como string
 */
async function readTextFile(absoluteFilePath) {
    const fileStats = await fs_1.promises.stat(absoluteFilePath);
    if (!fileStats.isFile()) {
        throw new Error(`O caminho informado não é um arquivo: ${absoluteFilePath}`);
    }
    const fileBuffer = await fs_1.promises.readFile(absoluteFilePath);
    return fileBuffer.toString('utf8');
}
//# sourceMappingURL=readTextFile.js.map