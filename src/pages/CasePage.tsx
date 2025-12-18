import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';

const CasePage: React.FC = () => {
  const { id } = useParams();
  const { reward } = useContext(Context) as IStoreContext;

  useEffect(() => {
    if (!reward.availableCases.length) {
      reward.fetchAvailableCases(true);
    }
  }, [reward]);

  if (!id) {
    return null;
  }

  const box = reward.availableCases.find((c) => c.id === Number(id));

  if (reward.loading && !box) {
    return <LoadingIndicator />;
  }

  return (
    <div className="p-4">
      <h1 className="text-white text-2xl font-semibold">{box?.name || 'Case'}</h1>
    </div>
  );
};

export default CasePage;
