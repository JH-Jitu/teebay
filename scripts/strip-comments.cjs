#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { globby } = require("globby");
const strip = require("strip-comments");

async function run() {
  const patterns = [
    "app/**/*.ts",
    "app/**/*.tsx",
    "src/**/*.ts",
    "src/**/*.tsx",
  ];
  const files = await globby(patterns, { gitignore: true });

  for (const file of files) {
    const code = fs.readFileSync(file, "utf8");
    const ext = path.extname(file).slice(1);
    const lang = ext === "tsx" ? "ts" : ext;
    const stripped = strip(code, { language: lang });
    if (stripped !== code) {
      fs.writeFileSync(file, stripped, "utf8");
      console.log("Stripped comments:", file);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
