import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import PageWrapper from '@/components/CoreComponents/PageWrapper';
import CaseRoulette from '@/components/RewardsPageComponents/CaseRoulette';

const CasePage: React.FC = () => {
  const { id } = useParams();
  const { cases } = useContext(Context) as IStoreContext;

  useEffect(() => {
    if (!cases.activeCases.length) {
      cases.fetchActiveCases(true);
    }
  }, [cases]);

  if (!id) {
    return null;
  }

  const box = cases.activeCases.find((c) => c.id === Number(id));

  if (cases.loading && !box) {
    return <LoadingIndicator />;
  }

  return (
    <PageWrapper>
      <h1 className="text-white text-2xl font-semibold">{box?.name || 'Case'}</h1>
      {box ? <CaseRoulette caseBox={box} /> : null}
    </PageWrapper>
  );
};

export default CasePage;
