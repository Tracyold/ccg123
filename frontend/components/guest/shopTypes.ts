import React from 'react';

export interface Product {
  product_id: string;
  title: string;
  description: string | null;
  total_price: number;
  price_per_carat: number | null;
  gem_type: string | null;
  shape: string | null;
  weight: number | null;
  color: string | null;
  origin: string | null;
  treatment: string | null;
  gia_report_number: string | null;
  gia_report_pdf_url: string | null;
  photo_url: string | null;
  product_state: string;
}

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface AdminInfo {
  business_name: string | null;
  full_name: string | null;
  address: string | null;
  phone: string | null;
  contact_email: string | null;
}

export const popupOverlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 200,
  backgroundColor: 'rgba(0,0,0,0.85)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '20px',
};
export const popupBoxStyle: React.CSSProperties = {
  backgroundColor: '#0A0A0A',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '16px',
  width: '100%', maxWidth: '480px', maxHeight: '90vh',
  overflowY: 'auto', padding: '32px',
};
export const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  padding: '10px 12px',
  color: '#FAFAFA',
  fontFamily: "'Comfortaa', sans-serif",
  fontSize: '13px',
  outline: 'none',
  marginBottom: '10px',
};
export const labelStyle: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
  fontSize: '9px', fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'rgba(255,255,255,0.38)',
  display: 'block', marginBottom: '5px',
};
export const goldBtnStyle: React.CSSProperties = {
  width: '100%', textAlign: 'center',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: '11px', fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.20em',
  backgroundColor: '#d4af37', color: '#050505',
  border: 'none', padding: '14px 24px',
  cursor: 'pointer',
};
export const ghostBtnStyle: React.CSSProperties = {
  width: '100%', textAlign: 'center',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: '10px', fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  backgroundColor: 'transparent',
  color: 'rgba(255,255,255,0.38)',
  border: 'none', cursor: 'pointer',
  padding: '10px 0', marginTop: '8px',
};
