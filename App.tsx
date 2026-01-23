import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { HypervisaView } from "./components/Hypervisa/HypervisaView";
import { ProjectOverview } from "./components/ProjectOverview";
import { SettingsModal } from "./components/SettingsModal";
import { ContextDetailInspector } from "./components/ContextDetailInspector";
import { ContextInspectorProvider } from "./contexts/ContextInspectorContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ChatHistoryProvider } from "./contexts/ChatHistoryContext";
import { ProjectsProvider } from "./contexts/ProjectsContext";
import { WorkspaceMode, Project } from "./types";
import { Menu, ArrowLeft } from "lucide-react";

function App() {
  const [mode, setMode] = useState<WorkspaceMode>("agents");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleModeChange = (newMode: WorkspaceMode) => {
    setMode(newMode);
    setIsMobileMenuOpen(false);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  // Show project overview when no project is selected
  if (!selectedProject) {
    return (
      <SettingsProvider>
        <NotificationProvider>
          <ProjectsProvider>
            <div className="h-screen w-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
              <ProjectOverview onProjectSelect={handleProjectSelect} />
            </div>
          </ProjectsProvider>
        </NotificationProvider>
      </SettingsProvider>
    );
  }

  // Show Hypervisa view when a project is selected
  return (
    <SettingsProvider>
      <NotificationProvider>
        <ProjectsProvider>
          <ContextInspectorProvider>
            <ChatHistoryProvider>
              <RealtimeProvider>
              <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
                <Sidebar
                  currentMode={mode}
                  onModeChange={handleModeChange}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  isOpen={isMobileMenuOpen}
                  onClose={() => setIsMobileMenuOpen(false)}
                />

                <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                  {/* Background Grid Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0"></div>

                  {/* Mobile Header */}
                  <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border relative z-20 shrink-0">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleBackToProjects}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors mr-1"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                        <span className="font-bold text-primary-foreground text-lg">K</span>
                      </div>
                      <span className="font-bold text-foreground truncate max-w-[150px]">
                        {selectedProject.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Menu size={24} />
                    </button>
                  </div>

                  {/* Desktop Header with Back Button */}
                  <div className="hidden md:flex items-center gap-3 p-4 border-b border-border bg-card/30 relative z-20 shrink-0">
                    <button
                      onClick={handleBackToProjects}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <ArrowLeft size={16} />
                      <span>Projecten</span>
                    </button>
                    <div className="h-4 w-px bg-border" />
                    <span className="font-semibold text-foreground">
                      {selectedProject.name}
                    </span>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 relative z-10">
                    <div className="h-full w-full rounded-xl border border-border bg-card/30 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                      <HypervisaView />
                    </div>
                  </div>
                </main>

                <SettingsModal
                  isOpen={isSettingsOpen}
                  onClose={() => setIsSettingsOpen(false)}
                />

                {/* Context Detail Inspector Modal */}
                <ContextDetailInspector />
              </div>
            </RealtimeProvider>
            </ChatHistoryProvider>
          </ContextInspectorProvider>
        </ProjectsProvider>
      </NotificationProvider>
    </SettingsProvider>
  );
}

export default App;
