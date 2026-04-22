export function normalizeInvoice(invoice: any) {
  const item = invoice.line_items?.[0] || {};

  return {
    invoice_id: invoice.invoice_id,

    customer: {
      name: invoice.account_snapshot?.name || '',
      email: invoice.account_snapshot?.email || '',
      phone: invoice.account_snapshot?.phone || '',
      address: invoice.account_snapshot?.shippingAddress || '',
    },

    sender: {
      business_name: invoice.admin_snapshot?.business_name || 'Business',
      address: invoice.admin_snapshot?.address || '',
    },

    product: {
      product_id: item.product_id || '',
      qty: item.qty || 1,

      gem_type: item.gem_type || null,
      color: item.color || null,
      shape: item.shape || null,
      measurements: item.measurements || null,
      gia_report_number: item.gia_report_number || null,

      price: item.total_price || 0,
      price_per_carat: item.price_per_carat || null,
    },

    totals: {
      subtotal: invoice.total_amount || 0,
      tax: invoice.tax || 0,
      shipping: invoice.shipping || 0,
      total: invoice.total_amount || 0,
    }
  };
}