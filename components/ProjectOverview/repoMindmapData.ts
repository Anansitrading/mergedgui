import type { WorktreeWithBranches } from '../../types';

const WORKTREE_DATA: Record<string, WorktreeWithBranches[]> = {
  '1': [
    {
      id: 'wt-1-1',
      name: 'Main',
      path: '/main',
      isActive: true,
      currentBranch: 'develop',
      branches: [
        { name: 'main', isDefault: true, isCurrent: false, lastCommit: '3h ago' },
        { name: 'develop', isDefault: false, isCurrent: true, lastCommit: '25m ago' },
        { name: 'feature/auth', isDefault: false, isCurrent: false, lastCommit: '2d ago' },
      ],
    },
    {
      id: 'wt-1-2',
      name: 'feature-a',
      path: '/feature-a',
      isActive: false,
      currentBranch: 'develop-new UI',
      branches: [
        { name: 'main', isDefault: true, isCurrent: false, lastCommit: '3h ago' },
        { name: 'develop-new UI', isDefault: false, isCurrent: true, lastCommit: '1h ago' },
        { name: 'feature/auth', isDefault: false, isCurrent: false, lastCommit: '5h ago' },
      ],
    },
    {
      id: 'wt-1-3',
      name: 'feature-b',
      path: '/feature-b',
      isActive: false,
      currentBranch: 'develop-payment',
      branches: [
        { name: 'main', isDefault: true, isCurrent: false, lastCommit: '3h ago' },
        { name: 'develop-payment', isDefault: false, isCurrent: true, lastCommit: '45m ago' },
      ],
    },
  ],
  '2': [
    {
      id: 'wt-2-1',
      name: 'Main',
      path: '/main',
      isActive: true,
      currentBranch: 'main',
      branches: [
        { name: 'main', isDefault: true, isCurrent: true, lastCommit: '1h ago' },
        { name: 'develop', isDefault: false, isCurrent: false, lastCommit: '4h ago' },
        { name: 'feature/api-v3', isDefault: false, isCurrent: false, lastCommit: '1d ago' },
      ],
    },
    {
      id: 'wt-2-2',
      name: 'docs-rewrite',
      path: '/docs-rewrite',
      isActive: false,
      currentBranch: 'docs/architecture',
      branches: [
        { name: 'docs/architecture', isDefault: false, isCurrent: true, lastCommit: '2h ago' },
        { name: 'docs/api-reference', isDefault: false, isCurrent: false, lastCommit: '6h ago' },
      ],
    },
  ],
  '3': [
    {
      id: 'wt-3-1',
      name: 'Main',
      path: '/main',
      isActive: true,
      currentBranch: 'main',
      branches: [
        { name: 'main', isDefault: true, isCurrent: true, lastCommit: '30m ago' },
        { name: 'staging', isDefault: false, isCurrent: false, lastCommit: '2h ago' },
      ],
    },
  ],
};

const DEFAULT_WORKTREES: WorktreeWithBranches[] = [
  {
    id: 'wt-default-1',
    name: 'Main',
    path: '/main',
    isActive: true,
    currentBranch: 'main',
    branches: [
      { name: 'main', isDefault: true, isCurrent: true, lastCommit: '2h ago' },
      { name: 'develop', isDefault: false, isCurrent: false, lastCommit: '5h ago' },
    ],
  },
];

export function getWorktreesForProject(projectId: string): WorktreeWithBranches[] {
  return WORKTREE_DATA[projectId] || DEFAULT_WORKTREES;
}
