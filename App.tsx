import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import InventoryView from './components/InventoryView';
import ReportsHub from './components/ReportsHub';
import SettingsView from './components/SettingsView';
import LowStockReport from './components/LowStockReport';
import DashboardView from './components/DashboardView';
import ItemDetailView from './components/ItemDetailView';
import NotificationsView from './components/NotificationsView';
import InventorySummaryReport from './components/InventorySummaryReport';
import MoveSummaryReport from './components/MoveSummaryReport';
import TransactionsReport from './components/TransactionsReport';
import UserActivityReport from './components/UserActivityReport';
import HistoryView from './components/HistoryView';
import ItemFlowReport from './components/ItemFlowReport';
import AdvancedSearchView from './components/AdvancedSearchView';
import TagsView from './components/TagsView';
import HelpView from './components/HelpView';
import WorkflowsHub from './components/WorkflowsHub';
import OnboardingWizard from './components/OnboardingWizard';
import PlanManagementView from './components/PlanManagementView';
import ManagePlanView from './components/ManagePlanView';
import { InventoryItem } from './types';
import { MOCK_ITEMS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [subView, setSubView] = useState('low-stock');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Tags State
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Auto-trigger onboarding for demo if needed
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('zen_onboarded');
    if (!hasOnboarded) {
      setTimeout(() => setShowOnboarding(true), 2000);
    }
  }, []);

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    setActiveView('inventory');
  };

  const renderView = () => {
    if (activeView === 'help') return <HelpView />;
    if (activeView === 'picking') return <WorkflowsHub subView={subView} />;
    
    if (activeView === 'reports') {
      switch (subView) {
        case 'hub': return <ReportsHub onSelectReport={setSubView} />;
        case 'low-stock': return <LowStockReport />;
        case 'inventory-summary': return <InventorySummaryReport />;
        case 'move-summary': return <MoveSummaryReport />;
        case 'transactions': return <TransactionsReport />;
        case 'item-flow': return <ItemFlowReport />;
        case 'user-activity': return <UserActivityReport />;
        case 'history': return <HistoryView />;
        default: return <ReportsHub onSelectReport={setSubView} />;
      }
    }
    
    if (activeView === 'settings') {
      if (subView === 'billing') return <PlanManagementView onManagePlan={() => setSubView('manage-plan')} />;
      if (subView === 'manage-plan') return <ManagePlanView onBack={() => setSubView('billing')} />;
      return <SettingsView subView={subView} />;
    }

    if (activeView === 'notifications') return <NotificationsView />;
    if (activeView === 'search') return <AdvancedSearchView />;

    if (activeView === 'tags') {
      return (
        <TagsView 
          tags={tags} 
          selectedTag={selectedTag} 
          onSelectTag={setSelectedTag}
          onAddTag={(name) => {
            setTags(prev => [...prev, name]);
            setSelectedTag(name);
          }}
          onEditTag={(oldTag, newTag) => {
            setTags(prev => prev.map(t => t === oldTag ? newTag : t));
            if (selectedTag === oldTag) setSelectedTag(newTag);
          }}
          onDeleteTag={(tag) => {
            setTags(prev => prev.filter(t => t !== tag));
            if (selectedTag === tag) setSelectedTag(null);
          }}
        />
      );
    }

    if (activeView === 'inventory' && selectedItemId) {
      const item = MOCK_ITEMS.find(i => i.id === selectedItemId);
      if (item) return <ItemDetailView item={item} onBack={() => setSelectedItemId(null)} />;
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView onSelectItem={handleSelectItem} />;
      case 'inventory':
        return <InventoryView onSelectItem={handleSelectItem} />;
      default:
        return <InventoryView onSelectItem={handleSelectItem} />;
    }
  };

  return (
    <div className="relative h-screen w-full">
      <Layout 
        activeView={activeView} 
        setActiveView={(view) => {
          setActiveView(view);
          setSelectedItemId(null); 
          if (view === 'reports') setSubView('hub');
          if (view === 'settings') setSubView('preferences');
          if (view === 'tags') setSelectedTag(tags.length > 0 ? tags[0] : null);
          if (view === 'picking') setSubView('pick-lists');
        }}
        subView={selectedTag || subView}
        setSubView={(val) => {
          if (activeView === 'tags') setSelectedTag(val);
          else setSubView(val);
        }}
        tags={tags}
      >
        {renderView()}
      </Layout>

      {showOnboarding && (
        <OnboardingWizard onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('zen_onboarded', 'true');
        }} />
      )}
    </div>
  );
};

export default App;