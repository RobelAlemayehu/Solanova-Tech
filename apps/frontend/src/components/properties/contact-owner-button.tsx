'use client';

import React from 'react';

interface ContactOwnerButtonProps {
  ownerEmail: string;
  propertyTitle: string;
}

export default function ContactOwnerButton({ ownerEmail, propertyTitle }: ContactOwnerButtonProps) {
  const subject = encodeURIComponent(`Inquiry about: ${propertyTitle}`);
  const body = encodeURIComponent(
    `Hi,\n\nI am interested in your property "${propertyTitle}" listed on PropList.\n\nPlease let me know if it is still available.\n\nThank you.`,
  );
  const mailtoHref = `mailto:${ownerEmail}?subject=${subject}&body=${body}`;

  return (
    <a
      href={mailtoHref}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '1rem',
        padding: '0.625rem 1.25rem',
        borderRadius: '0.625rem',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff',
        fontSize: '0.875rem',
        fontWeight: 600,
        textDecoration: 'none',
        transition: 'opacity 0.15s ease',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
      Contact Owner
    </a>
  );
}
