import path from 'node:path';
import { createCanvas, loadImage } from 'canvas';
import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
  type FaceLandmarkerOptions,
} from '@mediapipe/tasks-vision';

export interface DocumentSideAnalysis {
  hasFace: boolean;
  facesDetected: number;
  landmarksQuality?: number;
}

export interface SelfieComparisonResult {
  hasFace: boolean;
  facesDetected: number;
  similarity: number;
  isMatch: boolean;
}

export interface DocumentVerificationOutput {
  front: DocumentSideAnalysis;
  back: DocumentSideAnalysis;
  selfie: SelfieComparisonResult;
}

export interface MediapipeFaceVerifierOptions {
  wasmPath?: string;
  modelAssetPath?: string;
  similarityThreshold?: number;
}

const DEFAULT_MODEL_ASSET_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export class MediapipeFaceVerifier {
  private faceLandmarker: FaceLandmarker | null = null;
  private readonly options: MediapipeFaceVerifierOptions;
  private readonly threshold: number;

  constructor(options: MediapipeFaceVerifierOptions = {}) {
    this.options = options;
    this.threshold = options.similarityThreshold ?? 0.85;
  }

  async init(): Promise<void> {
    if (this.faceLandmarker) {
      return;
    }

    const wasmPath =
      this.options.wasmPath ||
      path.join(
        __dirname,
        '..',
        '..',
        'node_modules',
        '@mediapipe',
        'tasks-vision',
        'wasm',
      );

    const filesetResolver = await FilesetResolver.forVisionTasks(wasmPath);

    const landmarkerOptions: FaceLandmarkerOptions = {
      baseOptions: {
        modelAssetPath: this.options.modelAssetPath ?? DEFAULT_MODEL_ASSET_URL,
      },
      runningMode: 'IMAGE',
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    };

    this.faceLandmarker = await FaceLandmarker.createFromOptions(
      filesetResolver,
      landmarkerOptions,
    );
  }

  async verifyDocumentAndSelfie(
    documentFront: Buffer,
    documentBack: Buffer,
    selfie: Buffer,
  ): Promise<DocumentVerificationOutput> {
    if (!this.faceLandmarker) {
      await this.init();
    }
    if (!this.faceLandmarker) {
      throw new Error('FaceLandmarker não foi inicializado');
    }

    const [frontResult, backResult, selfieResult] = await Promise.all([
      this.detectFaces(documentFront),
      this.detectFaces(documentBack),
      this.detectFaces(selfie),
    ]);

    const documentEmbedding = this.extractEmbedding(frontResult);
    const selfieEmbedding = this.extractEmbedding(selfieResult);

    const similarity =
      documentEmbedding && selfieEmbedding
        ? this.cosineSimilarity(documentEmbedding, selfieEmbedding)
        : 0;

    const isMatch = similarity >= this.threshold;

    return {
      front: {
        hasFace: (frontResult?.faceLandmarks?.length ?? 0) > 0,
        facesDetected: frontResult?.faceLandmarks?.length ?? 0,
        landmarksQuality: this.calculateLandmarksQuality(frontResult),
      },
      back: {
        hasFace: (backResult?.faceLandmarks?.length ?? 0) > 0,
        facesDetected: backResult?.faceLandmarks?.length ?? 0,
      },
      selfie: {
        hasFace: (selfieResult?.faceLandmarks?.length ?? 0) > 0,
        facesDetected: selfieResult?.faceLandmarks?.length ?? 0,
        similarity,
        isMatch,
      },
    };
  }

  private async detectFaces(
    imageBuffer: Buffer,
  ): Promise<FaceLandmarkerResult | null> {
    if (!this.faceLandmarker) {
      throw new Error('FaceLandmarker não inicializado');
    }

    try {
      const image = await loadImage(imageBuffer);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      return this.faceLandmarker.detect(imageData);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      return null;
    }
  }

  private extractEmbedding(
    result: FaceLandmarkerResult | null,
  ): number[] | null {
    if (!result || !result.faceLandmarks?.length) {
      return null;
    }

    const landmarks = result.faceLandmarks[0];
    const embedding: number[] = [];

    for (const landmark of landmarks) {
      embedding.push(landmark.x, landmark.y, landmark.z ?? 0);
    }

    return embedding;
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      const a = vecA[i];
      const b = vecB[i];
      dot += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
    return Math.min(Math.max(similarity, -1), 1);
  }

  private calculateLandmarksQuality(
    result: FaceLandmarkerResult | null,
  ): number | undefined {
    if (!result || !result.faceLandmarks?.length) {
      return undefined;
    }

    const landmarks = result.faceLandmarks[0];
    if (!landmarks.length) {
      return undefined;
    }

    let spread = 0;
    const center = { x: 0, y: 0 };

    for (const landmark of landmarks) {
      center.x += landmark.x;
      center.y += landmark.y;
    }

    center.x /= landmarks.length;
    center.y /= landmarks.length;

    for (const landmark of landmarks) {
      const dx = landmark.x - center.x;
      const dy = landmark.y - center.y;
      spread += Math.sqrt(dx * dx + dy * dy);
    }

    const quality = spread / landmarks.length;
    return Math.round(quality * 1000) / 1000;
  }
}
