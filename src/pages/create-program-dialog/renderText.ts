
// Optimized Markdown rendering function
import i18n from '@/i18n';

export const renderMarkdown = (content: string) => {
    // Helper to escape HTML
    const escapeHtml = (str: string) => str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m] || m);

    const codeBlocks: string[] = [];
    let processed = content;

    // 1. Extract complete code blocks
    processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<pre class="bg-muted p-3 rounded-lg overflow-x-auto my-2 font-mono"><code class="text-sm whitespace-pre-wrap">${escapeHtml(code)}</code></pre>`);
        return placeholder;
    });

    // 2. Handle incomplete code block at the end (for streaming)
    const incompleteBlockRegex = /```(\w+)?\n([\s\S]*)$/;
    const matchIncomplete = processed.match(incompleteBlockRegex);
    if (matchIncomplete) {
        const lang = matchIncomplete[1];
        const code = matchIncomplete[2];
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<pre class="bg-muted p-3 rounded-lg overflow-x-auto my-2 font-mono"><code class="text-sm whitespace-pre-wrap">${escapeHtml(code)}</code></pre>`);
        processed = processed.replace(incompleteBlockRegex, placeholder);
    }

    // Extract inline code
    processed = processed.replace(/`([^`]+)`/g, (match, code) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">${escapeHtml(code)}</code>`);
        return placeholder;
    });

    let html = processed
        // Bold
        .replace(/\*\*([\s\S]*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        // Italic
        .replace(/\*([\s\S]*?)\*/g, '<em class="italic">$1</em>')
        // Link
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
        // Heading
        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
        // List
        .replace(/^\d+\.\s+(.*$)/gm, '<li class="ml-4 list-decimal mb-1">$1</li>')
        .replace(/^[-*]\s+(.*$)/gm, '<li class="ml-4 list-disc mb-1">$1</li>')
        // Blockquote
        .replace(/^>\s*(.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 my-2 text-muted-foreground italic">$1</blockquote>')
        // Line break
        .replace(/\n\n/g, '</p><p class="mb-2">')
        .replace(/\n/g, '<br/>');

    if (html && !html.startsWith('<')) {
        html = '<p class="mb-2">' + html + '</p>';
    }

    // Restore code blocks
    codeBlocks.forEach((block, index) => {
        html = html.replace(`__CODE_BLOCK_${index}__`, block);
    });

    return html;
};

export const injectLogInterceptor = (html: string) => {
    const script = `
    <script>
      (function() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        function sendLog(type, args) {
          try {
            const content = args.map(arg => {
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch(e) {
                  return String(arg);
                }
              }
              return String(arg);
            }).join(' ');
            
            window.parent.postMessage({
              type: 'program-log',
              logType: type,
              content: content,
              timestamp: new Date().toLocaleTimeString()
            }, '*');
          } catch (e) {
            // ignore
          }
        }

        console.log = function(...args) {
          sendLog('log', args);
          originalLog.apply(console, args);
        };
        console.error = function(...args) {
          sendLog('error', args);
          originalError.apply(console, args);
        };
        console.warn = function(...args) {
          sendLog('warn', args);
          originalWarn.apply(console, args);
        };
        console.info = function(...args) {
          sendLog('info', args);
          originalInfo.apply(console, args);
        };

        window.onerror = function(msg, url, line, col, error) {
          sendLog('error', [msg]);
          return false;
        };
      })();
    </script>
  `;

    if (html.includes('<head>')) {
        return html.replace('<head>', '<head>' + script);
    }
    return script + html;
};

export const extractCode = (content: string) => {
    // 1. Try to find a complete HTML block
    const codeBlockRegex = /```\s*html([\s\S]*?)```/i;
    const match = content.match(codeBlockRegex);
    if (match && match[1]) {
        return match[1].trim();
    }

    // 2. Try to find an incomplete HTML block (streaming)
    const incompleteCodeBlockRegex = /```\s*html([\s\S]*)$/i;
    const matchIncomplete = content.match(incompleteCodeBlockRegex);
    if (matchIncomplete && matchIncomplete[1]) {
        return matchIncomplete[1].trim();
    }

    // 3. Fallback: try to find any code block if it looks like HTML
    const anyCodeBlockRegex = /```([\s\S]*?)```/;
    const matchAny = content.match(anyCodeBlockRegex);
    if (matchAny && matchAny[1]) {
        if (matchAny[1].includes('<html') || matchAny[1].includes('<!DOCTYPE')) {
            return matchAny[1].trim();
        }
    }

    // 4. Fallback for incomplete any block
    const incompleteAnyBlockRegex = /```([\s\S]*)$/;
    const matchIncompleteAny = content.match(incompleteAnyBlockRegex);
    if (matchIncompleteAny && matchIncompleteAny[1]) {
        if (matchIncompleteAny[1].includes('<html') || matchIncompleteAny[1].includes('<!DOCTYPE')) {
            return matchIncompleteAny[1].trim();
        }
    }

    // 5. Fallback: Raw HTML without markdown blocks
    const trimmed = content.trim();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
        return trimmed;
    }

    return null;
};

export const getSystemPrompt = (generatedCode: string = '') => {
    return i18n.t('program.system_prompt', { generatedCode });
};
