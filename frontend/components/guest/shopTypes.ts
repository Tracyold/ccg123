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
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  width: '100%', maxWidth: '480px', maxHeight: '90vh',
  overflowY: 'auto', padding: '32px',
};
export const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  padding: '10px 12px',
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  outline: 'none',
  marginBottom: '10px',
};
export const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'rgba(214,180,70,0.55)';
  e.target.style.boxShadow = '0 0 10px rgba(214,180,70,0.15)';
};
export const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'var(--border)';
  e.target.style.boxShadow = 'none';
};

export const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '9px', fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'var(--text-muted)',
  display: 'block', marginBottom: '5px',
};
export const goldBtnStyle: React.CSSProperties = {
  width: '100%', textAlign: 'center',
  fontFamily: 'var(--font-ui)',
  fontSize: '11px', fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.3em',
  background: 'transparent',
  color: 'var(--gold)',
  border: '1px solid rgba(214,180,70,0.9)',
  padding: '14px 24px',
  marginTop: '16px',
  cursor: 'pointer',
  boxShadow: '0 0 14px rgba(214,180,70,0.35)',
};
export const ghostBtnStyle: React.CSSProperties = {
  width: '100%', textAlign: 'center',
  fontFamily: 'var(--font-ui)',
  fontSize: '10px', fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  backgroundColor: 'transparent',
  color: 'var(--text-muted)',
  border: 'none', cursor: 'pointer',
  padding: '12px 0', marginTop: '12px',
};
