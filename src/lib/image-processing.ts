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
  
    // 1. Create offline canvas
    const canvas = document.createElement("canvas");
    
    // 2. Calculate actual pixel coordinates
    // roi x,y,w,h are in Percentages (0~100) or Pixels? 
    // The previous plan implied we need coordinate transform. 
    // Let's assume the input ROI is already in *Video Natural Dimensions* or *Percentages*.
    // For specific implementation, let's stick to PERCENTAGE for responsiveness, 
    // but the actual draw needs Pixels.
    
    // Let's define ROI as percentage (0-100) for this utility
    const pixelX = (roi.x / 100) * video.videoWidth;
    const pixelY = (roi.y / 100) * video.videoHeight;
    const pixelW = (roi.width / 100) * video.videoWidth;
    const pixelH = (roi.height / 100) * video.videoHeight;
  
    canvas.width = pixelW;
    canvas.height = pixelH;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
  
    // 3. Draw only the cropped region
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(
      video,
      pixelX,
      pixelY,
      pixelW,
      pixelH,
      0,
      0,
      pixelW,
      pixelH
    );
  
    // 4. Preprocessing (Optional for better OCR)
    // grayscale, binarization could go here
    
    // 5. Convert to Blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  }
