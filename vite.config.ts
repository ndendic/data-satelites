import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: {
        'anchor': './src/anchor.ts',
        'persist': './src/persist.ts',
        'throttle': './src/throttle.ts',
        'Index': './src/Index.ts'
      },
      formats: ['es'],
      fileName: (format, entryName) => mode === 'production' 
        ? `${entryName}.min.js` 
        : `${entryName}.js`
    },
    outDir: mode === 'production' ? './dist/min' : './dist/src',
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production' ? true : false, // Remove console logs only in production
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.debug', 'console.info', 'console.warn'] : [],
        passes: 3, // More aggressive optimization passes
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_regexp: true,
        reduce_vars: true,
        collapse_vars: true,
        hoist_funs: true,
        hoist_vars: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true,
        sequences: true,
        conditionals: true,
        comparisons: true,
        booleans: true,
        loops: true,
        unused: true,
        toplevel: true
      },
      format: {
        comments: false,
        ascii_only: true,
        semicolons: false,
        beautify: false
      },
      mangle: {
        safari10: true,
        toplevel: true,
        eval: true,
        keep_fnames: false,
        reserved: []
      }
    },
    rollupOptions: {
      external: [],
      output: {
        preserveModules: false,
        compact: true,
        generatedCode: {
          constBindings: true,
          arrowFunctions: true
        }
      }
    },
    sourcemap: false,
    emptyOutDir: true,
    reportCompressedSize: true
  },
  esbuild: {
    target: 'es2020',
    format: 'esm',
    legalComments: 'none',
    treeShaking: true
  }
}))
