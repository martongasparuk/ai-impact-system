// AI Impact Scorecard — multi-step question flow at /audit/start
// State machine + keyboard nav + localStorage resume.

import { useEffect, useMemo, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  preQualifyingQuestions,
  scoringQuestions,
  standardOptions,
  type ContextQuestion,
  type ScoringQuestion,
} from './questions';
import type { ScoreLetter, Answers } from './scoring';

// ────────── Types + constants ──────────

type Step =
  | { kind: 'context'; index: number; question: ContextQuestion }
  | { kind: 'scoring'; index: number; question: ScoringQuestion };

const STORAGE_KEY = 'ais-scorecard-answers-v1';
const STORAGE_INDEX_KEY = 'ais-scorecard-step-v1';

const totalSteps =
  preQualifyingQuestions.length + scoringQuestions.length;

const flatSteps: Step[] = [
  ...preQualifyingQuestions.map((q, i) => ({ kind: 'context' as const, index: i, question: q })),
  ...scoringQuestions.map((q, i) => ({ kind: 'scoring' as const, index: i, question: q })),
];

// ────────── Reducer ──────────

type State = {
  answers: Answers;
  stepIndex: number;
};

type Action =
  | { type: 'SELECT_CONTEXT'; questionId: string; value: string }
  | { type: 'SELECT_SCORING'; questionId: string; value: ScoreLetter }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'RESET' }
  | { type: 'RESTORE'; state: State };

const initialState: State = {
  answers: { context: {}, scoring: {} },
  stepIndex: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SELECT_CONTEXT':
      return {
        ...state,
        answers: {
          ...state.answers,
          context: { ...state.answers.context, [action.questionId]: action.value },
        },
      };
    case 'SELECT_SCORING':
      return {
        ...state,
        answers: {
          ...state.answers,
          scoring: { ...state.answers.scoring, [action.questionId]: action.value },
        },
      };
    case 'NEXT':
      return { ...state, stepIndex: Math.min(state.stepIndex + 1, totalSteps - 1) };
    case 'PREV':
      return { ...state, stepIndex: Math.max(state.stepIndex - 1, 0) };
    case 'RESET':
      return initialState;
    case 'RESTORE':
      return action.state;
    default:
      return state;
  }
}

// ────────── Component ──────────

export default function ScorecardFlow() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const rawIndex = localStorage.getItem(STORAGE_INDEX_KEY);
      if (raw) {
        const answers = JSON.parse(raw) as Answers;
        const stepIndex = rawIndex ? Math.min(parseInt(rawIndex, 10), totalSteps - 1) : 0;
        dispatch({ type: 'RESTORE', state: { answers, stepIndex } });
      }
    } catch {
      // ignore corrupted storage
    }
    document.title = 'Taking the AI Strategy Gap Audit…';
  }, []);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.answers));
      localStorage.setItem(STORAGE_INDEX_KEY, String(state.stepIndex));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const current = flatSteps[state.stepIndex];
  const progress = ((state.stepIndex + 1) / totalSteps) * 100;

  const currentAnswer = useMemo(() => {
    if (current.kind === 'context')
      return state.answers.context[current.question.id];
    return state.answers.scoring[current.question.id];
  }, [current, state.answers]);

  const canGoNext = Boolean(currentAnswer);
  const isLastStep = state.stepIndex === totalSteps - 1;

  const handleSelect = (value: string) => {
    if (current.kind === 'context') {
      dispatch({ type: 'SELECT_CONTEXT', questionId: current.question.id, value });
    } else {
      dispatch({
        type: 'SELECT_SCORING',
        questionId: current.question.id,
        value: value as ScoreLetter,
      });
    }
  };

  const handleNext = () => {
    if (!canGoNext) return;
    if (isLastStep) {
      navigate('/audit/result');
    } else {
      dispatch({ type: 'NEXT' });
    }
  };

  const handlePrev = () => {
    dispatch({ type: 'PREV' });
  };

  // Keyboard shortcuts: 1-5 selects options A-E, arrows navigate, Enter = next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const options = current.kind === 'context'
        ? current.question.options
        : standardOptions;
      const n = parseInt(e.key, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= options.length) {
        const value = options[n - 1].value;
        handleSelect(value);
        return;
      }
      const letter = e.key.toUpperCase();
      if (current.kind === 'scoring' && ['A', 'B', 'C', 'D', 'E'].includes(letter)) {
        handleSelect(letter);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, state.stepIndex, canGoNext]);

  const currentOptions =
    current.kind === 'context' ? current.question.options : standardOptions;

  const sectionLabel =
    current.kind === 'context'
      ? `Context · ${current.index + 1} of ${preQualifyingQuestions.length}`
      : `${current.question.pillar} · ${current.index + 1} of ${scoringQuestions.length}`;

  return (
    <div className="min-h-screen bg-dark-950 text-gray-200 font-sans antialiased">
      {/* Top bar with progress */}
      <header className="border-b border-dark-700 sticky top-0 bg-dark-950/95 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <a href="/audit" className="text-white font-bold tracking-tight text-base">
              AI Impact System · Audit
            </a>
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {state.stepIndex + 1} / {totalSteps}
            </span>
          </div>
          <div className="h-1 w-full bg-dark-700 rounded overflow-hidden">
            <div
              className="h-full bg-accent-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Question */}
      <main className="max-w-2xl mx-auto px-6 pt-14 pb-32">
        <p className="text-xs uppercase tracking-[0.22em] text-accent-400 font-semibold mb-6">
          {sectionLabel}
        </p>

        <h1 className="text-3xl md:text-[34px] font-bold text-white leading-[1.2] mb-10">
          {current.question.prompt}
        </h1>

        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Answer options">
          {currentOptions.map((opt, i) => {
            const selected = currentAnswer === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => handleSelect(opt.value)}
                className={[
                  'text-left px-5 py-4 rounded-lg border transition-all',
                  'flex items-start gap-4',
                  selected
                    ? 'bg-accent-500/15 border-accent-500 text-white'
                    : 'bg-dark-800 border-dark-600 text-gray-300 hover:border-dark-500 hover:bg-dark-700',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold',
                    selected ? 'bg-accent-500 text-white' : 'bg-dark-700 text-gray-400',
                  ].join(' ')}
                >
                  {i + 1}
                </span>
                <span className="leading-snug pt-0.5">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-600 mt-6">
          Tip: press{' '}
          <kbd className="px-1.5 py-0.5 bg-dark-800 border border-dark-600 rounded text-gray-400 font-mono">
            1–{currentOptions.length}
          </kbd>{' '}
          to select,{' '}
          <kbd className="px-1.5 py-0.5 bg-dark-800 border border-dark-600 rounded text-gray-400 font-mono">
            ↵
          </kbd>{' '}
          to continue.
        </p>
      </main>

      {/* Footer nav */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-dark-700 bg-dark-950/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={state.stepIndex === 0}
            className="text-sm text-gray-400 hover:text-white disabled:text-gray-700 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className={[
              'px-7 py-3 rounded-lg text-sm font-semibold transition-colors',
              canGoNext
                ? 'bg-accent-500 hover:bg-accent-600 text-white'
                : 'bg-dark-700 text-gray-600 cursor-not-allowed',
            ].join(' ')}
          >
            {isLastStep ? 'See my score →' : 'Next →'}
          </button>
        </div>
      </footer>
    </div>
  );
}
