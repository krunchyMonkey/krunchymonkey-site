import js from "@eslint/js";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";

const modules = [
  "src/components/PixelIcon",
  "src/apps",
  "src/shell/model",
  "src/features/workbench",
  "src/features/open-bench",
  "src/features/pixel-study",
  "src/vendor/8bitcn",
  "src/vendor/shadcn",
];
const unitDirs = ["src/app", "src/main.tsx", "src/shell/desktop", "src/shell/mobile", ...modules];

const layerZones = [
  {
    target: "src/components",
    from: ["src/app", "src/shell", "src/features", "src/apps", "src/main.tsx"],
  },
  { target: "src/features", from: ["src/app", "src/shell", "src/main.tsx"] },
  { target: "src/shell", from: ["src/app", "src/main.tsx"] },
  { target: "src/app", from: ["src/main.tsx"] },
  { target: "src/apps", from: ["src/app", "src/shell", "src/features", "src/main.tsx"] },
  { target: "src/vendor", from: ["src/app", "src/shell", "src/features", "src/main.tsx"] },
].map((zone) => ({
  ...zone,
  message:
    "Layering is main -> app -> shell -> features -> apps/vendor -> components; lower layers must not import higher ones.",
}));

const barrelZones = modules.map((dir) => ({
  target: unitDirs.filter((other) => other !== dir),
  from: dir,
  except: ["./index.ts"],
  message: "Import across module boundaries through the module barrel (index.ts).",
}));

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { "import-x": importX },
    settings: {
      "import-x/extensions": [".ts", ".tsx", ".js"],
      "import-x/resolver-next": [createTypeScriptImportResolver({ project: "./tsconfig.json" })],
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "import-x/no-cycle": "error",
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      "import-x/no-restricted-paths": [
        "error",
        {
          basePath: import.meta.dirname,
          zones: [...layerZones, ...barrelZones],
        },
      ],
    },
  },
);
