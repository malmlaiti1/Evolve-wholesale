import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Service-role / server-only fence: client components must never import
    // server-only modules (the service-role Supabase client, env, etc.).
    // Type-only imports are allowed (erased at build).
    // New client UI should live in components/ (covered by the glob) or, if it
    // must live under app/, be added to the explicit list below.
    files: [
      "components/**/*.{ts,tsx}",
      "hooks/**/*.{ts,tsx}",
      "app/(customer)/cart/page.tsx",
      "app/(customer)/checkout/page.tsx",
      "app/(customer)/orders/page.tsx",
      "app/(customer)/error.tsx",
      "app/(admin)/admin/error.tsx",
    ],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/supabase/admin",
                "@/lib/supabase/server",
                "@/lib/env",
                "@/lib/admin/*",
                "@/lib/email/*",
                "server-only",
              ],
              allowTypeImports: true,
              message:
                "Server-only module — never import into a client component. Pass data via props from a Server Component.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
