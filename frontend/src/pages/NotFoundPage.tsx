import { ErrorStatePage } from '../components/marketing/ErrorStatePage';
import { useSeo } from '../utils/useSeo';

export function NotFoundPage() {
  useSeo('Page not found', "The page you're looking for doesn't exist.", '/404');
  return (
    <ErrorStatePage
      code="404"
      title="We can't find that page."
      description="The page you're looking for may have moved or no longer exists."
    />
  );
}
