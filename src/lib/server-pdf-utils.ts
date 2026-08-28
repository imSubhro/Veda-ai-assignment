import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "canvas";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs")
).href;

export async function pdfFileToImages(
  file: File,
  maxDimension: number = 1200
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });

    const scale = Math.min(
      maxDimension / viewport.width,
      maxDimension / viewport.height,
      2
    );

    const scaledViewport = page.getViewport({ scale });
    const canvas = createCanvas(scaledViewport.width, scaledViewport.height);

    const ctx = canvas.getContext("2d");

    const renderContext = {
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport: scaledViewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    } as unknown as Parameters<typeof page.render>[0];

    await page.render(renderContext).promise;

    images.push(canvas.toDataURL("image/jpeg", 0.85));
  }

  return images;
}

export async function fileToImageUrl(file: File): Promise<string[]> {
  if (file.type === "application/pdf") {
    return pdfFileToImages(file);
  }
  // Image files - return as base64 data URL
  const buffer = Buffer.from(await file.arrayBuffer());
  return [`data:${file.type};base64,${buffer.toString("base64")}`];
}
