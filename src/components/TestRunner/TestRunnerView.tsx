import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCode, 
  RefreshCw, 
  Plus, 
  Filter, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle,
  Layers,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export const TestRunnerView: React.FC = () => {
  const { 
    files, 
    activeFileId, 
    setActiveFileId, 
    testResults, 
    isTesting, 
    runTests, 
    createSampleTestFile,
    setActiveView
  } = useStore();

  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSuites, setExpandedSuites] = useState<Record<string, boolean>>({});

  // Auto-run tests if results are empty on first open
  useEffect(() => {
    if (!testResults.summary && !isTesting) {
      runTests();
    }
  }, []);

  // Expand all suites by default when results change
  useEffect(() => {
    if (testResults.suites.length > 0) {
      const initialExpanded: Record<string, boolean> = {};
      testResults.suites.forEach((s) => {
        initialExpanded[s.suiteName] = true;
      });
      setExpandedSuites(initialExpanded);
    }
  }, [testResults.suites]);

  const toggleSuite = (name: string) => {
    setExpandedSuites((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleRunAll = async () => {
    toast.info('Executing all test suites...');
    await runTests();
    toast.success('Test run completed');
  };

  const handleRunActive = async () => {
    if (!activeFileId) return;
    const current = files.find((f) => f.id === activeFileId);
    toast.info(`Running tests for ${current?.name || 'active file'}...`);
    await runTests(activeFileId);
    toast.success('Test run completed');
  };

  const { suites, summary } = testResults;

  // Filtered suites & test cases
  const filteredSuites = suites
    .map((suite) => {
      const filteredTests = suite.tests.filter((test) => {
        const matchesStatus =
          filterStatus === 'all'
            ? true
            : filterStatus === 'passed'
            ? test.status === 'passed'
            : test.status === 'failed';

        const matchesQuery =
          !searchQuery.trim() ||
          test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.suiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (test.error?.message && test.error.message.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesStatus && matchesQuery;
      });

      return {
        ...suite,
        tests: filteredTests,
      };
    })
    .filter((s) => s.tests.length > 0);

  const totalPassingPct =
    summary && summary.totalTests > 0
      ? Math.round((summary.passedTests / summary.totalTests) * 100)
      : 0;

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden font-sans select-none">
      {/* Top Action Toolbar */}
      <div className="h-12 bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-4 shrink-0 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <CheckSquare size={18} className="text-emerald-400 shrink-0" />
          <h2 className="text-sm font-semibold text-white truncate">Unit Test Runner</h2>
          <Badge variant="outline" className="bg-[#1e1e1e] text-zinc-400 border-[#3e3e42] text-[10px] hidden sm:inline-flex">
            Jest / Vitest Sandbox
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRunAll}
            disabled={isTesting}
            className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5 px-3 shadow-xs"
          >
            {isTesting ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Play size={13} fill="currentColor" />
            )}
            <span>{isTesting ? 'Running...' : 'Run All Tests'}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunActive}
            disabled={isTesting}
            className="h-8 bg-[#2d2d2d] border-[#3e3e42] hover:bg-[#383838] text-[#cccccc] hover:text-white text-xs gap-1.5 hidden md:inline-flex"
          >
            <Play size={12} />
            <span>Run Active File</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={createSampleTestFile}
            className="h-8 bg-[#2d2d2d] border-[#3e3e42] hover:bg-[#383838] text-[#cccccc] hover:text-white text-xs gap-1.5"
            title="Create sample math.test.js file"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New Test File</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveView('editor')}
            className="h-8 text-xs text-[#888888] hover:text-white"
          >
            Back to Editor
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      {summary && (
        <div className="bg-[#181818] border-b border-[#2d2d2d] p-4 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl">
            {/* Total Tests */}
            <div className="bg-[#252526] border border-[#333333] rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[11px] text-[#888888] font-medium">Total Tests</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-white">{summary.totalTests}</span>
                <span className="text-xs text-[#888888]">in {summary.totalSuites} suites</span>
              </div>
            </div>

            {/* Passed Tests */}
            <div className="bg-[#252526] border border-[#333333] rounded-lg p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                <span>Passed</span>
                <CheckCircle2 size={13} />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-emerald-400">{summary.passedTests}</span>
                <span className="text-xs text-[#888888]">{totalPassingPct}% passing</span>
              </div>
            </div>

            {/* Failed Tests */}
            <div className="bg-[#252526] border border-[#333333] rounded-lg p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-rose-400 font-medium">
                <span>Failed</span>
                <XCircle size={13} />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-rose-400">{summary.failedTests}</span>
                <span className="text-xs text-[#888888]">errors</span>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-[#252526] border border-[#333333] rounded-lg p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-cyan-400 font-medium">
                <span>Duration</span>
                <Clock size={13} />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-cyan-400">{summary.duration} ms</span>
                <span className="text-xs text-[#888888]">total</span>
              </div>
            </div>
          </div>

          {/* Progress Strip */}
          <div className="mt-3 w-full bg-[#2d2d2d] rounded-full h-1.5 overflow-hidden flex max-w-4xl">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${totalPassingPct}%` }}
            />
            <div 
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${100 - totalPassingPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter Bar & Search */}
      <div className="h-10 bg-[#252526] border-b border-[#333333] flex items-center justify-between px-4 shrink-0 gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              filterStatus === 'all' 
                ? 'bg-[#3e3e42] text-white font-medium' 
                : 'text-[#888888] hover:text-[#cccccc]'
            }`}
          >
            All Tests
          </button>
          <button
            onClick={() => setFilterStatus('passed')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              filterStatus === 'passed' 
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-medium' 
                : 'text-[#888888] hover:text-emerald-400'
            }`}
          >
            Passed ({summary?.passedTests || 0})
          </button>
          <button
            onClick={() => setFilterStatus('failed')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              filterStatus === 'failed' 
                ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 font-medium' 
                : 'text-[#888888] hover:text-rose-400'
            }`}
          >
            Failed ({summary?.failedTests || 0})
          </button>
        </div>

        <div className="relative flex items-center max-w-xs w-full">
          <Search size={13} className="absolute left-2.5 text-[#888888]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test names or errors..."
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded-md pl-8 pr-3 py-1 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#007acc]"
          />
        </div>
      </div>

      {/* Main Suites & Test List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredSuites.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#333333] rounded-xl bg-[#252526]/50">
            <CheckSquare size={32} className="text-[#666666] mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">No Test Results Matching Criteria</h3>
            <p className="text-xs text-[#888888] max-w-md mb-4">
              Write test cases in any workspace file or create a dedicated <code className="text-emerald-400 font-mono">*.test.js</code> file using <code className="text-cyan-400 font-mono">describe()</code> and <code className="text-amber-400 font-mono">expect()</code>.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleRunAll}
                className="h-8 bg-[#007acc] hover:bg-[#006bb3] text-white text-xs gap-1.5"
              >
                <Play size={12} />
                Run All Tests
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={createSampleTestFile}
                className="h-8 bg-[#2d2d2d] border-[#3e3e42] text-xs text-[#cccccc] hover:text-white"
              >
                Create Sample Tests
              </Button>
            </div>
          </div>
        ) : (
          filteredSuites.map((suite) => {
            const isExpanded = expandedSuites[suite.suiteName] ?? true;
            const passedCount = suite.tests.filter((t) => t.status === 'passed').length;
            const isSuitePassed = suite.status === 'passed';

            return (
              <div 
                key={suite.suiteName}
                className="border border-[#333333] rounded-lg bg-[#252526] overflow-hidden shadow-xs transition-all"
              >
                {/* Suite Accordion Header */}
                <div 
                  onClick={() => toggleSuite(suite.suiteName)}
                  className="px-3.5 py-2.5 bg-[#2a2a2c] flex items-center justify-between cursor-pointer hover:bg-[#303033] border-b border-[#333333] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[#888888]">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>

                    <span className={`px-2 py-0.5 text-[10px] font-bold font-mono uppercase rounded ${
                      isSuitePassed 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80' 
                        : 'bg-rose-950 text-rose-400 border border-rose-800/80'
                    }`}>
                      {isSuitePassed ? 'PASS' : 'FAIL'}
                    </span>

                    <span className="text-xs font-semibold text-white truncate">
                      {suite.suiteName}
                    </span>

                    <span className="text-[11px] text-[#888888] font-mono">
                      ({passedCount}/{suite.tests.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#777777] font-mono">
                      {suite.duration} ms
                    </span>
                    <button
                      title="Open test file"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFileId(suite.fileId);
                        setActiveView('editor');
                      }}
                      className="p-1 rounded text-[#888888] hover:text-white hover:bg-[#3e3e42] transition-colors"
                    >
                      <FileCode size={13} />
                    </button>
                  </div>
                </div>

                {/* Test Cases inside Suite */}
                {isExpanded && (
                  <div className="divide-y divide-[#2d2d2d] bg-[#1e1e1e]">
                    {suite.tests.map((test) => {
                      const isPassed = test.status === 'passed';
                      return (
                        <div key={test.id} className="p-3 text-xs flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {isPassed ? (
                                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                              ) : (
                                <XCircle size={15} className="text-rose-400 shrink-0" />
                              )}
                              <span className={`font-medium ${isPassed ? 'text-[#dddddd]' : 'text-rose-300 font-semibold'}`}>
                                {test.name}
                              </span>
                            </div>

                            <span className="text-[11px] text-[#777777] font-mono">
                              {test.duration} ms
                            </span>
                          </div>

                          {/* Error Stack and Details for Failed Tests */}
                          {!isPassed && test.error && (
                            <div className="ml-6 mt-1 p-3 bg-rose-950/30 border border-rose-900/60 rounded-md font-mono text-[11px] text-rose-200 space-y-2">
                              <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                                <AlertTriangle size={13} />
                                <span>{test.error.message}</span>
                              </div>

                              {test.error.expected !== undefined && test.error.received !== undefined && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                  <div className="p-2 bg-black/40 rounded border border-emerald-900/40">
                                    <span className="text-[10px] uppercase text-emerald-400 font-bold block mb-1">
                                      Expected
                                    </span>
                                    <pre className="text-emerald-300 whitespace-pre-wrap text-[10px]">
                                      {typeof test.error.expected === 'object' 
                                        ? JSON.stringify(test.error.expected, null, 2) 
                                        : String(test.error.expected)}
                                    </pre>
                                  </div>

                                  <div className="p-2 bg-black/40 rounded border border-rose-900/40">
                                    <span className="text-[10px] uppercase text-rose-400 font-bold block mb-1">
                                      Received
                                    </span>
                                    <pre className="text-rose-300 whitespace-pre-wrap text-[10px]">
                                      {typeof test.error.received === 'object' 
                                        ? JSON.stringify(test.error.received, null, 2) 
                                        : String(test.error.received)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {test.error.stack && (
                                <details className="mt-2 text-[10px] text-[#888888] cursor-pointer">
                                  <summary className="hover:text-rose-300">View Stack Trace</summary>
                                  <pre className="mt-1 p-2 bg-black/50 rounded overflow-x-auto text-[#aaaaaa]">
                                    {test.error.stack}
                                  </pre>
                                </details>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
