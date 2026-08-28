// @ts-ignore — no type declarations for the worker entry point
import { WorkerMessageHandler } from "pdfjs-dist/legacy/build/pdf.worker.mjs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";

// Statically importing WorkerMessageHandler above ensures Vercel's file tracer
// includes pdf.worker.mjs in the deployment bundle.
//
// In Node.js there is no real Worker API, so pdfjs falls back to a "fake worker"
// which does: await import(GlobalWorkerOptions.workerSrc)
// We short-circuit this by overriding _setupFakeWorkerGlobal on PDFWorker to
// return a promise that resolves to the already-loaded WorkerMessageHandler,
// so the dynamic import() is never attempted.
const { PDFWorker } = pdfjsLib as typeof pdfjsLib & {
  PDFWorker: { _setupFakeWorkerGlobal: Promise<typeof WorkerMessageHandler> };
};

Object.defineProperty(PDFWorker, "_setupFakeWorkerGlobal", {
  get() {
    return Promise.resolve(WorkerMessageHandler);
  },
  configurable: true,
  enumerable: true,
});

// workerSrc must be a non-empty string to pass the getter guard in pdfjs,
// even though we never actually import it (the override above prevents that).
pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";

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

    const buffer = await canvas.encode("jpeg", 85);
    images.push(`data:image/jpeg;base64,${buffer.toString("base64")}`);
  }

  return images;
}

export async function fileToImageUrl(file: File): Promise<string[]> {
  if (file.type === "application/pdf") {
    return pdfFileToImages(file);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return [`data:${file.type};base64,${buffer.toString("base64")}`];
}
