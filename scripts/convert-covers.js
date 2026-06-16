/**
 * @Description   将书籍封面原图转换为 WebP 缩略图
 * @Author        Alex_McAvoy
 * @Date          2026-06-17
 *
 * 脚本调用：npm run covert:covers
 * 
 * 脚本约定
 * 1. 原始封面保留在 resources/images/books 目录中
 * 2. 转换后的 WebP 文件输出到 resources/images/webp 目录中
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const rootDir = path.resolve(__dirname, "..");
const originalDir = path.join(rootDir, "resources", "images", "books");
const webpDir = path.join(rootDir, "resources", "images", "webp");

// 书籍卡片封面大小
const WEBP_WIDTH = 420;
const WEBP_QUALITY = 82;
const COVER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function getOriginalCovers() {
  /**
   * @Description 获取 books 目录下所有需要转换的原始封面
   * @returns {Array<string>} 原始封面文件名列表
   */
  return fs.readdirSync(originalDir)
    .filter(fileName => {
      const ext = path.extname(fileName).toLowerCase();
      return COVER_EXTENSIONS.has(ext);
    })
    .sort();
}

async function convertCover(inputPath, outputPath) {
  /**
   * @Description 将单张封面转换为 WebP 文件
   * @param {string} inputPath 原始封面路径
   * @param {string} outputPath WebP 输出路径
   */
  await sharp(inputPath)
    // 根据图片元数据自动修正方向，再进行缩放
    .rotate()
    .resize({ width: WEBP_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);
}

async function main() {
  /**
   * @Description 批量转换 books 目录下的所有封面图片
   */
  fs.mkdirSync(webpDir, { recursive: true });

  const covers = getOriginalCovers();
  let convertedCount = 0;

  for (const coverFileName of covers) {
    const inputPath = path.join(originalDir, coverFileName);
    const outputFileName = `${path.basename(coverFileName, path.extname(coverFileName))}.webp`;
    const outputPath = path.join(webpDir, outputFileName);

    await convertCover(inputPath, outputPath);
    convertedCount++;
  }

  console.log(`Converted covers: ${convertedCount}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});