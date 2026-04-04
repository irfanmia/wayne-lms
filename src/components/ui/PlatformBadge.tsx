'use client';

const GoogleMeetIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="15" height="16" rx="3" fill="#00832d"/>
    <path d="M16 8.5l6-4v15l-6-4v-7z" fill="#00ac47"/>
  </svg>
);

const ZoomIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#2D8CFF"/>
    <path d="M5 8h9a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z" fill="white"/>
    <path d="M16 9.5l5-2.5v10l-5-2.5v-5z" fill="white"/>
  </svg>
);

const TeamsIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#5059C9"/>
    <circle cx="15" cy="7" r="2.5" fill="white"/>
    <path d="M12 11h6a2 2 0 012 2v3a2 2 0 01-2 2h-6v-7z" fill="white" opacity="0.8"/>
    <circle cx="9" cy="8" r="3" fill="white"/>
    <path d="M4 12h10a2 2 0 012 2v4a2 2 0 01-2 2H4a1 1 0 01-1-1v-6a1 1 0 011-1z" fill="white"/>
  </svg>
);

const platformConfig: Record<string, { name: string; Icon: React.FC<{ size?: number }>; bg: string; border: string; text: string }> = {
  google_meet: { name: 'Google Meet', Icon: GoogleMeetIcon, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  zoom: { name: 'Zoom', Icon: ZoomIcon, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  microsoft_teams: { name: 'Teams', Icon: TeamsIcon, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
};

export default function PlatformBadge({ platform, size = 'sm' }: { platform: string; size?: 'sm' | 'md' }) {
  const config = platformConfig[platform] || platformConfig.google_meet;
  const iconSize = size === 'md' ? 20 : 16;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text}`}>
      <config.Icon size={iconSize} />
      {config.name}
    </span>
  );
}
