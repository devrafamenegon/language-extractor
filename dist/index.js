"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const readTextFile_1 = require("./utils/readTextFile");
const tokenizer_1 = require("./cpp/tokenizer");
async function main() {
    const argv = process.argv;
    const hasJsonFlag = argv.includes('--json');
    const positional = argv.filter(a => !a.startsWith('--'));
    const [_nodePath, _scriptPath, cppFilePath] = positional;
    // Exemplo de uso:
    //   npm run dev -- samples/hello.cpp
    //   npm run dev -- --json samples/hello.cpp
    const isMissingArgument = !cppFilePath;
    if (isMissingArgument) {
        console.error('Use: npm run dev -- [--json] <caminho-do-arquivo.cpp>');
        process.exit(1);
    }
    const absolutePath = path.resolve(process.cwd(), cppFilePath);
    try {
        const sourceCode = await (0, readTextFile_1.readTextFile)(absolutePath);
        const tokens = (0, tokenizer_1.tokenizeOrdered)(sourceCode);
        if (hasJsonFlag) {
            console.log(JSON.stringify(tokens, null, 2));
            return;
        }
        console.log('token, codigo, valor');
        for (const t of tokens) {
            console.log(`${t.tipo}, ${t.codigo}, ${t.valor}`);
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Falha ao ler o arquivo: ${message}`);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map