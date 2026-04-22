import type { NextApiRequest, NextApiResponse } from "next";
import { generateInvoicePDF } from "@/lib/pdf/generateInvoicePDF";

type InvoiceRequestBody = {
  invoice_id: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Enforce correct HTTP method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. Validate input shape (minimal guard)
    const { invoice_id } = req.body as InvoiceRequestBody;

    if (!invoice_id) {
      return res.status(400).json({ error: "invoice_id is required" });
    }

    // 3. Generate PDF via service layer (no business logic here)
    const pdf = await generateInvoicePDF(invoice_id);

    if (!pdf) {
      return res.status(500).json({ error: "PDF generation failed" });
    }

    // 4. Set correct response headers for binary PDF output
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="invoice-${invoice_id}.pdf"`);

    // 5. Return PDF buffer
    return res.send(pdf);
  } catch (err: any) {
    // 6. Safe error response (no internal leakage in production)
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}