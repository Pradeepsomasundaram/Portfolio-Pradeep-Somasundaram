export interface AgentTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** Raised when the live agent can't answer, so callers can fall back to the
 * built-in rule-based assistant. `message` is safe to show to visitors. */
export class AgentUnavailableError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

const ENDPOINT = '/.netlify/functions/assistant';
const REQUEST_TIMEOUT_MS = 45_000;

const friendlyErrors: Record<string, string> = {
  rate_limited: "You've reached the hourly limit for live AI answers.",
  capacity: "Live AI answers have hit today's capacity.",
  busy: 'The AI is busy right now.',
  refused: "The AI couldn't answer that one.",
  model_unavailable: 'The AI model is unavailable right now.',
};

export const toolLabels: Record<string, string> = {
  search_projects: 'Searching projects',
  get_profile_section: 'Reading profile',
  match_job_description: 'Matching job description',
  get_github_activity: 'Checking live GitHub',
  show_section: 'Navigating the page',
  open_project: 'Opening project',
};

export type TraceEntry =
  | { kind: 'model'; turn: number; ms: number; tokens?: number }
  | { kind: 'tool'; name: string; args: string; result: string; isError: boolean; ms: number };

export interface AgentAction {
  action: 'scroll' | 'open_project';
  target: string;
}

interface Handlers {
  onText: (chunk: string) => void;
  onTool: (name: string) => void;
  onAction?: (action: AgentAction) => void;
  onTrace?: (entry: TraceEntry) => void;
}

interface Options {
  visitor?: { company?: string; role?: string };
  trace?: boolean;
}

/** Streams an answer from the serverless agent. Resolves with the tools it used. */
export async function askAgent(
  history: AgentTurn[],
  { onText, onTool, onAction, onTrace }: Handlers,
  options: Options = {}
): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const tools: string[] = [];

  try {
    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, visitor: options.visitor, trace: options.trace }),
        signal: controller.signal,
      });
    } catch {
      throw new AgentUnavailableError('network', 'Live AI is unreachable.');
    }

    // Static hosting / local dev without the function returns 404 or the SPA HTML.
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !type.includes('text/event-stream') || !res.body) {
      let code = res.status === 404 || type.includes('text/html') ? 'unavailable' : 'error';
      let message = 'Live AI is unavailable.';
      if (type.includes('application/json')) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        code = data.error ?? code;
        message = data.message ?? friendlyErrors[code] ?? message;
      }
      throw new AgentUnavailableError(code, message);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let receivedText = false;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const line = buffer.slice(0, boundary).replace(/^data: /, '');
        buffer = buffer.slice(boundary + 2);
        let event: { type: string; kind?: string; text?: string; name?: string; code?: string; action?: AgentAction['action']; target?: string } & Record<string, unknown>;
        try {
          event = JSON.parse(line);
        } catch {
          continue;
        }
        if (event.type === 'text' && event.text) {
          receivedText = true;
          onText(event.text);
        } else if (event.type === 'tool' && event.name) {
          if (!tools.includes(event.name)) tools.push(event.name);
          onTool(event.name);
        } else if (event.type === 'trace') {
          onTrace?.(event as unknown as TraceEntry);
        } else if (event.type === 'action' && event.action && event.target) {
          onAction?.({ action: event.action, target: event.target });
        } else if (event.type === 'error') {
          const code = event.code ?? 'error';
          // Once text has streamed there's nothing to fall back to; keep what we have.
          if (receivedText) return tools;
          throw new AgentUnavailableError(code, friendlyErrors[code] ?? 'Live AI is unavailable.');
        }
      }
    }
    return tools;
  } catch (err) {
    if (err instanceof AgentUnavailableError) throw err;
    throw new AgentUnavailableError('network', 'Live AI is unreachable.');
  } finally {
    clearTimeout(timer);
  }
}
