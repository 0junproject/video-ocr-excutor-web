/**
 * Captures a specific region from a video element and returns it as a Blob.
 * 
 * @param video The source HTMLVideoElement
 * @param roi The region of interest { x, y, width, height } in percentages (0-100)
 * @returns Promise<Blob | null>
 */
export async function captureVideoFrame(
    video: HTMLVideoElement,
    roi: { x: number; y: number; width: number; height: number }
  ): Promise<Blob | null> {
    if (!video || video.videoWidth === 0) return null;
  
    // 1. Calculate actual pixel coordinates
    const pixelX = (roi.x / 100) * video.videoWidth;
    const pixelY = (roi.y / 100) * video.videoHeight;
    const pixelW = (roi.width / 100) * video.videoWidth;
    const pixelH = (roi.height / 100) * video.videoHeight;

    // 2. Preprocessing Configuration
    // Upscale factor to improve OCR on small text (Tesseract likes char height > 20px)
    const scale = 2.0; 
  
    // 3. Create offline canvas with scaled dimensions
    const canvas = document.createElement("canvas");
    canvas.width = pixelW * scale;
    canvas.height = pixelH * scale;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
  
    // 4. Apply Filters (Grayscale + High Contrast)
    // This helps Tesseract distinguish text from background noise
    ctx.filter = 'grayscale(100%) contrast(200%)';

    // 5. Draw the cropped region with scaling
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(
      video,
      pixelX,
      pixelY,
      pixelW,
      pixelH,
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    // 6. Convert to Blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  }
