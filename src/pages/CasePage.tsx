import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import PageWrapper from '@/components/CoreComponents/PageWrapper';

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
    <PageWrapper>
      <h1 className="text-white text-2xl font-semibold">{box?.name || 'Case'}</h1>
    </PageWrapper>
  );
};

export default CasePage;
