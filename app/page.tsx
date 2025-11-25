'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import ProjectSelector from '@/components/ProjectSelector';
import SitePlanView from '@/components/SitePlanView';
import BuildingView from '@/components/BuildingView';
import FloorplanEditor from '@/components/FloorplanEditor';
import SimpleAuth from '@/components/SimpleAuth';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  const {
    currentComplexId,
    currentSitePlanId,
    currentBuildingId,
    currentFloorplanId,
    getCurrentComplex,
    getCurrentSitePlan,
    getCurrentBuilding,
  } = useStore();

  const complex = getCurrentComplex();
  const sitePlan = getCurrentSitePlan();
  const building = getCurrentBuilding();

  // Determine which view to show
  if (currentFloorplanId && currentFloorplanId !== '' && building) {
    return (
      <ErrorBoundary>
        <FloorplanEditor />
      </ErrorBoundary>
    );
  }

  if (currentBuildingId && currentBuildingId !== '' && sitePlan) {
    return (
      <ErrorBoundary>
        <BuildingView />
      </ErrorBoundary>
    );
  }

  if (currentSitePlanId && currentSitePlanId !== '' && sitePlan) {
    return (
      <ErrorBoundary>
        <SitePlanView />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SimpleAuth />
      <ProjectSelector />
    </ErrorBoundary>
  );
}

