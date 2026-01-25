import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Settings } from 'lucide-react';
import { useTabNavigation } from '../../hooks/useTabNavigation';
import { useProjects } from '../../contexts/ProjectsContext';
import { DashboardTabs } from './DashboardTabs';
import { ProjectsTab } from './ProjectsTab';
import { IntegrationsTab } from './IntegrationsTab';
import { SkillsTab } from './SkillsTab';
import { UserAvatar } from './UserAvatar';
import { UserDropdown } from './UserDropdown';
import { SettingsModal } from '../SettingsModal';
import { MyProfileModal } from '../Profile/MyProfileModal';
import { ProjectCreationModal } from '../ProjectOverview/ProjectCreationModal';
import type { Project } from '../../types';
import type { ProjectCreationForm } from '../../types/project';

interface DashboardProps {
  onProjectSelect: (project: Project) => void;
}

export function Dashboard({ onProjectSelect }: DashboardProps) {
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useTabNavigation();
  const { searchQuery, setSearchQuery, createProject } = useProjects();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    console.log('Logout clicked');
  };

  const handleCreateProject = (data: ProjectCreationForm) => {
    const newProject = createProject(data.name);
    navigate(`/project/${newProject.id}`);
    setIsNewProjectModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card/30 backdrop-blur-xl">
        {/* Top Bar - Logo, Tabs, and Actions */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Tabs */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/public/favicon.png"
                alt="Kijko logo"
                className="w-10 h-10 rounded-lg"
              />
              <span className="font-bold text-xl text-foreground tracking-tight hidden sm:inline">
                KIJKO
              </span>
            </div>

            {/* Main Navigation Tabs */}
            <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            {/* Search - Only show on Projects tab */}
            {activeTab === 'projects' && (
              <div className="relative w-64 hidden md:block">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            {/* New Project Button - Only show on Projects tab */}
            {activeTab === 'projects' && (
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Create new</span>
              </button>
            )}

            {/* User Avatar with Dropdown */}
            <div className="relative">
              <UserAvatar onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} />
              <UserDropdown
                isOpen={isUserDropdownOpen}
                onClose={() => setIsUserDropdownOpen(false)}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'projects' && (
          <ProjectsTab onProjectSelect={onProjectSelect} />
        )}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'skills' && <SkillsTab />}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* My Profile Modal */}
      <MyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Project Creation Modal */}
      <ProjectCreationModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={handleCreateProject}
        existingProjectNames={[]}
      />

      {/* Settings Button - Bottom Left */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-6 left-6 flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all shadow-lg group z-10"
      >
        <Settings
          size={16}
          className="transition-transform duration-500 group-hover:rotate-90"
        />
        <span>Settings</span>
      </button>
    </div>
  );
}

export { DashboardTabs } from './DashboardTabs';
export { ProjectsTab } from './ProjectsTab';
export { IntegrationsTab } from './IntegrationsTab';
export { SkillsTab } from './SkillsTab';
export { UserAvatar } from './UserAvatar';
export { UserDropdown } from './UserDropdown';
