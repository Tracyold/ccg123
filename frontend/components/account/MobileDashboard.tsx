import { useState } from 'react'
import SmsConsentModal from './SmsConsentModal'
import { relativeTime, formatMoney } from '../../lib/utils'

/* ── SMS toggle definitions ─────────────────────────────────────── */
const smToggles = [
  { label: 'Work Order Updates', col: 'opt_in_work_orders', desc: 'Status updates while your stone is with us' },
  { label: 'Chat Alerts',        col: 'opt_in_chat',        desc: 'Alerts when you have a new message' },
  { label: 'Tracking Updates',   col: 'opt_in_tracking',    desc: 'Shipping and delivery notifications' },
  { label: 'New Gem Listings',   col: 'opt_in_new_listings',desc: 'Notify when new gems are listed' },
  { label: 'Purchases',          col: 'opt_in_purchases',   desc: 'Confirmations when a purchase completes' },
]

/* ── PillToggle ─────────────────────────────────────────────────── */
function PillToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={e => { e.stopPropagation(); onChange(!checked) }}
      style={{
        width: 44, height: 24, borderRadius: 999, border: 'none',
        cursor: 'pointer', position: 'relative', flexShrink: 0,
        background: checked ? 'var(--accent)' : 'var(--border)',
        transition: 'background 200ms ease', outline: 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 2,
        left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: 999,
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        transition: 'left 200ms ease', display: 'block',
      }} />
    </button>
  )
}

/* ── Tile base ──────────────────────────────────────────────────── */
interface TileProps {
  color: string
  lit?: boolean
  wide?: boolean
  style?: React.CSSProperties
  onClick?: () => void
  children: React.ReactNode
}

function Tile({ color, lit, wide, style, onClick, children }: TileProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `0.5px solid ${lit && hovered ? color : lit ? `color-mix(in srgb, ${color} 35%, var(--border-subtle, var(--border)))` : 'var(--border)'}`,
        padding: wide ? '18px 17px' : '18px 16px',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 280ms ease, transform 200ms ease',
        transform: hovered && onClick ? 'translateY(-1px)' : 'none',
        display: wide ? 'flex' : 'flex',
        flexDirection: wide ? 'row' : 'column',
        alignItems: wide ? 'center' : 'flex-start',
        gap: wide ? 16 : 0,
        minHeight: wide ? 96 : 140,
        opacity: lit ? 1 : 0.6,
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {/* top color edge — only when lit */}
      {lit && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: color,
        }} />
      )}
      {/* pulse dot — only when lit */}
      {lit && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 7, height: 7, borderRadius: '50%',
          background: color,
          animation: 'mbPulse 2.4s ease-in-out infinite',
        }} />
      )}
      {children}
      {/* arrow */}
      {onClick && (
        <div style={{
          position: 'absolute', bottom: 11, right: 13,
          fontSize: '0.6875rem', color: lit ? color : 'var(--text-muted)',
          opacity: lit ? 0.65 : 0.3,
          transition: 'transform 180ms ease',
          transform: hovered ? 'translateX(2px)' : 'none',
        }}>→</div>
      )}
    </div>
  )
}

/* ── Small label + main text helpers ───────────────────────────── */
function TLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.5312rem',
      letterSpacing: '0.24em', textTransform: 'uppercase',
      color: 'var(--text-muted)', marginBottom: 5,
    }}>{children}</div>
  )
}

function TMain({ children, color, lit }: { children: React.ReactNode; color?: string; lit?: boolean }) {
  return (
    <div style={{
      fontFamily: 'var(--font-display)', fontSize: '1.0rem',
      lineHeight: 1.3, fontWeight: 400, letterSpacing: '0.02em',
      color: lit && color ? color : 'var(--text)',
      transition: 'color 280ms ease',
    }}>{children}</div>
  )
}

function TSub({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-ui)', fontSize: '0.6562rem',
      color: 'var(--text-muted)', marginTop: 5,
      lineHeight: 1.5, letterSpacing: '0.03em',
    }}>{children}</div>
  )
}

/* ── Score ring (feasibility) ───────────────────────────────────── */
function ScoreRing({ pct, color }: { pct: number; color: string }) {
  const r = 17, circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <div style={{ position: 'relative', width: 42, height: 42, flexShrink: 0, marginBottom: 8 }}>
      <svg width="42" height="42" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={r} fill="none" stroke="var(--border)" strokeWidth="2.5" />
        <circle cx="21" cy="21" r={r} fill="none" stroke={color} strokeWidth="2.5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 21 21)" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, color,
      }}>{pct}%</div>
    </div>
  )
}

/* ── Props ──────────────────────────────────────────────────────── */
interface Props {
  profile: any
  workOrders: any[]
  messages: any[]
  chatThread: any
  invoices: any[]
  invoiceTotal: number
  smsPrefs: any
  hasOpenWorkOrder: boolean
  latestWizardResult?: any
  onTabChange: (tab: string) => void
  openChatDrawer: () => void
  toggleSms: (col: string, val: boolean) => void
}

/* ── Main component ─────────────────────────────────────────────── */
export default function MobileDashboard({
  profile, workOrders, messages, chatThread, invoices, invoiceTotal,
  smsPrefs, hasOpenWorkOrder, latestWizardResult,
  onTabChange, openChatDrawer, toggleSms,
}: Props) {
  const [pendingToggle, setPendingToggle] = useState<{ label: string; col: string } | null>(null)

  /* ── notification states ── */
  const hasNewMsg      = !!chatThread?.account_has_unread
  const hasNewWO       = workOrders.some(w => w.status === 'CREATED')
  const hasUpdatedWO   = workOrders.some(w => w.status === 'ACCEPTED')
  const hasUnpaidInv   = invoices.some(inv => !inv.paid_at)
  const recentWO       = workOrders[0]
  const recentInv      = invoices[0]
  const unreadCount    = messages.filter(m => m.actor !== 'ACCOUNT').length
  const woLit          = hasNewWO || hasUpdatedWO
  const invLit         = hasUnpaidInv
  const wizPct         = latestWizardResult ? Math.round(latestWizardResult.feasibility_percent) : null

  /* ── tile colors ── */
  const C = {
    chat:    'var(--tile-chat,    #cfdd4e)',
    orders:  'var(--tile-orders,  #6ab0f5)',
    invoice: 'var(--tile-invoice, #c084fc)',
    feasib:  'var(--tile-feasib,  #4ec994)',
    sms:     'var(--tile-sms,     #fb923c)',
    est:     'var(--tile-est,     #e879f9)',
  }

  /* ── date greeting ── */
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.name?.split(' ')[0] || 'there'

  return (
    <>
      <style>{`
        @keyframes mbPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>

      {pendingToggle && (
        <SmsConsentModal
          toggle={pendingToggle}
          hasOpenWorkOrder={hasOpenWorkOrder}
          onConfirm={() => { toggleSms(pendingToggle.col, true); setPendingToggle(null) }}
          onCancel={() => setPendingToggle(null)}
        />
      )}

      <div style={{ padding: '22px 14px 110px' }}>

        {/* ── Welcome ── */}
        <div style={{ marginBottom: 26, paddingBottom: 22, borderBottom: '0.5px solid var(--border)' }}>
          <div style={{
            fontFamily: 'var(--font-sig)', fontSize: '2.0rem',
            fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.15, marginBottom: 5,
          }}>
            {greeting}, {firstName}.
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.5625rem',
            letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {(hasNewMsg || woLit || invLit) && (
              <span style={{ color: C.chat, marginLeft: 10 }}>
                · {[hasNewMsg, woLit, invLit].filter(Boolean).length} update{[hasNewMsg, woLit, invLit].filter(Boolean).length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* ── Tile grid ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Messages — full width */}
          <Tile color={C.chat} lit={hasNewMsg} wide onClick={openChatDrawer}>
            <div style={{ fontSize: '1.625rem', flexShrink: 0 }}>✉</div>
            <div style={{ flex: 1 }}>
              <TLabel>Messages</TLabel>
              <TMain color={C.chat} lit={hasNewMsg}>
                {hasNewMsg
                  ? <><strong>New</strong> message{unreadCount > 1 ? 's' : ''} waiting</>
                  : 'Chat with the shop'}
              </TMain>
              <TSub>
                {messages.length > 0
                  ? relativeTime(messages[messages.length - 1]?.created_at)
                  : 'No messages yet'}
              </TSub>
            </div>
          </Tile>

          {/* Work Orders + Invoices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Tile color={C.orders} lit={woLit} onClick={() => onTabChange('workorders')}>
              <div style={{ fontSize: '1.25rem', marginBottom: 10 }}>⚙</div>
              <TLabel>Work Order</TLabel>
              <TMain color={C.orders} lit={woLit}>
                {hasNewWO ? <><strong>New</strong> order</> : hasUpdatedWO ? <>Status <strong>updated</strong></> : recentWO ? recentWO.status : 'None active'}
              </TMain>
              {recentWO && <TSub>#{String(recentWO.work_order_id).slice(-4)} · {recentWO.status}</TSub>}
            </Tile>

            <Tile color={C.invoice} lit={invLit} onClick={() => onTabChange('invoices')}>
              <div style={{ fontSize: '1.25rem', marginBottom: 10 }}>◈</div>
              <TLabel>Invoices</TLabel>
              <TMain color={C.invoice} lit={invLit}>
                {invLit ? <>Payment <strong>due</strong></> : <><strong>{invoices.length}</strong> {invoices.length === 1 ? 'invoice' : 'invoices'}</>}
              </TMain>
              <TSub>{invoiceTotal > 0 ? formatMoney(invoiceTotal) + ' total' : 'No invoices'}</TSub>
            </Tile>
          </div>

          {/* Feasibility — full width if has result */}
          {latestWizardResult && wizPct !== null ? (
            <Tile color={C.feasib} lit wide onClick={() => onTabChange('wizard')}>
              <ScoreRing pct={wizPct} color={C.feasib} />
              <div style={{ flex: 1 }}>
                <TLabel>Feasibility Result</TLabel>
                <TMain color={C.feasib} lit>
                  <strong>{latestWizardResult.recommendation || 'See result'}</strong>
                </TMain>
                <TSub>
                  {[latestWizardResult.stone_variety, latestWizardResult.stone_species].filter(Boolean).join(' ')}
                  {latestWizardResult.weight_ct ? ` · ${latestWizardResult.weight_ct}ct` : ''}
                </TSub>
              </div>
            </Tile>
          ) : (
            <Tile color={C.feasib} wide onClick={() => onTabChange('wizard')}>
              <div style={{ fontSize: '1.375rem', flexShrink: 0 }}>◇</div>
              <div style={{ flex: 1 }}>
                <TLabel>Feasibility Wizard</TLabel>
                <TMain>No results yet</TMain>
                <TSub>Take the cut feasibility wizard</TSub>
              </div>
            </Tile>
          )}

          {/* Estimates + Profile */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Tile color={C.est} onClick={() => onTabChange('inquiries')}>
              <div style={{ fontSize: '1.25rem', marginBottom: 10 }}>◻</div>
              <TLabel>Estimates</TLabel>
              <TMain>Inquiries</TMain>
              <TSub>Submit a request</TSub>
            </Tile>

            <Tile color="#888" onClick={() => onTabChange('home')}>
              <div style={{ fontSize: '1.25rem', marginBottom: 10 }}>○</div>
              <TLabel>Profile</TLabel>
              <TMain>{profile?.name ? <>{profile.name.split(' ')[0]}</> : 'Your info'}</TMain>
              <TSub>Edit profile</TSub>
            </Tile>
          </div>

          {/* SMS Notification Tile */}
          <div style={{
            background: 'var(--bg-card)',
            border: '0.5px solid var(--border)',
            padding: '18px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.5312rem',
                letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-muted)',
              }}>SMS Notifications</div>
              <div style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.5625rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: C.sms, opacity: 0.8,
              }}>Mobile alerts</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {smToggles.map((t, i) => {
                const isOn = !!smsPrefs?.[t.col]
                return (
                  <div
                    key={t.col}
                    onClick={() => {
                      if (isOn) toggleSms(t.col, false)
                      else setPendingToggle(t)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: 12,
                      padding: '11px 0',
                      borderBottom: i < smToggles.length - 1 ? '0.5px solid var(--border)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-ui)', fontSize: '0.75rem',
                        fontWeight: 500, color: isOn ? C.sms : 'var(--text)',
                        letterSpacing: '0.03em', marginBottom: 1,
                        transition: 'color 200ms ease',
                      }}>{t.label}</div>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.6562rem',
                        color: 'var(--text-muted)', lineHeight: 1.4,
                      }}>{t.desc}</div>
                    </div>
                    <PillToggle
                      checked={isOn}
                      onChange={(v) => {
                        if (!v) toggleSms(t.col, false)
                        else setPendingToggle(t)
                      }}
                    />
                  </div>
                )
              })}
            </div>

            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.625rem',
              color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6, opacity: 0.7,
            }}>
              Sent to your phone number on file. Msg & data rates may apply. Reply STOP to opt out.
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
