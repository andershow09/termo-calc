import { registerPlugin } from '@capacitor/core';

export interface PdfViewerPlugin {
  open(options: { uri: string }): Promise<void>;
}

export const PdfViewer = registerPlugin<PdfViewerPlugin>('PdfViewer');
