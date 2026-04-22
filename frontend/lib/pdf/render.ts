import { chromium } from "playwright";

export async function renderPDF(html: string) {
  const browser = await chromium.launch();

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle",
  });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdf;
}