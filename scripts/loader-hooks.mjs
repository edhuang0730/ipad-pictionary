import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'react-native') {
    return {
      url: pathToFileURL(path.resolve('scripts/mock-rn.mjs')).href,
      shortCircuit: true,
    };
  }
  if (specifier === 'expo-network') {
    return {
      url: pathToFileURL(path.resolve('scripts/mock-rn.mjs')).href,
      shortCircuit: true,
    };
  }
  if (specifier.startsWith('.')) {
    const parentPath = context.parentURL
      ? path.dirname(fileURLToPath(context.parentURL))
      : process.cwd();
    const candidateTs = path.resolve(parentPath, specifier + '.ts');
    if (fs.existsSync(candidateTs)) {
      return {
        url: pathToFileURL(candidateTs).href,
        shortCircuit: true,
      };
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const filePath = fileURLToPath(url);
    const source = fs.readFileSync(filePath, 'utf8');
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.React,
      },
      fileName: filePath,
    });
    return {
      format: 'module',
      source: transpiled.outputText,
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}
