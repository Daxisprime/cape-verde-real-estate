import { SearchModeProvider } from '@/contexts/SearchModeContext';
import HomeContent from '@/components/HomeContent';

export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <SearchModeProvider>
      <HomeContent />
    </SearchModeProvider>
  );
}
