import { Users, Sparkles, Star, Download } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CommunitySkillsViewProps {
  onCreateSkill: () => void;
}

export function CommunitySkillsView({ onCreateSkill }: CommunitySkillsViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20">
          <Users size={48} className="text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 p-2 bg-card border border-border rounded-full shadow-lg">
          <Sparkles size={16} className="text-yellow-500" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Community Skills
      </h2>

      {/* Description */}
      <p className="text-center text-muted-foreground max-w-md mb-8">
        Discover and share skills created by the Kijko community.
        Rate, review, and use skills built by other users.
      </p>

      {/* Coming Soon Badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-8">
        <Sparkles size={16} />
        Coming Soon
      </div>

      {/* Feature Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="p-2 bg-yellow-500/10 rounded-lg w-fit mx-auto mb-3">
            <Star size={20} className="text-yellow-500" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Rate & Review</h3>
          <p className="text-xs text-muted-foreground">
            Share your experience with skills from the community
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="p-2 bg-green-500/10 rounded-lg w-fit mx-auto mb-3">
            <Download size={20} className="text-green-500" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Easy Import</h3>
          <p className="text-xs text-muted-foreground">
            Add community skills to your library with one click
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="p-2 bg-blue-500/10 rounded-lg w-fit mx-auto mb-3">
            <Users size={20} className="text-blue-500" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Share Your Skills</h3>
          <p className="text-xs text-muted-foreground">
            Publish your custom skills for others to use
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8">
        <p className="text-sm text-muted-foreground mb-4">
          In the meantime, create your own custom skills:
        </p>
        <button
          onClick={onCreateSkill}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
        >
          <Sparkles size={18} />
          Create Custom Skill
        </button>
      </div>
    </div>
  );
}
