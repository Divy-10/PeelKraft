import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiFunc, params = null, immediate = true) => {
  const [data, setData] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFunc(overrideParams || params);
      setData(res.data);
      if (res.pagination) setPagination(res.pagination);
      return res;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc, params]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { data, pagination, loading, error, execute, setData };
};

export default useApi;
