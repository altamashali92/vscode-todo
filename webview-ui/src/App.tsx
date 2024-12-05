import React, { useState, useEffect } from "react";
import { vscode } from "./utilities/vscode";
import { QuarantinedTest } from '../../src/types';
import FlakyTestList from "./components/FlakyTestList";

const App: React.FC = () => {
  const [flakyTests, setFlakyTests] = useState<QuarantinedTest[]>(() => {
    const saved = localStorage.getItem('flakyTests');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retrieve flaky tests from webview or localStorage
    const tests = (window as any).flakyTests as QuarantinedTest[];
    if (tests && tests.length > 0) {
      setFlakyTests(tests);
      localStorage.setItem('flakyTests', JSON.stringify(tests));
    }
    setIsLoading(false);

    // Notify the extension that webview is ready
    vscode.postMessage({command: 'ready'});

    // Listen for updates
    const messageListener = (event: MessageEvent) => {
      const message = event.data;
      switch (message.command) {
        case 'updateTests':
          setFlakyTests(message.tests);
          localStorage.setItem('flakyTests', JSON.stringify(message.tests));
          break;
      }
    };

    window.addEventListener('message', messageListener);

    return () => window.removeEventListener('message', messageListener);
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">Flaky Tests in Jira</h1>
      <FlakyTestList flakyTests={flakyTests} />
    </div>
  );
};

export default App;