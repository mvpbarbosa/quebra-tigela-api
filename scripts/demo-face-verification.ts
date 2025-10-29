import fs from 'node:fs/promises';
import path from 'node:path';
import { MediapipeFaceVerifier } from '../src/face-comparison/mediapipe-face-verifier';

async function main() {
  const [frontPath, backPath, selfiePath] = process.argv.slice(2);

  if (!frontPath || !backPath || !selfiePath) {
    console.error(
      'Uso: pnpm ts-node scripts/demo-face-verification.ts <frente-do-documento> <verso-do-documento> <selfie>',
    );
    process.exit(1);
  }

  const resolverPath = path.resolve(frontPath);
  if (!resolverPath) {
    console.error('Caminho para a foto frontal do documento não é válido.');
    process.exit(1);
  }

  const [frontBuffer, backBuffer, selfieBuffer] = await Promise.all([
    fs.readFile(frontPath),
    fs.readFile(backPath),
    fs.readFile(selfiePath),
  ]);

  const verifier = new MediapipeFaceVerifier();
  const result = await verifier.verifyDocumentAndSelfie(
    frontBuffer,
    backBuffer,
    selfieBuffer,
  );

  console.log('Resultado da verificação:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('Erro na verificação:', error);
  process.exit(1);
});
