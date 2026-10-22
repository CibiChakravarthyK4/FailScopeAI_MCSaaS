import { ErrorStatePage } from '../components/marketing/ErrorStatePage';
import { useSeo } from '../utils/useSeo';

export function ServerErrorPage() {
  useSeo('Something went wrong', 'An unexpected error occurred.', '/500');
  return (
    <ErrorStatePage
      code="500"
      title="Something went wrong on our end."
      description="This wasn't caused by anything you did. Try reloading, and if it keeps happening, let us know."
    />
  );
}
