# Verificação de Documento + Selfie com MediaPipe

Este módulo demonstra como usar o MediaPipe Face Landmarker para validar fotos de frente e verso de um documento de identidade e comparar a face presente no documento com uma selfie capturada no dispositivo.

## Pré-requisitos

1. Instale as dependências:

```bash
pnpm install
```

2. (Opcional) Faça download local do modelo `.task` caso prefira não depender do CDN do MediaPipe.

```bash
curl -L \
  -o models/face_landmarker.task \
  https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
```

> Atualize a opção `modelAssetPath` ao instanciar o `MediapipeFaceVerifier` se usar um arquivo local.

## API do utilitário

```ts
import { MediapipeFaceVerifier } from '../src/face-comparison/mediapipe-face-verifier';

const verifier = new MediapipeFaceVerifier({
  similarityThreshold: 0.85, // opcional (padrão)
  wasmPath: 'caminho/customizado', // opcional
  modelAssetPath: 'caminho/para/face_landmarker.task', // opcional
});

const result = await verifier.verifyDocumentAndSelfie(
  frontDocumentBuffer,
  backDocumentBuffer,
  selfieBuffer,
);
```

### Estrutura da resposta

```ts
{
  front: {
    hasFace: boolean;
    facesDetected: number;
    landmarksQuality?: number;
  };
  back: {
    hasFace: boolean;
    facesDetected: number;
  };
  selfie: {
    hasFace: boolean;
    facesDetected: number;
    similarity: number; // Cosine similarity (0-1)
    isMatch: boolean; // verdadeiro se similarity >= threshold
  };
}
```

- `front.hasFace` deve ser `true` e `facesDetected === 1` para considerar o documento válido.
- `back.hasFace` deve ser `false` (documento não deve ter rosto no verso).
- `selfie.isMatch` indica se a selfie corresponde à foto do documento.

## Script de exemplo

O repositório inclui `scripts/demo-face-verification.ts` para testar rapidamente:

```bash
pnpm ts-node scripts/demo-face-verification.ts \
  ./exemplos/doc-frente.jpg \
  ./exemplos/doc-verso.jpg \
  ./exemplos/selfie.jpg
```

## Integração com NestJS

1. Importe o utilitário no seu serviço NestJS:

```ts
import { MediapipeFaceVerifier } from '../face-comparison/mediapipe-face-verifier';

@Injectable()
export class IdentityService {
  private readonly verifier = new MediapipeFaceVerifier();

  async verify(payload: { front: Buffer; back: Buffer; selfie: Buffer }) {
    return this.verifier.verifyDocumentAndSelfie(
      payload.front,
      payload.back,
      payload.selfie,
    );
  }
}
```

2. Utilize o serviço no controlador responsável pelo upload das imagens.

3. Garanta que as imagens sejam convertidas para `Buffer` antes de chamar o verificador (por exemplo, usando `@nestjs/platform-express`).

## Ajustando o limiar de similaridade

- O valor padrão é `0.85`. Ajuste conforme seus testes de acurácia.
- Para ambientes de avaliação mais rigorosa, aumente o limiar (e.g., `0.88`).
- Tenha sempre um fluxo de revisão manual para casos onde `similarity` fica próximo do limiar.

## Boas práticas adicionais

- Armazene logs de `similarity` para calibrar o limiar.
- Rejeite imagens muito pequenas ou borradas antes de chamar o MediaPipe.
- Considere rodar a análise em fila/background quando o tempo de resposta não for crítico.
