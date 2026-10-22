import { ErrorStatePage } from '../components/marketing/ErrorStatePage';
import { useSeo } from '../utils/useSeo';

// Static page only - there is no live "maintenance mode" toggle built into
// the backend yet. This exists so the page itself (and its styling) is
// ready whenever that's needed.
export function MaintenancePage() {
  useSeo('Down for maintenance', 'RootTrace Ivory is briefly down for maintenance.', '/maintenance');
  return (
    <ErrorStatePage
      title="Down for scheduled maintenance."
      description="We're making some improvements and will be back shortly. Thanks for your patience."
    />
  );
}
