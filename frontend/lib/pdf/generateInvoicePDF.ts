import { createServiceClient } from "@/lib/supabase";
import { normalizeInvoice } from "./normalizer";
import { invoiceTemplate } from "./templates/invoice";
import { renderPDF } from "./render";

export async function generateInvoicePDF(invoice_id: string) {
  const supabase = createServiceClient();

  // 1. FETCH
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("invoice_id", invoice_id)
    .single();

  if (error || !invoice) {
    throw new Error("Invoice not found");
  }

  // 2. NORMALIZE
  const normalized = normalizeInvoice(invoice);

  // 3. RENDER HTML
  const html = invoiceTemplate(normalized);

  // 4. CONVERT TO PDF
  const pdf = await renderPDF(html);

  return pdf;
}