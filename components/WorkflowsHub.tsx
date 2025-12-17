
import React, { useState } from 'react';
import PickListView from './PickListView';
import NewPickListView from './NewPickListView';
import PurchaseOrdersView from './PurchaseOrdersView';
import NewPurchaseOrderView from './NewPurchaseOrderView';
import ReceivingView from './ReceivingView';

interface WorkflowsHubProps {
  subView: string;
}

const WorkflowsHub: React.FC<WorkflowsHubProps> = ({ subView }) => {
  const [internalView, setInternalView] = useState<'list' | 'new'>('list');

  const renderContent = () => {
    if (subView === 'pick-lists') {
      return internalView === 'list' 
        ? <PickListView onCreateNew={() => setInternalView('new')} /> 
        : <NewPickListView onCancel={() => setInternalView('list')} />;
    }
    
    if (subView === 'purchase-orders') {
      return internalView === 'list' 
        ? <PurchaseOrdersView onCreateNew={() => setInternalView('new')} /> 
        : <NewPurchaseOrderView onCancel={() => setInternalView('list')} />;
    }

    if (subView === 'receives') {
      return <ReceivingView />;
    }

    return (
      <div className="flex flex-col items-center justify-center h-full opacity-30 py-48">
        <i className="fa-solid fa-shuffle text-6xl mb-6"></i>
        <p className="text-lg font-black uppercase tracking-widest">Workflow selection</p>
      </div>
    );
  };

  React.useEffect(() => {
    setInternalView('list');
  }, [subView]);

  return <div className="h-full">{renderContent()}</div>;
};

export default WorkflowsHub;
