import { useSettings } from '../../contexts/SettingsContext';
import { getInitials, stringToColor } from '../../lib/gravatar';
import { cn } from '../../utils/cn';

interface UserAvatarProps {
  onClick: () => void;
  className?: string;
}

export function UserAvatar({ onClick, className }: UserAvatarProps) {
  const { getSetting } = useSettings();

  // Get user data from settings
  const avatarUrl = getSetting('profile.avatarUrl', '') as string;
  const firstName = getSetting('profile.firstName', '') as string;
  const lastName = getSetting('profile.lastName', '') as string;
  const email = getSetting('profile.email', '') as string;

  const initials = getInitials(firstName, lastName);
  const bgColor = stringToColor(email || firstName || 'user');

  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles
        'w-10 h-10 rounded-full overflow-hidden flex items-center justify-center',
        'text-sm font-semibold text-white',
        // Hover state
        'transition-all duration-200',
        'hover:scale-105 hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background',
        // Focus state for accessibility
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
        // Cursor
        'cursor-pointer',
        className
      )}
      style={{ backgroundColor: !avatarUrl ? bgColor : undefined }}
      aria-label="Open user menu"
      aria-haspopup="menu"
      title="Open user menu"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="User avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </button>
  );
}

export default UserAvatar;
