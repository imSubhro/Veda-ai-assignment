import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — no type declarations for the worker entry point
import { WorkerMessageHandler } from "pdfjs-dist/legacy/build/pdf.worker.mjs";
import { createCanvas } from "@napi-rs/canvas";

// Wire the pdfjs worker in-process via MessageChannel so Vercel's bundler
// can statically trace the import and include the worker file in the bundle.
// Using workerPort bypasses the workerSrc / fake-worker path entirely.
let _workerPort: MessagePort | null = null;

function ensureWorker(): void {
  if (_workerPort) return;

  const { port1, port2 } = new MessageChannel();

  // WorkerMessageHandler.setup(port) starts the worker message loop on port1
  WorkerMessageHandler.setup(port1 as unknown as Worker, port1);

  // Give pdfjs the other end of the channel
  _workerPort = port2;
  pdfjsLib.GlobalWorkerOptions.workerPort = port2 as unknown as Worker;
}

export async function pdfFileToImages(
  file: File,
  maxDimension: number = 1200
): Promise<string[]> {
  ensureWorker();

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
