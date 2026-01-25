import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { SettingsInput } from '../Settings/SettingsInput';
import { AvatarUpload } from '../Settings/Profile/AvatarUpload';
import { GravatarToggle } from '../Settings/Profile/GravatarToggle';
import { EmailVerification } from '../Settings/Profile/EmailVerification';
import { RoleSelect } from '../Settings/Profile/RoleSelect';
import { TimezoneSelect } from '../Settings/Profile/TimezoneSelect';
import { PasswordChange } from '../Settings/Profile/PasswordChange';
import { cn } from '../../utils/cn';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyProfileModal({ isOpen, onClose }: MyProfileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { getSetting } = useSettings();

  const firstName = getSetting('profile.firstName', '') as string;
  const lastName = getSetting('profile.lastName', '') as string;

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Your Profile';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden',
          'bg-card border border-border rounded-xl shadow-2xl',
          'flex flex-col',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 id="profile-modal-title" className="text-lg font-semibold text-foreground">
            {displayName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            aria-label="Close profile"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8 max-w-xl">
            {/* Avatar Section */}
            <ProfileSection
              title="Profile Photo"
              description="Upload a photo or use your Gravatar"
            >
              <div className="space-y-6">
                <AvatarUpload />
                <div className="border-t border-border pt-4">
                  <GravatarToggle />
                </div>
              </div>
            </ProfileSection>

            {/* Account Information */}
            <ProfileSection
              title="Account Information"
              description="Your personal details and contact information"
            >
              <EmailVerification />

              <SettingsInput
                settingKey="profile.firstName"
                label="First Name"
                placeholder="Enter your first name"
                validation={{ required: true, minLength: 1, maxLength: 50 }}
              />

              <SettingsInput
                settingKey="profile.lastName"
                label="Last Name"
                placeholder="Enter your last name"
                validation={{ required: true, minLength: 1, maxLength: 50 }}
              />

              <SettingsInput
                settingKey="profile.company"
                label="Company"
                description="Optional - your company or organization"
                placeholder="Enter your company name"
                validation={{ maxLength: 100 }}
              />
            </ProfileSection>

            {/* Role & Preferences */}
            <ProfileSection
              title="Role & Preferences"
              description="Customize your experience based on your role"
            >
              <RoleSelect />
              <TimezoneSelect />
            </ProfileSection>

            {/* Password Change */}
            <PasswordChange />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 shrink-0">
          <p className="text-xs text-muted-foreground">
            Settings are auto-saved
          </p>
        </div>
      </div>
    </div>
  );
}

// Local ProfileSection component for modal context
function ProfileSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-0">
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      <div className="space-y-0">{children}</div>
    </section>
  );
}

export default MyProfileModal;
