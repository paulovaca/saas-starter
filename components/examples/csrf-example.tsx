'use client';

import { useState } from 'react';
import { useCSRF } from '@/hooks/use-csrf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import styles from './csrf-example.module.css';
import loadingStyles from '../ui/loading-icon.module.css';

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
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>CSRF Protection Example</h2>
        <p className={styles.description}>
          This example demonstrates how to use CSRF tokens in your application.
        </p>
        <div className={styles.tokenDisplay}>
          <p>
            <strong>Current CSRF Token:</strong>{' '}
            <code className={styles.tokenCode}>
              {token || 'Loading...'}
            </code>
          </p>
        </div>
      </div>

      {/* Example 1: Fetch with CSRF */}
      <div className={styles.exampleSection}>
        <h3 className={styles.exampleTitle}>Example 1: Fetch with CSRF Header</h3>
        <div className={styles.formContent}>
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
                <Loader2 className={loadingStyles.loadingIcon} />
                Sending...
              </>
            ) : (
              'Send with Fetch'
            )}
          </Button>
        </div>
      </div>

      {/* Example 2: Form with CSRF */}
      <div className={styles.exampleSection}>
        <h3 className={styles.exampleTitle}>Example 2: Form with CSRF Query Parameter</h3>
        <form onSubmit={handleFormSubmit} className={styles.formContent}>
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
                <Loader2 className={loadingStyles.loadingIcon} />
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
        <div className={styles.resultContainer}>
          <h3 className={styles.resultTitle}>Result</h3>
          <pre className={styles.resultPre}>
            {result}
          </pre>
        </div>
      )}

      {/* Usage Instructions */}
      <div className={styles.instructionsContainer}>
        <h3 className={styles.instructionsTitle}>How to Use CSRF Protection</h3>
        <ol className={styles.instructionsList}>
          <li>Import the <code className={styles.instructionCode}>useCSRF</code> hook</li>
          <li>Get the token from the hook: <code className={styles.instructionCode}>const {'{ token }'} = useCSRF()</code></li>
          <li>Include the token in your requests:
            <ul>
              <li>As a header: <code className={styles.instructionCode}>'x-csrf-token': token</code></li>
              <li>As a query parameter: <code className={styles.instructionCode}>?_csrf=token</code></li>
            </ul>
          </li>
          <li>The middleware will validate the token automatically</li>
        </ol>
      </div>
    </div>
  );
}