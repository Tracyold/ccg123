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
        minHeight: 110, cursor: 'pointer', padding: '20px 18px',
        justifyContent: 'center', flexDirection: 'row', alignItems: 'center',
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
        <div style={{ 
          fontSize: 2.0rem, 
          lineHeight: 1, 
          color: 'rgba(255,255,255,0.85)', 
          flexShrink: 0,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>👤</div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: 1.125rem, 
            color: 'var(--text)',
            fontWeight: 500
          }}>Profile</div>
          {profile?.name && (
            <div style={{
              fontFamily: 'var(--font-ui)', fontSize: 0.875rem,
              color: 'var(--text-muted)', marginTop: 4, opacity: 0.8
            }}>
              {profile.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
