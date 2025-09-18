// components/ConnectionTest.jsx - Add this component to test CORS
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { testBackendConnection } from '@/lib/voiceApiClient';

export function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, testing, success, error
  const [connectionData, setConnectionData] = useState(null);
  const [error, setError] = useState('');

  const testConnection = async () => {
    setConnectionStatus('testing');
    setError('');
    setConnectionData(null);

    try {
      const result = await testBackendConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        setConnectionData(result.data);
      } else {
        setConnectionStatus('error');
        setError(result.error);
      }
    } catch (err) {
      setConnectionStatus('error');
      setError(err.message);
    }
  };

  // Auto-test on component mount
  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Badge variant="outline">Testing...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Connection Failed</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  return (
    <Card className="max-w-md mx-auto mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Backend Connection</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Testing connection to AI analysis server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionStatus === 'success' && connectionData && (
          <div className="space-y-2">
            <div className="text-sm text-green-700 font-medium">✓ Connection successful!</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Status: {connectionData.status}</div>
              <div>AI Service: {connectionData.gemini_status}</div>
              <div>Server Time: {new Date(connectionData.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="space-y-2">
            <div className="text-sm text-red-700 font-medium">✗ Connection failed</div>
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
              {error}
            </div>
            <div className="text-xs text-gray-600">
              This might be a CORS issue, network problem, or the server might be starting up.
            </div>
          </div>
        )}

        <Button 
          onClick={testConnection} 
          variant="outline" 
          size="sm" 
          disabled={connectionStatus === 'testing'}
          className="w-full"
        >
          {connectionStatus === 'testing' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          Backend: {process.env.NEXT_PUBLIC_API_URL || 'https://backend-ai-speak.onrender.com'}
        </div>
      </CardContent>
    </Card>
  );
}

// Usage example - Add this to your game setup pages
export default ConnectionTest;