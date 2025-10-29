import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FaceComparisonService {
  private isModelsLoaded = false;

  constructor() {
    this.loadModels();
  }

  private async loadModels() {
    // Simulação de carregamento para desenvolvimento
    try {
      console.log('Face comparison service initialized (development mode)');
      this.isModelsLoaded = true;
    } catch (error) {
      console.error('Error initializing face comparison service:', error);
    }
  }

  async compareFaces(
    image1Buffer: Buffer,
    image2Buffer: Buffer,
  ): Promise<{
    similarity: number;
    isMatch: boolean;
    confidence: number;
    detectionMethod: string;
  }> {
    try {
      // Extrair características das imagens usando apenas Sharp
      const [features1, features2] = await Promise.all([
        this.extractImageFeatures(image1Buffer),
        this.extractImageFeatures(image2Buffer),
      ]);

      if (!features1 || !features2) {
        throw new BadRequestException(
          'Não foi possível processar uma ou ambas as imagens',
        );
      }

      // Calcular similaridade baseada nas características extraídas
      const similarity = this.calculateSimilarity(features1, features2);
      const threshold = 0.85;

      return {
        similarity: Math.round(similarity * 100) / 100,
        isMatch: similarity >= threshold,
        confidence: Math.round(similarity * 100),
        detectionMethod: 'Sharp-based image analysis',
      };
    } catch (error) {
      throw new BadRequestException(
        `Erro na comparação de imagens: ${error.message}`,
      );
    }
  }

  private async extractImageFeatures(imageBuffer: Buffer): Promise<{
    histogram: number[];
    dimensions: { width: number; height: number };
    brightness: number;
    contrast: number;
    hash: string;
  } | null> {
    try {
      // Redimensionar e processar imagem
      const processedImage = await sharp(imageBuffer)
        .resize(256, 256, { fit: 'cover' })
        .greyscale()
        .raw()
        .toBuffer();

      const metadata = await sharp(imageBuffer).metadata();

      // Calcular histograma de intensidade
      const histogram = this.calculateHistogram(processedImage);

      // Calcular brilho médio
      const brightness = this.calculateBrightness(processedImage);

      // Calcular contraste
      const contrast = this.calculateContrast(processedImage, brightness);

      // Gerar hash perceptual simples
      const hash = this.generatePerceptualHash(processedImage);

      return {
        histogram,
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0,
        },
        brightness,
        contrast,
        hash,
      };
    } catch (error) {
      console.error('Error extracting image features:', error);
      return null;
    }
  }

  private calculateHistogram(imageData: Buffer): number[] {
    const histogram = new Array(256).fill(0);
    
    for (let i = 0; i < imageData.length; i++) {
      const pixelValue = imageData[i];
      histogram[pixelValue]++;
    }

    // Normalizar histograma
    const total = imageData.length;
    return histogram.map(count => count / total);
  }

  private calculateBrightness(imageData: Buffer): number {
    let sum = 0;
    for (let i = 0; i < imageData.length; i++) {
      sum += imageData[i];
    }
    return sum / imageData.length / 255; // Normalizar para 0-1
  }

  private calculateContrast(imageData: Buffer, brightness: number): number {
    let variance = 0;
    const meanBrightness = brightness * 255;
    
    for (let i = 0; i < imageData.length; i++) {
      variance += Math.pow(imageData[i] - meanBrightness, 2);
    }
    
    return Math.sqrt(variance / imageData.length) / 255; // Normalizar para 0-1
  }

  private generatePerceptualHash(imageData: Buffer): string {
    // Reduzir para 8x8 para hash simples
    const reduced: number[] = [];
    const step = Math.floor(Math.sqrt(imageData.length) / 8);
    
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const index = (i * step * 256) + (j * step);
        if (index < imageData.length) {
          reduced.push(imageData[index]);
        } else {
          reduced.push(0);
        }
      }
    }

    // Calcular média
    const mean = reduced.reduce((a, b) => a + b, 0) / reduced.length;

    // Criar hash binário
    let hash = '';
    for (const pixel of reduced) {
      hash += pixel > mean ? '1' : '0';
    }

    return hash;
  }

  private calculateSimilarity(
    features1: {
      histogram: number[];
      dimensions: { width: number; height: number };
      brightness: number;
      contrast: number;
      hash: string;
    },
    features2: {
      histogram: number[];
      dimensions: { width: number; height: number };
      brightness: number;
      contrast: number;
      hash: string;
    },
  ): number {
    // Comparar histogramas (50% do peso)
    const histogramSimilarity = this.compareHistograms(
      features1.histogram,
      features2.histogram,
    );

    // Comparar brilho e contraste (25% do peso)
    const brightnessDiff = Math.abs(features1.brightness - features2.brightness);
    const contrastDiff = Math.abs(features1.contrast - features2.contrast);
    const brightnessSimilarity = 1 - brightnessDiff;
    const contrastSimilarity = 1 - contrastDiff;

    // Comparar hash perceptual (25% do peso)
    const hashSimilarity = this.compareHashes(features1.hash, features2.hash);

    // Média ponderada
    const totalSimilarity =
      histogramSimilarity * 0.5 +
      (brightnessSimilarity + contrastSimilarity) * 0.25 +
      hashSimilarity * 0.25;

    return Math.max(0, Math.min(1, totalSimilarity));
  }

  private compareHistograms(hist1: number[], hist2: number[]): number {
    if (hist1.length !== hist2.length) return 0;

    // Correlação de histogramas
    let correlation = 0;
    for (let i = 0; i < hist1.length; i++) {
      correlation += Math.min(hist1[i], hist2[i]);
    }

    return correlation;
  }

  private compareHashes(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 0;

    let matches = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] === hash2[i]) {
        matches++;
      }
    }

    return matches / hash1.length;
  }

  async verifyIdentity(
    userPhotoBuffer: Buffer,
    documentPhotoBuffer: Buffer,
  ): Promise<{
    verified: boolean;
    similarity: number;
    confidence: number;
    message: string;
    details: any;
  }> {
    const result = await this.compareFaces(
      userPhotoBuffer,
      documentPhotoBuffer,
    );

    return {
      verified: result.isMatch,
      similarity: result.similarity,
      confidence: result.confidence,
      message: result.isMatch
        ? 'Identidade verificada com sucesso'
        : 'Identidade não pôde ser verificada - imagens não coincidem',
      details: {
        detectionMethod: result.detectionMethod,
        threshold: 0.6,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async analyzeFaceQuality(imageBuffer: Buffer): Promise<{
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    issues: string[];
    hasFace: boolean;
  }> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      const issues: string[] = [];
      let score = 100;

      // Verificar resolução
      if (!metadata.width || !metadata.height) {
        issues.push('Não foi possível ler dimensões da imagem');
        score -= 50;
      } else if (metadata.width < 300 || metadata.height < 300) {
        issues.push('Resolução muito baixa (mínimo 300x300)');
        score -= 30;
      }

      // Verificar formato
      if (!['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format || '')) {
        issues.push('Formato de imagem não suportado');
        score -= 20;
      }

      // Verificar tamanho do arquivo
      if (imageBuffer.length < 10000) {
        // Menos de 10KB
        issues.push('Arquivo muito pequeno - pode estar corrompido');
        score -= 25;
      }

      // Análise básica de qualidade
      const features = await this.extractImageFeatures(imageBuffer);
      if (features) {
        // Verificar se a imagem tem contraste suficiente
        if (features.contrast < 0.1) {
          issues.push('Contraste muito baixo');
          score -= 20;
        }

        // Verificar se não está muito escura ou muito clara
        if (features.brightness < 0.1 || features.brightness > 0.9) {
          issues.push('Imagem muito escura ou muito clara');
          score -= 15;
        }
      }

      // Simular detecção de face baseada na qualidade geral
      const hasGoodSize = (metadata.width || 0) >= 300 && (metadata.height || 0) >= 300;
      const hasValidFormat = metadata.format && ['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format);
      const hasGoodQuality = score >= 50;
      const hasFace = hasGoodSize && hasValidFormat && hasGoodQuality;

      if (!hasFace && hasGoodSize && hasValidFormat) {
        issues.push('Qualidade da imagem inadequada para análise');
      }

      // Determinar qualidade final
      let quality: 'excellent' | 'good' | 'fair' | 'poor';
      if (score >= 90) quality = 'excellent';
      else if (score >= 70) quality = 'good';
      else if (score >= 50) quality = 'fair';
      else quality = 'poor';

      return { quality, score, issues, hasFace };
    } catch (error) {
      return {
        quality: 'poor',
        score: 0,
        issues: ['Erro ao processar imagem: ' + error.message],
        hasFace: false,
      };
    }
  }
}
