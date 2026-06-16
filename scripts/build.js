/**
 * @Description   构建发布目录
 * @Author        Alex_McAvoy
 * @Date          2026-06-17
 *
 * 构建命令：npm run build
 * 
 * 构建产物
 * 1. dist/resources/css/bookshelf.min.css
 * 2. dist/resources/js/bookshelf.min.js
 * 3. dist/resources/js/jquery-3.6.0.min.js
 * 4. dist/resources/json、dist/resources/images/common、dist/resources/images/webp
 */
const fs = require("fs");
const path = require("path");
const CleanCSS = require("clean-css");
const { minify: minifyJs } = require("terser");
const JavaScriptObfuscator = require("javascript-obfuscator");
const { minify: minifyHtml } = require("html-minifier-terser");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const cssFiles = [
  "base.css",
  "bookCollection.css",
  "book.css",
  "option.css",
  "bookSwitch.css"
];

const jsFiles = [
  "bookUtils.js",
  "button.js",
  "count.js"
];

function ensureDir(dirPath) {
  /**
   * @Description 确保目录存在
   * @param {string} dirPath 目录路径
   */
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(sourceDir, targetDir) {
  /**
   * @Description 递归复制目录
   * @param {string} sourceDir 源目录
   * @param {string} targetDir 目标目录
   */
  fs.cpSync(sourceDir, targetDir, { recursive: true });
}

function readUtf8(filePath) {
  /**
   * @Description 读取 UTF-8 文本文件
   * @param {string} filePath 文件路径
   * @returns {string} 文件内容
   */
  return fs.readFileSync(filePath, "utf8");
}

function writeUtf8(filePath, content) {
  /**
   * @Description 写入 UTF-8 文本文件
   * @param {string} filePath 文件路径
   * @param {string} content 文件内容
   */
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

function cleanDist() {
  /**
   * @Description 清空并重建 dist 目录
   */
  fs.rmSync(distDir, { recursive: true, force: true });
  ensureDir(distDir);
}

function copyStaticAssets() {
  /**
   * @Description 复制发布时需要保留的静态资源
   */
  copyDir(
    path.join(rootDir, "resources", "images", "common"),
    path.join(distDir, "resources", "images", "common")
  );
  copyDir(
    path.join(rootDir, "resources", "images", "webp"),
    path.join(distDir, "resources", "images", "webp")
  );
  ensureDir(path.join(distDir, "resources", "js"));
  fs.copyFileSync(
    path.join(rootDir, "resources", "js", "jquery-3.6.0.min.js"),
    path.join(distDir, "resources", "js", "jquery-3.6.0.min.js")
  );
}

function buildJson() {
  /**
   * @Description 压缩并输出 JSON 数据文件
   */
  const sourceDir = path.join(rootDir, "resources", "json");
  const targetDir = path.join(distDir, "resources", "json");
  ensureDir(targetDir);

  const jsonFiles = fs.readdirSync(sourceDir)
    .filter(file => file.endsWith(".json"))
    .sort();

  for (const file of jsonFiles) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    const data = JSON.parse(readUtf8(sourcePath));
    writeUtf8(targetPath, JSON.stringify(data));
  }
}

function buildCss() {
  /**
   * @Description 按页面原始顺序合并并压缩 CSS
   */
  const source = cssFiles
    .map(file => readUtf8(path.join(rootDir, "resources", "css", file)))
    .join("\n");

  const output = new CleanCSS({ level: 2 }).minify(source);
  if (output.errors.length > 0) {
    throw new Error(output.errors.join("\n"));
  }

  writeUtf8(
    path.join(distDir, "resources", "css", "bookshelf.min.css"),
    output.styles
  );
}

async function buildJs() {
  /**
   * @Description 按依赖顺序合并、压缩并保守混淆项目 JS
   */
  const source = jsFiles
    .map(file => readUtf8(path.join(rootDir, "resources", "js", file)))
    .join("\n;\n");

  const minified = await minifyJs(source, {
    compress: true,
    mangle: true,
    format: {
      comments: false
    }
  });

  if (minified.error) {
    throw minified.error;
  }

  const obfuscated = JavaScriptObfuscator.obfuscate(minified.code, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    renameGlobals: false,
    stringArray: true,
    stringArrayThreshold: 0.35
  });

  writeUtf8(
    path.join(distDir, "resources", "js", "bookshelf.min.js"),
    obfuscated.getObfuscatedCode()
  );
}

async function buildHtml() {
  /**
   * @Description 改写资源引用并压缩 HTML
   */
  let html = readUtf8(path.join(rootDir, "index.html"));

  // 用合并后的 CSS 替换原来的多个样式文件
  html = html.replace(
    /\s*<link rel="stylesheet" href="\.\/resources\/css\/(?:base|bookCollection|book|option|bookSwitch)\.css">/g,
    ""
  );
  html = html.replace(
    /(<link href="\.\/resources\/images\/common\/favicon\.png" rel="shortcut icon">)/,
    '<link rel="stylesheet" href="./resources/css/bookshelf.min.css">\n    $1'
  );

  // jQuery 保持单独引用，其余项目 JS 替换为 bookshelf.min.js
  html = html.replace(
    /\s*<script src="\.\/resources\/js\/(?:markdown|bookUtils|button|count)\.js" charset="UTF-8"><\/script>/g,
    ""
  );
  html = html.replace(
    /(<script src="\.\/resources\/js\/jquery-3\.6\.0\.min\.js" charset="UTF-8"><\/script>)/,
    '$1\n    <script src="./resources/js/bookshelf.min.js" charset="UTF-8"></script>'
  );

  const minified = await minifyHtml(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
  });

  writeUtf8(path.join(distDir, "index.html"), minified);
}

async function main() {
  /**
   * @Description 执行完整构建流程
   */
  cleanDist();
  copyStaticAssets();
  buildJson();
  buildCss();
  await buildJs();
  await buildHtml();

  console.log("Build complete: dist");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});