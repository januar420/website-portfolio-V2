/**
 * Utility functions for WebGL context management and optimization
 */

interface WebGLSupportResult {
  supported: boolean;
  reason?: string;
}

interface WebGLIssuesResult {
  hasIssues: boolean;
  issues: string[];
}

/**
 * Memeriksa apakah browser mendukung WebGL
 */
export function checkWebGLSupport(): WebGLSupportResult {
  if (typeof window === 'undefined') {
    return { supported: false, reason: 'Running in server-side rendering' };
  }

  try {
    const canvas = document.createElement('canvas');
    
    // Coba dapatkan context WebGL
    const gl = 
      canvas.getContext('webgl') || 
      canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      return { 
        supported: false, 
        reason: 'Browser tidak mendukung WebGL'
      };
    }

    // Cek ekstensi-ekstensi penting
    const extensions = {
      standardDerivatives: gl.getExtension('OES_standard_derivatives'),
      textureFloat: gl.getExtension('OES_texture_float'),
      drawBuffers: gl.getExtension('WEBGL_draw_buffers'),
    };

    // Hitung skor dukungan
    let supportScore = 0;
    Object.keys(extensions).forEach(key => {
      // @ts-ignore - Kita sudah memeriksa nama ekstensi secara hardcoded
      if (extensions[key]) supportScore++;
    });

    // Jika skor terlalu rendah, mungkin ada masalah
    if (supportScore < 1) {
      return {
        supported: true,
        reason: 'WebGL didukung tapi dengan kemampuan terbatas'
      };
    }

    return { supported: true };
  } catch (e) {
    return { 
      supported: false, 
      reason: 'Error saat memeriksa dukungan WebGL: ' + (e instanceof Error ? e.message : String(e))
    };
  }
}

// Monitor WebGL memory usage (approximate)
export function monitorWebGLMemory(gl: WebGLRenderingContext | WebGL2RenderingContext): {
  textureMemory: number
  bufferMemory: number
  totalMemoryMB: number
} {
  // This is an approximation as browsers don't expose exact memory usage
  let textureMemory = 0
  let bufferMemory = 0

  // Check texture memory (very approximate)
  const textures = gl.getParameter(gl.TEXTURE_BINDING_2D)
  if (textures) {
    // Assuming average texture size
    textureMemory = 4 * 1024 * 1024 // 4MB per texture (very rough estimate)
  }

  // Check buffer memory (very approximate)
  const buffers = gl.getParameter(gl.ARRAY_BUFFER_BINDING)
  if (buffers) {
    // Assuming average buffer size
    bufferMemory = 1 * 1024 * 1024 // 1MB per buffer (very rough estimate)
  }

  const totalMemoryMB = (textureMemory + bufferMemory) / (1024 * 1024)

  return {
    textureMemory,
    bufferMemory,
    totalMemoryMB,
  }
}

// Optimize WebGL context creation
export function createOptimizedWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  const contextOptions: WebGLContextAttributes = {
    alpha: false, // Disable alpha channel for better performance
    antialias: false, // Disable antialiasing for better performance
    depth: true, // Enable depth testing
    failIfMajorPerformanceCaveat: false, // Don't fail on performance issues
    powerPreference: "high-performance", // Request high performance GPU
    premultipliedAlpha: false, // Disable premultiplied alpha for better performance
    preserveDrawingBuffer: false, // Don't preserve drawing buffer unless needed
    stencil: false, // Disable stencil buffer unless needed
  }

  // Try WebGL2 first, then fall back to WebGL1
  let gl = canvas.getContext("webgl2", contextOptions) as WebGLRenderingContext

  if (!gl) {
    gl = canvas.getContext("webgl", contextOptions) as WebGLRenderingContext
  }

  return gl
}

// Handle context loss and restoration
export function setupContextLossHandling(
  canvas: HTMLCanvasElement,
  onContextLost: () => void,
  onContextRestored: () => void,
): () => void {
  const handleContextLost = (event: Event) => {
    event.preventDefault()
    console.warn("WebGL context lost")
    onContextLost()
  }

  const handleContextRestored = () => {
    console.log("WebGL context restored")
    onContextRestored()
  }

  canvas.addEventListener("webglcontextlost", handleContextLost)
  canvas.addEventListener("webglcontextrestored", handleContextRestored)

  // Return cleanup function
  return () => {
    canvas.removeEventListener("webglcontextlost", handleContextLost)
    canvas.removeEventListener("webglcontextrestored", handleContextRestored)
  }
}

/**
 * Mendeteksi kemungkinan masalah WebGL seperti driver, hardware, atau batasan browser
 */
export function detectPotentialWebGLIssues(): WebGLIssuesResult {
  if (typeof window === 'undefined') {
    return { hasIssues: true, issues: ['Running in server-side rendering'] };
  }

  const issues: string[] = [];
  
  try {
    const canvas = document.createElement('canvas');
    const gl = 
      canvas.getContext('webgl') || 
      canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (!gl) {
      return { 
        hasIssues: true, 
        issues: ['WebGL tidak tersedia']
      };
    }

    // Cek ukuran maksimum tekstur
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (maxTextureSize < 4096) {
      issues.push(`Ukuran tekstur maksimum terbatas: ${maxTextureSize}px`);
    }
    
    // Cek jumlah maksimum vertex attributes
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    if (maxVertexAttribs < 16) {
      issues.push(`Jumlah vertex attributes terbatas: ${maxVertexAttribs}`);
    }

    // Deteksi kemungkinan mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobile) {
      issues.push('Menggunakan perangkat mobile, performa mungkin terbatas');
    }

    // Deteksi browser
    if (navigator.userAgent.indexOf('Firefox') !== -1 && navigator.userAgent.indexOf('Windows') !== -1) {
      issues.push('Firefox di Windows mungkin memiliki masalah WebGL tertentu');
    }

    // Deteksi masalah hardware acceleration
    const canvas2d = document.createElement('canvas');
    const ctx = canvas2d.getContext('2d');
    if (ctx) {
      try {
        // Tidak ada cara yang reliable untuk mendeteksi hardware acceleration
        // pada semua browser, jadi kita coba metode alternatif
        const isHardwareAccelerated = !!(window as any).chrome || 
          !!(navigator as any).webdriver || 
          (navigator.userAgent.indexOf('Chrome') > -1);
            
        if (!isHardwareAccelerated) {
          issues.push('Hardware acceleration mungkin dinonaktifkan');
        }
      } catch (e) {
        // Jika terjadi error, kita tidak bisa menentukan apakah hardware acceleration aktif
      }
    }

    return {
      hasIssues: issues.length > 0,
      issues
    };
  } catch (e) {
    return { 
      hasIssues: true, 
      issues: [`Error saat mendeteksi masalah WebGL: ${e instanceof Error ? e.message : String(e)}`]
    };
  }
}

