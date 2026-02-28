'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';

export function useRoundHistory(page = 1, limit = 10) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.getAllRounds(page, limit);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rounds');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page, limit]);

  return { data, loading, error };
}

export function useUserStats(address: string | undefined) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.getUserStats(address);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user stats');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [address]);

  return { data, loading, error };
}

export function usePlayerTickets(address: string | undefined, roundId?: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const response = roundId
          ? await api.getPlayerTicketsForRound(address, roundId)
          : await api.getTicketsByPlayer(address);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [address, roundId]);

  return { data, loading, error, refetch: () => {} };
}

export function useGlobalStats() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.getGlobalStats();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch global stats');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

export function useNumberFrequency() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.getNumberFrequency();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch number frequency');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

export function useTopPlayers(limit = 10) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.getTopPlayers(limit);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch top players');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [limit]);

  return { data, loading, error };
}
