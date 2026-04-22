import fs from "fs";

async function run() {
  const invoiceId = "YOUR_INVOICE_ID_HERE";

  const res = await fetch("http://localhost:3000/api/export/invoice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_id: invoiceId,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("API Error:", error);
    return;
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  console.log("Status:", res.status);
  console.log("PDF size (bytes):", buffer.length);

  if (buffer.length < 1000) {
    console.warn("Warning: PDF looks too small — likely empty or broken render");
  }

  fs.writeFileSync(`invoice-${invoiceId}.pdf`, buffer);

  console.log("PDF saved successfully");
}

run();