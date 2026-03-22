/**
 * React Hooks for GitLab ASRO Data Integration
 * Handles fetching, caching, and auto-refresh of scan data from GitLab
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { gitlabDataService, type ScanData, type ComplianceData, type SBOMData } from '../services/gitlabDataService';

export interface DashboardData {
  latestScan: ScanData | null;
  scans: ScanData[];
  compliance: ComplianceData | null;
  sbom: SBOMData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

/**
 * Hook for fetching and managing ASRO dashboard data from GitLab
 * Auto-refreshes at configured intervals
 */
export const useGitLabDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    latestScan: null,
    scans: [],
    compliance: null,
    sbom: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRefreshEnabled = import.meta.env.VITE_AUTO_REFRESH_ENABLED === 'true';
  const refreshInterval = parseInt(import.meta.env.VITE_REFRESH_INTERVAL || '30000', 10);

  // Fetch data from GitLab
  const fetchData = useCallback(async () => {
    try {
      setData((prev: DashboardData) => ({ ...prev, isLoading: true }));

      const result = await gitlabDataService.fetchAllDashboardData();

      setData({
        ...result,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      } as DashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData((prev: DashboardData) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
      }));
    }
  }, []);

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    fetchData();

    if (autoRefreshEnabled && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(fetchData, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [fetchData, autoRefreshEnabled, refreshInterval]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    ...data,
    refresh,
  };
};

/**
 * Hook for fetching scan history
 */
export const useGitLabScanHistory = () => {
  const [scans, setScans] = useState<ScanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await gitlabDataService.fetchScanHistory();
        setScans(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch scan history');
        setScans([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { scans, isLoading, error };
};

/**
 * Hook for fetching compliance report
 */
export const useGitLabComplianceReport = () => {
  const [compliance, setCompliance] = useState<ComplianceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await gitlabDataService.fetchComplianceReport();
        setCompliance(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch compliance report');
        setCompliance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { compliance, isLoading, error };
};

/**
 * Hook for fetching SBOM
 */
export const useGitLabSBOM = () => {
  const [sbom, setSBOM] = useState<SBOMData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await gitlabDataService.fetchSBOM();
        setSBOM(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch SBOM');
        setSBOM(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { sbom, isLoading, error };
};

/**
 * Hook for fetching recent commits
 */
export const useGitLabRecentCommits = (maxResults = 10) => {
  const [commits, setCommits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await gitlabDataService.fetchRecentCommits(maxResults);
        setCommits(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch commits');
        setCommits([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [maxResults]);

  return { commits, isLoading, error };
};

/**
 * Hook for fetching pipelines
 */
export const useGitLabPipelines = (maxResults = 5) => {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await gitlabDataService.fetchPipelines(maxResults);
        setPipelines(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pipelines');
        setPipelines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [maxResults]);

  return { pipelines, isLoading, error };
};
