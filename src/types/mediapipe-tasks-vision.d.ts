declare module '@mediapipe/tasks-vision' {
  export type FaceLandmarkerResult = {
    faceLandmarks?: Array<
      Array<{
        x: number;
        y: number;
        z?: number;
        visibility?: number;
        presence?: number;
      }>
    >;
    faceBlendshapes?: unknown;
    facialTransformationMatrixes?: unknown;
  };

  export type FaceLandmarkerOptions = {
    baseOptions?: {
      modelAssetPath?: string;
    };
    runningMode?: 'IMAGE' | 'VIDEO' | 'LIVE_STREAM';
    numFaces?: number;
    outputFaceBlendshapes?: boolean;
    outputFacialTransformationMatrixes?: boolean;
  };

  export class FaceLandmarker {
    static createFromOptions(
      resolver: FilesetResolver,
      options: FaceLandmarkerOptions,
    ): Promise<FaceLandmarker>;

    detect(image: ImageData): FaceLandmarkerResult | null;
  }

  export class FilesetResolver {
    static forVisionTasks(pathOrUrl: string): Promise<FilesetResolver>;
  }
}
