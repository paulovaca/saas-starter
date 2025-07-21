'use client';

import { useState } from 'react';
import { useCSRF } from '@/hooks/use-csrf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

/**
 * Example component demonstrating CSRF token usage
 * This shows how to include CSRF tokens in:
 * 1. Form submissions
 * 2. AJAX/Fetch requests
 */
export function CSRFExample() {
  const { token, loading: csrfLoading, error: csrfError } = useCSRF();
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Example 1: Using CSRF with fetch
  const handleFetchSubmit = async () => {
    if (!token) {
      alert('CSRF token not available yet');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/example', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': token, // Include CSRF token in header
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const result = await response.json();
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Using CSRF with form submission
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!token) {
      alert('CSRF token not available yet');
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    setLoading(true);
    try {
      const response = await fetch('/api/example?' + new URLSearchParams({
        _csrf: token // Include CSRF token as query parameter
      }), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const result = await response.json();
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (csrfLoading) {
    return <div>Loading CSRF token...</div>;
  }

  if (csrfError) {
    return <div>Error loading CSRF token: {csrfError}</div>;
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold mb-4">CSRF Protection Example</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This example demonstrates how to use CSRF tokens in your application.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
          <p className="text-sm">
            <strong>Current CSRF Token:</strong>{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
              {token || 'Loading...'}
            </code>
          </p>
        </div>
      </div>

      {/* Example 1: Fetch with CSRF */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Example 1: Fetch with CSRF Header</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="data">Data to send</Label>
            <Input
              id="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Enter some data"
            />
          </div>
          <Button onClick={handleFetchSubmit} disabled={loading || !token}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send with Fetch'
            )}
          </Button>
        </div>
      </div>

      {/* Example 2: Form with CSRF */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Example 2: Form with CSRF Query Parameter</h3>
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div>
            <Label htmlFor="formData">Form Data</Label>
            <Input
              id="formData"
              name="formData"
              placeholder="Enter form data"
              required
            />
          </div>
          <Button type="submit" disabled={loading || !token}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </Button>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Result</h3>
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto text-sm">
            {result}
          </pre>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">How to Use CSRF Protection</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Import the <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">useCSRF</code> hook</li>
          <li>Get the token from the hook: <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">const {'{ token }'} = useCSRF()</code></li>
          <li>Include the token in your requests:
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>As a header: <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">'x-csrf-token': token</code></li>
              <li>As a query parameter: <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">?_csrf=token</code></li>
            </ul>
          </li>
          <li>The middleware will validate the token automatically</li>
        </ol>
      </div>
    </div>
  );
}