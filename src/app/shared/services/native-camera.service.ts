import { Injectable } from '@angular/core';
import { Camera, CameraDirection, MediaResult } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CapturedPhoto {
  previewUrl: string;
  blob: Blob;
  contentType: string;
  fileName: string;
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
    const format = (result.metadata?.format ?? 'jpeg').toLowerCase();
    const contentType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const fileName = `encomenda-${Date.now()}.${format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg'}`;

    if (Capacitor.getPlatform() === 'web') {
      const base64 = result.thumbnail;
      if (!base64) {
        throw new Error('Foto capturada sem dados de imagem.');
      }
      const blob = this.base64ToBlob(base64, contentType);
      return {
        previewUrl: URL.createObjectURL(blob),
        blob,
        contentType,
        fileName,
      };
    }

    const previewUrl = result.webPath ?? (result.uri ? Capacitor.convertFileSrc(result.uri) : null);
    if (!previewUrl) {
      throw new Error('Foto capturada sem caminho de arquivo.');
    }

    const response = await fetch(previewUrl);
    if (!response.ok) {
      throw new Error('Não foi possível ler a foto capturada.');
    }
    const blob = await response.blob();
    const resolvedType = blob.type || contentType;

    return {
      previewUrl,
      blob: blob.type ? blob : new Blob([blob], { type: resolvedType }),
      contentType: resolvedType,
      fileName,
    };
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: contentType });
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
