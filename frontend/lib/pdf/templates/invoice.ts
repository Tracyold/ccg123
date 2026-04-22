import { label } from "../labels";

function exists(v: any) {
  return v !== null && v !== undefined && v !== '';
}

export function invoiceTemplate(data: any) {
  const { customer, sender, product, totals } = data;

  const fields = Object.entries(product)
    .filter(([k, v]) => k !== "product_id" && k !== "qty" && exists(v));

  return `
<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: Arial; padding: 40px; }
.header { display:flex; justify-content:space-between; }
.section { display:flex; justify-content:space-between; margin-top:20px; }
.box { width:48%; }
table { width:100%; border-collapse:collapse; margin-top:20px; }
th, td { border-bottom:1px solid #ddd; padding:8px; text-align:left; }
.paid {
  position:absolute;
  top:120px;
  right:80px;
  transform:rotate(-20deg);
  font-size:40px;
  color:green;
  opacity:0.3;
  border:3px solid green;
  padding:10px;
}
.footer { font-size:10px; margin-top:50px; color:#666; }
</style>
</head>

<body>

<div class="paid">PAID</div>

<div class="header">
  <h2>${sender.business_name}</h2>
  <div>Invoice #${data.invoice_id}</div>
</div>

<div class="section">
  <div class="box">
    <strong>Sender</strong><br/>
    ${sender.address}
  </div>

  <div class="box">
    <strong>Customer</strong><br/>
    ${customer.name}<br/>
    ${customer.email}<br/>
    ${customer.phone}<br/>
    ${customer.address}
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Product ID</th>
      <th>Qty</th>
      ${fields.map(([k]) => `<th>${label("product", k)}</th>`).join('')}
      <th>Total Price</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>${product.product_id}</td>
      <td>${product.qty}</td>

      ${fields.map(([_, v]) => `<td>${v}</td>`).join('')}

      <td>${product.price}</td>
    </tr>
  </tbody>
</table>

<div style="text-align:right; margin-top:20px;">
  <p>Subtotal: ${totals.subtotal}</p>
  <p>Tax: ${totals.tax}</p>
  <p>Shipping: ${totals.shipping}</p>
  <h3>Total: ${totals.total}</h3>
</div>

<div class="footer">
  <p>Return Policy: All sales are final unless stated otherwise.</p>
  <p>Purchase Policy: By purchasing you agree to our terms.</p>
  <p>Disclaimer: Gem data may vary slightly upon inspection.</p>
</div>

</body>
</html>
`;
}