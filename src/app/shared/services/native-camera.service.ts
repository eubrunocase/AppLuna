import { Injectable } from '@angular/core';
import { Camera, CameraDirection, MediaResult } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CapturedPhoto {
  previewUrl: string;
  base64: string;
}

const PHOTO_OPTIONS = {
  quality: 85,
  targetWidth: 1280,
  targetHeight: 1280,
  correctOrientation: true,
  cameraDirection: CameraDirection.Rear,
  includeMetadata: true,
} as const;

const USER_CANCELLED_CODES = new Set([
  'OS-PLUG-CAMR-0006',
  'OS-PLUG-CAMR-0013',
  'OS-PLUG-CAMR-0017',
  'OS-PLUG-CAMR-0020',
]);

@Injectable({ providedIn: 'root' })
export class NativeCameraService {
  async takePhoto(): Promise<CapturedPhoto | null> {
    try {
      const result = await Camera.takePhoto(PHOTO_OPTIONS);
      return await this.toCapturedPhoto(result);
    } catch (error) {
      if (this.isUserCancelled(error)) {
        return null;
      }
      throw error;
    }
  }

  async pickFromGallery(): Promise<CapturedPhoto | null> {
    try {
      const { results } = await Camera.chooseFromGallery({
        ...PHOTO_OPTIONS,
        allowMultipleSelection: false,
      });
      const result = results[0];
      if (!result) {
        return null;
      }
      return await this.toCapturedPhoto(result);
    } catch (error) {
      if (this.isUserCancelled(error)) {
        return null;
      }
      throw error;
    }
  }

  private async toCapturedPhoto(result: MediaResult): Promise<CapturedPhoto> {
    const format = result.metadata?.format ?? 'jpeg';

    if (Capacitor.getPlatform() === 'web') {
      const base64 = result.thumbnail;
      if (!base64) {
        throw new Error('Foto capturada sem dados de imagem.');
      }
      return {
        previewUrl: `data:image/${format};base64,${base64}`,
        base64,
      };
    }

    const previewUrl = result.webPath ?? (result.uri ? Capacitor.convertFileSrc(result.uri) : null);
    if (!previewUrl) {
      throw new Error('Foto capturada sem caminho de arquivo.');
    }

    const base64 = await this.readBase64FromWebPath(previewUrl);
    return { previewUrl, base64 };
  }

  private readBase64FromWebPath(webPath: string): Promise<string> {
    return fetch(webPath)
      .then(response => response.blob())
      .then(blob => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve(dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      }));
  }

  private isUserCancelled(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const code = 'code' in error ? String(error.code) : '';
    if (USER_CANCELLED_CODES.has(code)) {
      return true;
    }

    const message = 'message' in error ? String(error.message).toLowerCase() : '';
    return message.includes('cancel') || message.includes('cancelled');
  }
}
