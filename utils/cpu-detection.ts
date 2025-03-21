/**
 * CPU detection and optimization utilities
 * Provides performance metrics and optimization settings based on CPU capabilities
 */

export interface CPUInfo {
  cores: number;
  logicalCores: number;
  architecture: "x86" | "arm" | "unknown";
  isLowEnd: boolean;
  isHighEnd: boolean;
  platform: "desktop" | "mobile" | "unknown";
  concurrencyLevel: number;  // Maksimum worker yang disarankan
  supportsSIMD: boolean;
  throttled: boolean;
}

/**
 * Deteksi kapabilitas CPU menggunakan metrics dan heuristik yang tersedia
 */
export function detectCPU(): CPUInfo {
  // Nilai default
  let cores = 0;
  let logicalCores = 0;
  let architecture: "x86" | "arm" | "unknown" = "unknown";
  let isLowEnd = false;
  let isHighEnd = false;
  let platform: "desktop" | "mobile" | "unknown" = "unknown";
  let supportsSIMD = false;
  let throttled = false;

  try {
    // Deteksi jumlah core (logis)
    if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
      logicalCores = navigator.hardwareConcurrency;
      cores = Math.max(1, Math.floor(logicalCores / 2)); // Estimasi kasar jumlah physical cores
    } else {
      // Fallback jika hardwareConcurrency tidak tersedia
      logicalCores = 2;
      cores = 1;
    }

    // Deteksi platform dan arsitektur
    if (typeof navigator !== "undefined") {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Deteksi platform (mobile vs desktop)
      platform = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent) 
        ? "mobile" 
        : "desktop";

      // Deteksi arsitektur berdasarkan user agent
      if (userAgent.includes("arm") || userAgent.includes("aarch64") || userAgent.includes("apple")) {
        architecture = "arm";
      } else if (userAgent.includes("x86") || userAgent.includes("intel") || userAgent.includes("amd")) {
        architecture = "x86";
      }
    }

    // Coba deteksi dukungan SIMD
    try {
      // @ts-ignore - WebAssembly.simd mungkin tidak ada di semua lingkungan
      supportsSIMD = typeof WebAssembly !== "undefined" && !!WebAssembly.validate;
    } catch (e) {
      supportsSIMD = false;
    }

    // Kategorikan CPU berdasarkan cores dan platform
    if (platform === "mobile") {
      isLowEnd = logicalCores <= 4;
      isHighEnd = logicalCores >= 8;
    } else {
      isLowEnd = logicalCores <= 2;
      isHighEnd = logicalCores >= 8;
    }

    // Uji throttling dengan microbenchmark sederhana
    throttled = detectCPUThrottling();

  } catch (e) {
    console.error("Error detecting CPU:", e);
  }

  // Tentukan level konkurensi berdasarkan cores dan platform
  let concurrencyLevel = Math.max(1, Math.floor(logicalCores / 2));
  if (isLowEnd || throttled) {
    concurrencyLevel = 1; // Batasi worker untuk CPU low-end atau throttled
  } else if (isHighEnd && !throttled) {
    concurrencyLevel = Math.max(2, Math.floor(logicalCores * 0.75)); // Gunakan lebih banyak worker untuk CPU high-end
  }

  return {
    cores,
    logicalCores, 
    architecture,
    isLowEnd,
    isHighEnd,
    platform,
    concurrencyLevel,
    supportsSIMD,
    throttled
  };
}

/**
 * Microbenchmark sederhana untuk mendeteksi throttling CPU
 * Mengembalikan true jika CPU terdeteksi throttled
 */
function detectCPUThrottling(): boolean {
  const testIterations = 1000000;
  const numTests = 3;
  const throttleThreshold = 1.5; // Rasio waktu eksekusi yang menandakan throttling
  
  try {
    // Jalankan benchmark beberapa kali
    const times: number[] = [];
    
    // Fungsi benchmark sederhana - operasi CPU-intensif
    const runBenchmark = () => {
      const start = performance.now();
      let sum = 0;
      for (let i = 0; i < testIterations; i++) {
        sum += Math.sin(i) * Math.cos(i);
      }
      const end = performance.now();
      return end - start;
    };
    
    // Panaskan CPU
    runBenchmark(); 
    
    // Jalankan tes sesungguhnya
    for (let i = 0; i < numTests; i++) {
      times.push(runBenchmark());
    }
    
    // Analisis hasil
    times.sort((a, b) => a - b);
    const fastest = times[0];
    const slowest = times[times.length - 1];
    
    // Jika tes terlambat terlalu banyak dibandingkan dengan yang tercepat, 
    // CPU mungkin throttled
    return (slowest / fastest) > throttleThreshold;
    
  } catch (e) {
    console.error("Error during CPU throttling test:", e);
    return false;
  }
}

/**
 * Dapatkan parameter optimasi Three.js berdasarkan kapabilitas CPU
 */
export function getCPUOptimizedThreeParams(cpuInfo: CPUInfo) {
  const { isLowEnd, isHighEnd, throttled, concurrencyLevel, supportsSIMD } = cpuInfo;
  
  // Parameter dasar
  const params = {
    workerCount: concurrencyLevel,
    useOffscreenCanvas: !isLowEnd && typeof OffscreenCanvas !== "undefined",
    useSharedArrayBuffer: !isLowEnd && typeof SharedArrayBuffer !== "undefined",
    lowPowerMode: isLowEnd || throttled,
    asyncCompile: !isLowEnd,
    useWasm: !isLowEnd && supportsSIMD,
    updateInterval: isLowEnd ? 100 : throttled ? 50 : 0, // Batasi frekuensi update untuk CPU low-end
    maxPhysicsIterations: isLowEnd ? 1 : throttled ? 2 : 4,
    cullingInterval: isLowEnd ? 500 : throttled ? 250 : 100,
    maxFrameTimeMS: isLowEnd ? 20 : 33, // Batasi waktu eksekusi per frame
    useInstancing: !isLowEnd,
    batchGeometry: true,
  };
  
  // Optimasi tambahan untuk CPU high-end
  if (isHighEnd && !throttled) {
    params.maxPhysicsIterations = 6; // Lebih banyak iterasi fisika
    params.cullingInterval = 50; // Culling lebih sering
    params.maxFrameTimeMS = 16; // Target 60 FPS
  }
  
  return params;
}

/**
 * Dapatkan parameter optimasi level detail model 3D berdasarkan kapabilitas CPU
 */
export function getCPUOptimizedDetailLevels(cpuInfo: CPUInfo) {
  const { isLowEnd, isHighEnd, throttled } = cpuInfo;
  
  // Level detail dasar
  const detailLevels = {
    maxActiveObjects: isLowEnd ? 50 : throttled ? 100 : 200,
    maxParticleSystems: isLowEnd ? 1 : throttled ? 2 : 4,
    defaultSubdivision: isLowEnd ? 0 : throttled ? 1 : 2,
    animationFrameSkip: isLowEnd ? 2 : throttled ? 1 : 0,
    useLOD: !isLowEnd,
    frustumCullingAccuracy: isLowEnd ? "loose" : "accurate",
    maxBones: isLowEnd ? 24 : 64,
    maxSimultaneousAnimations: isLowEnd ? 2 : throttled ? 4 : 8,
    minUpdateDistance: isLowEnd ? 5 : throttled ? 2 : 0,
  };
  
  // Pengaturan tambahan untuk CPU high-end
  if (isHighEnd && !throttled) {
    detailLevels.maxActiveObjects = 500;
    detailLevels.maxParticleSystems = 8;
    detailLevels.defaultSubdivision = 3;
    detailLevels.maxBones = 128;
    detailLevels.maxSimultaneousAnimations = 12;
  }
  
  return detailLevels;
}

/**
 * Gabungkan rekomendasi GPU dan CPU untuk mendapatkan pengaturan optimal
 */
export function getMergedOptimizationParams(
  cpuParams: ReturnType<typeof getCPUOptimizedThreeParams>,
  gpuParams: any
) {
  // Gabungkan parameter dengan memprioritaskan batasan yang lebih ketat
  return {
    ...gpuParams,
    ...cpuParams,
    precision: gpuParams.precision, // Prioritaskan pengaturan precision GPU
    maxFPS: Math.min(cpuParams.maxFrameTimeMS ? Math.floor(1000 / cpuParams.maxFrameTimeMS) : 60, gpuParams.maxFPS || 60),
    
    // Gabungkan parameter yang memerlukan konsiderasi keduanya
    useInstancing: cpuParams.useInstancing && gpuParams.useInstancing,
    batchGeometry: cpuParams.batchGeometry && gpuParams.batchGeometry,
    
    // Parameter yang paling mempengaruhi CPU
    cpuOptimized: {
      workerCount: cpuParams.workerCount,
      useOffscreenCanvas: cpuParams.useOffscreenCanvas,
      useSharedArrayBuffer: cpuParams.useSharedArrayBuffer,
      asyncCompile: cpuParams.asyncCompile,
      useWasm: cpuParams.useWasm,
      updateInterval: cpuParams.updateInterval,
      maxPhysicsIterations: cpuParams.maxPhysicsIterations,
      cullingInterval: cpuParams.cullingInterval,
      maxFrameTimeMS: cpuParams.maxFrameTimeMS,
    },
    
    // Parameter yang paling mempengaruhi GPU
    gpuOptimized: {
      precision: gpuParams.precision,
      logarithmicDepthBuffer: gpuParams.logarithmicDepthBuffer,
      maxLights: gpuParams.maxLights,
      shadowMapSize: gpuParams.shadowMapSize,
      anisotropy: gpuParams.anisotropy,
    }
  };
}

/**
 * Gabungkan level detail model berdasarkan kapabilitas GPU dan CPU
 */
export function getMergedDetailLevels(
  cpuDetailLevels: ReturnType<typeof getCPUOptimizedDetailLevels>,
  gpuDetailLevels: any
) {
  return {
    // Gabungkan nilai dengan memilih yang lebih rendah/konservatif
    sphereSegments: Math.min(cpuDetailLevels.defaultSubdivision * 8 + 8, gpuDetailLevels.sphereSegments),
    torusSegments: Math.min(cpuDetailLevels.defaultSubdivision * 4 + 4, gpuDetailLevels.torusSegments),
    particleCount: Math.min(cpuDetailLevels.maxParticleSystems * 50, gpuDetailLevels.particleCount),
    maxDrawCalls: Math.min(cpuDetailLevels.maxActiveObjects, gpuDetailLevels.maxDrawCalls),
    textureSize: gpuDetailLevels.textureSize, // Prioritaskan batasan GPU untuk tekstur
    
    // Level detail spesifik CPU
    maxActiveObjects: cpuDetailLevels.maxActiveObjects,
    maxParticleSystems: cpuDetailLevels.maxParticleSystems,
    defaultSubdivision: cpuDetailLevels.defaultSubdivision,
    animationFrameSkip: cpuDetailLevels.animationFrameSkip,
    useLOD: cpuDetailLevels.useLOD && gpuDetailLevels.useInstancing, // Aktifkan LOD hanya jika keduanya mendukung
    frustumCullingAccuracy: cpuDetailLevels.frustumCullingAccuracy,
    maxBones: cpuDetailLevels.maxBones,
    maxSimultaneousAnimations: cpuDetailLevels.maxSimultaneousAnimations,
    minUpdateDistance: cpuDetailLevels.minUpdateDistance,
    
    // Fitur lain dari pengaturan GPU
    useInstancing: gpuDetailLevels.useInstancing && cpuDetailLevels.useLOD,
  };
} 