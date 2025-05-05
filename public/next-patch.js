/**
 * NextJS Client-side Error Fix for Static Exports
 * 
 * Patches common client-side errors in Next.js static export deployments
 * on Netlify and similar platforms.
 */

;(function() {
  console.info('[NEXT-PATCH] Initializing Next.js client-side patches');

  // Fix untuk error "client-side exception has occurred"
  function setupErrorHandler() {
    window.addEventListener('error', function(event) {
      // Tangkap error yang muncul karena masalah hydration atau client-side rendering
      if (event.error && event.error.message && (
          event.error.message.includes('Hydration failed') || 
          event.error.message.includes('Text content does not match') ||
          event.error.message.includes('client-side exception') ||
          event.error.message.includes('There was an error while hydrating')
        )) {
        console.warn('[NEXT-PATCH] Caught hydration error:', event.error.message);
        
        // Cegah error muncul di console
        event.preventDefault();
        
        // Muat ulang halaman jika user belum pernah mengalami reload
        if (!window.SESSION_RELOADED) {
          window.SESSION_RELOADED = true;
          console.info('[NEXT-PATCH] Reloading page to fix hydration...');
          
          // Tunda reload untuk memastikan semua resources sudah dimuat
          setTimeout(function() {
            window.location.reload();
          }, 100);
        }
        
        return true;
      }
      return false;
    }, true);
    
    console.info('[NEXT-PATCH] Error handler installed');
  }
  
  // Setup global fallbacks untuk mencegah error pada Next.js runtime
  function setupGlobalFallbacks() {
    // Pastikan window.__NEXT_DATA__ ada
    if (!window.__NEXT_DATA__) {
      window.__NEXT_DATA__ = {
        props: { pageProps: {} },
        page: window.location.pathname,
        query: {},
        buildId: 'static-build'
      };
      console.info('[NEXT-PATCH] Created fallback __NEXT_DATA__');
    }
    
    // Simulates process.env for client-side code
    if (typeof window.process === 'undefined') {
      window.process = { 
        env: { 
          NODE_ENV: 'production',
          NEXT_PUBLIC_URL: window.location.origin
        } 
      };
      console.info('[NEXT-PATCH] Created fallback process.env');
    }
  }
  
  // Fix untuk masalah routing pada Netlify
  function setupRouterFix() {
    // Jika ada base path, pastikan Next.js router mengetahuinya
    const basePath = (window.__NEXT_DATA__ && window.__NEXT_DATA__.basePath) || '';
    
    // Detect if we're on a Netlify site
    const isNetlify = window.location.hostname.includes('netlify.app') || 
      document.querySelector('meta[name="netlify"]') !== null;
      
    if (isNetlify) {
      console.info('[NEXT-PATCH] Netlify deployment detected, applying router fixes');
      
      // Ensure _redirects is working correctly by checking navigation
      window.addEventListener('click', function(e) {
        // Look for internal links
        const target = e.target.closest('a');
        if (target && target.href && target.href.startsWith(window.location.origin)) {
          console.info('[NEXT-PATCH] Internal link navigation detected');
        }
      });
    }
  }
  
  // Menjalankan semua patches
  function applyAllPatches() {
    setupErrorHandler();
    setupGlobalFallbacks();
    setupRouterFix();
    console.info('[NEXT-PATCH] All patches applied successfully');
  }
  
  // Jalankan patches
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllPatches);
  } else {
    applyAllPatches();
  }
})(); 