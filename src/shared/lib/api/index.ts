import { FetchResponse } from '@shared/model/types';

// Utility function for handling api requests and abstracting error handling
// Even though its an overkill for this current task project, I've created this
// To Show you how I think and how I setup my projects, Here I'm considering multiple api calls in the future
// So I thought it's better to have a handler function for my api calls
export async function fetcher<T>(
  url: string,
  options?: RequestInit
): Promise<FetchResponse<T>> {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      // Throw error for non-200 response
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data: T = await res.json();

    return {
      errorMessage: '',
      data,
    };
  } catch (error) {
    let errorMessage = 'Unknown error occurred';

    if (error instanceof Error) {
      // Any thrown JS Error
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      // When we are throwing string
      errorMessage = error;
    } else {
      // Some APIs throw objects or arrays
      errorMessage = JSON.stringify(error);
    }

    return {
      hasError: true,
      errorMessage,
    };
  }
}
