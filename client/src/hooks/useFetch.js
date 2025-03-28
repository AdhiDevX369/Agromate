import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching data from APIs
 * @param {Function} fetchFunction - The API function to call
 * @param {Array} dependencies - Dependencies to trigger refetch (optional)
 */
export const useFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchFunction();
      setData(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  // Refetch data function that can be called manually
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, isLoading, error, refetch };
};

/**
 * Custom hook for submitting data to APIs
 * @param {Function} submitFunction - The API function to call with data
 */
export const useSubmit = (submitFunction) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Function to submit data
  const submitData = useCallback(async (data) => {
    setIsSubmitting(true);
    setSuccess(false);
    setError(null);
    
    try {
      const response = await submitFunction(data);
      setSuccess(true);
      return response.data;
    } catch (err) {
      console.error('Error submitting data:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFunction]);

  return { submitData, isSubmitting, success, error };
};

export default useFetch;