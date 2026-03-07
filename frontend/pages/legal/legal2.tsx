// app/legal/page.tsx
// or pages/legal.tsx

import SmsPreview from 'components/legal/smscomp';

const smsExamples = [
  {
    title: 'Example 1 — Work Order Creation & Acceptance',
    messages: [
      {
        id: '1',
        type: 'incoming' as const,
        time: '9:41 AM',
        text:
          'Cutting Corners Gems: Your service request [id] has been submitted successfully.\n\n' +
          'You will receive notifications as your request moves through the work order process.\n\n' +
          'Reply STOP to opt out. Reply HELP for help.',
      },
      {
        id: '2',
        type: 'incoming' as const,
        time: '10:05 AM',
        text:
          'Cutting Corners Gems: Work order [id] for [gem] - [service] has been created.\n\n' +
          'Please review the details and accept the work order before sending your gemstone:\n' +
          'or Reply ACCEPT to accept workorder conditions:\n' +
          '[link]\n\n' +
          'Reply STOP to opt out. Reply HELP for help.',
      },
      {
        id: '3',
        type: 'outgoing' as const,
        time: '10:07 AM',
        text: 'ACCEPTED',
      },
      {
        id: '4',
        type: 'incoming' as const,
        time: '10:07 AM',
        text:
          'Cutting Corners Gems: You accepted work order [id] for [gem] - [service].\n\n' +
          'We will notify you as your work order progresses.\n\n' +
          'Reply STOP to opt out. Reply HELP for help.',
      },
    ],
  },
  {
    title: 'Example 2 — Completion & Shipping',
    messages: [
      {
        id: '1',
        type: 'incoming' as const,
        time: '1:14 PM',
        text:
          'Cutting Corners Gems: Your gemstone for work order [id] ([gem] - [service]) has been received and logged into our system.\n\n' +
          'Processing will begin shortly.\n\n' +
          'Reply STOP to opt out. Reply HELP for help.',
      },
      {
        id: '2',
        type: 'incoming' as const,
        time: '4:26 PM',
        text:
          'Cutting Corners Gems: Work order [id] for [gem] - [service] is complete.\n\n' +
          'View your invoice, notes, photos, and payment options:\n' +
          '[link]\n\n' +
          'Reply STOP to opt out. Reply HELP for help.',
      },
      {
        id: '3',
        type: 'incoming' as const,
        time: '5:42 PM',
        text:
          'Cutting Corners Gems: Your gemstone for work order [id] ([gem] - [service]) has shipped.\n\n' +
          'Track your package here:\n' +
          '[link]\n\n' +
          'Reply STOP to opt out. Reply HELP for help.',
      },
    ],
  },
];

export default function LegalPage() {
  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
      <h1
        style={{
          fontFamily: "'Oranienbaum', serif",
          fontSize: '38px',
          fontWeight: 400,
          color: '#FAFAFA',
          marginBottom: '12px',
        }}
      >
        SMS Notification Examples
      </h1>

      <p
        style={{
          fontFamily: "'Comfortaa', sans-serif",
          fontSize: '14px',
          lineHeight: 1.8,
          color: 'rgba(255,255,255,0.60)',
          marginBottom: '32px',
          maxWidth: '720px',
        }}
      >
        These examples illustrate the types of transactional SMS notifications customers may receive
        after opting in to text notifications from Cutting Corners Gems.
      </p>

      <SmsPreview examples={smsExamples} />
    </main>
  );
}