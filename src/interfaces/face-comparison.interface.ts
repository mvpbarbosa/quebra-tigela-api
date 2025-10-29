export interface FaceComparisonResult {
  similarity: number;
  isMatch: boolean;
  confidence: number;
  detectionMethod: string;
}

export interface IdentityVerificationResult {
  verified: boolean;
  similarity: number;
  confidence: number;
  message: string;
  details: {
    detectionMethod: string;
    threshold: number;
    timestamp: string;
  };
}

export interface FaceQualityAnalysis {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  issues: string[];
  hasFace: boolean;
}

export interface ArtistVerificationResult extends IdentityVerificationResult {
  artistId: string;
  status: 'APPROVED' | 'REJECTED';
  timestamp: string;
}
