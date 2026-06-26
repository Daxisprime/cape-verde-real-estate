import { SearchModeProvider } from '@/contexts/SearchModeContext';
import HomeContent from '@/components/HomeContent';

export default function HomePage() {
  return (
    <SearchModeProvider>
      <HomeContent />
    </SearchModeProvider>
  );
}
