import { useState } from 'react';
import { TabBar } from './components/TabBar';
import { HeutePage } from './pages/HeutePage';
import { PlanPage } from './pages/PlanPage';
import { VerlaufPage } from './pages/VerlaufPage';

export type Tab = 'heute' | 'plan' | 'verlauf';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('heute');

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--clr-bg)',
        overflow: 'hidden',
      }}
    >
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'heute'   && <HeutePage   />}
        {activeTab === 'plan'    && <PlanPage    />}
        {activeTab === 'verlauf' && <VerlaufPage />}
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
