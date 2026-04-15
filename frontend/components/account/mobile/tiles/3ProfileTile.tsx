// components/account/mobile/tiles/3ProfileTile.tsx

interface ProfileTileProps {
  profile: any;
  onClick: () => void;
}

export default function ProfileTile3({ profile, onClick }: ProfileTileProps) {
  return (
    <div
      className="tile dim"
      style={{
        '--tc': '#888',
        minHeight: 0, padding: '13px 17px',
        flexDirection: 'row', alignItems: 'center', gap: 14, cursor: 'pointer',
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>⚙︎</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text)' }}>
          Profile
        </div>
        {profile?.name && (
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {profile.name}
          </div>
        )}
      </div>
    </div>
  );
}