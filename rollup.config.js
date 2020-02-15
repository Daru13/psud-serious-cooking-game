import copy from "rollup-plugin-copy";
import typescript from "rollup-plugin-typescript2"
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json"

export default {
  input: "src/ts/main.ts",
  
  output: [
    {
      file: "build/js/main.min.js",
      format: "umd",
      globals: {},
      plugins: [terser()]
    }
  ],

  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],

  plugins: [
    typescript({
      typescript: require("typescript"),
      objectHashIgnoreUnknownHack: true
    }),
    copy({
      targets: [
        {src: "src/html/*", dest: "build/html"},
        {src: "src/css/*", dest: "build/css"},
        {src: "src/js/*", dest: "build/js"},
      ]
    })
  ]
}

