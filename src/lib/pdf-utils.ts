import * as pdfjsLib from "pdfjs-dist";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PDFPageImage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Convert a PDF file to page images
 */
export async function pdfToImages(
  file: File,
  maxDimension: number = 2000
): Promise<PDFPageImage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: PDFPageImage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });

    // Calculate scale to fit within maxDimension
    const scale = Math.min(
      maxDimension / viewport.width,
      maxDimension / viewport.height,
      2 // Maximum scale factor
    );

    const scaledViewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    await page.render({
      canvasContext: ctx,
      viewport: scaledViewport,
      canvas: canvas,
    }).promise;

    pages.push({
      pageNumber: i,
      dataUrl: canvas.toDataURL("image/jpeg", 0.9),
      width: canvas.width,
      height: canvas.height,
    });
  }

  return pages;
}

/**
 * Convert an image file to a data URL
 */
export async function imageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert multiple files to images
 */
export async function filesToImages(
  files: File[],
  maxDimension: number = 2000
): Promise<string[]> {
  const images: string[] = [];

  for (const file of files) {
    if (file.type === "application/pdf") {
      const pdfImages = await pdfToImages(file, maxDimension);
      images.push(...pdfImages.map((img) => img.dataUrl));
    } else if (file.type.startsWith("image/")) {
      const dataUrl = await imageToDataUrl(file);
      images.push(dataUrl);
    }
  }

  return images;
}

/**
 * Normalize bounding box coordinates to pixels
 */
export function normalizeBboxToPixels(
  bbox: [number, number, number, number],
  imageWidth: number,
  imageHeight: number
): { x: number; y: number; width: number; height: number } {
  const [x, y, w, h] = bbox;
  return {
    x: x * imageWidth,
    y: y * imageHeight,
    width: w * imageWidth,
    height: h * imageHeight,
  };
}

/**
 * Draw highlight overlay on canvas
 */
export function drawHighlight(
  canvas: HTMLCanvasElement,
  bbox: [number, number, number, number],
  color: string = "rgba(59, 130, 246, 0.3)",
  borderColor: string = "rgba(59, 130, 246, 0.8)",
  borderWidth: number = 2
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { x, y, width, height } = normalizeBboxToPixels(
    bbox,
    canvas.width,
    canvas.height
  );

  // Draw highlight
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);

  // Draw border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(x, y, width, height);
}