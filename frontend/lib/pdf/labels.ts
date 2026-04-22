export const labels = {
  product: {
    product_id: "Product ID",
    qty: "Qty",
    gem_type: "Gem Type",
    color: "Color",
    shape: "Shape",
    measurements: "Measurements",
    gia_report_number: "GIA Report",
    price: "Price",
    price_per_carat: "Price / Carat",
  }
};

export function label(section: keyof typeof labels, key: string) {
  return (labels as any)?.[section]?.[key] || key;
}