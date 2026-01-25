import { ProjectsDashboard } from '../ProjectOverview';
import type { Project } from '../../types';

interface ProjectsTabProps {
  onProjectSelect: (project: Project) => void;
}

export function ProjectsTab({ onProjectSelect }: ProjectsTabProps) {
  return (
    <div
      role="tabpanel"
      id="tabpanel-projects"
      aria-labelledby="tab-projects"
      className="h-full overflow-y-auto"
    >
      <ProjectsDashboard
        onProjectSelect={onProjectSelect}
        embedded
      />
    </div>
  );
}
