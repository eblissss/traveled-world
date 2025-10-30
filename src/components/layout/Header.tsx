import { ViewSwitcher } from './ViewSwitcher';
import { StyleSelector } from './StyleSelector';

export function Header() {
  return (
    <header className="bg-bg-secondary border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Traveled World</h1>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <StyleSelector />
          <ViewSwitcher />
        </div>
      </div>
    </header>
  );
}

