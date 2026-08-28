import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";

// In Node.js there is no real Worker API, so pdfjs falls back to a "fake
// worker" by doing:  await import(GlobalWorkerOptions.workerSrc)
// The value must therefore be a resolvable module specifier (not a file URL,
// not an empty string, not a random word).  Pointing it at the worker entry
// that ships inside pdfjs-dist lets Node.js resolve it from node_modules.
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "pdfjs-dist/legacy/build/pdf.worker.mjs";

export async function pdfFileToImages(
  file: File,
  maxDimension: number = 1200
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const pdf = await pdfjsLib
    .getDocument({ data: uint8Array })
    .promise;
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
    const canvas = createCanvas(
      Math.round(scaledViewport.width),
      Math.round(scaledViewport.height)
    );

    const ctx = canvas.getContext("2d");

    const renderContext = {
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport: scaledViewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    } as unknown as Parameters<typeof page.render>[0];

    await page.render(renderContext).promise;

    // @napi-rs/canvas — encode to JPEG and return as base64 data URL
    const buffer = await canvas.encode("jpeg", 85);
    images.push(`data:image/jpeg;base64,${buffer.toString("base64")}`);
  }

  return images;
}

export async function fileToImageUrl(file: File): Promise<string[]> {
  if (file.type === "application/pdf") {
    return pdfFileToImages(file);
  }
  // Image files — return as base64 data URL
  const buffer = Buffer.from(await file.arrayBuffer());
  return [`data:${file.type};base64,${buffer.toString("base64")}`];
}
