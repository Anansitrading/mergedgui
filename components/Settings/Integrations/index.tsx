// Integrations Section - Component Exports
// Setting Sprint 6: Integrations
// Note: IntegrationsSection has been migrated to Dashboard tab (task_1_4)

// Export reusable components for use in Dashboard IntegrationsTab
export { IntegrationSearch } from './IntegrationSearch';
export { AppCard } from './AppCard';
export { AppGrid } from './AppGrid';
export { WebhookForm } from './WebhookForm';
export { WebhookList } from './WebhookList';

/**
 * @deprecated IntegrationsSection has been migrated to the Dashboard Integrations tab.
 * Use the Dashboard IntegrationsTab component instead.
 * This component is kept for backwards compatibility but always returns null.
 *
 * Migration: task_1_4 (Integrations Tab Migration)
 */
export function IntegrationsSection() {
  // This component has been migrated to Dashboard/IntegrationsTab.tsx
  // Returning null for backwards compatibility if this is accidentally rendered
  return null;
}

export default IntegrationsSection;
