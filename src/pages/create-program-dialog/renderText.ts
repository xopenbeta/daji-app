
// 优化的Markdown渲染函数
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
        // 粗体
        .replace(/\*\*([\s\S]*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        // 斜体
        .replace(/\*([\s\S]*?)\*/g, '<em class="italic">$1</em>')
        // 链接
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
        // 标题
        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
        // 列表
        .replace(/^\d+\.\s+(.*$)/gm, '<li class="ml-4 list-decimal mb-1">$1</li>')
        .replace(/^[-*]\s+(.*$)/gm, '<li class="ml-4 list-disc mb-1">$1</li>')
        // 引用
        .replace(/^>\s*(.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 my-2 text-muted-foreground italic">$1</blockquote>')
        // 换行
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

export const systemPrompt = `你是一个专业的Web前端开发专家。
你的任务是根据用户的需求生成一个单文件的HTML小程序。
要求：
1. 代码必须包含在一个完整的HTML文件中。
2. CSS样式请写在<style>标签中，风格样式类似于下面这个prompt（当然你没法用tailwindcss）。
···
"Create a React component using Tailwind CSS and shadcn/ui design principles. The aesthetic should be 'Linear-style' or 'Vercel-style' modern developer tool interface.

Key Design Requirements:

Theme: Minimalist, clean, and high-contrast. Support Dark Mode with a deep black background (e.g., #030303) and subtle borders (e.g., border-white/5 or white/10).
Background: Implement a subtle grid pattern background with a radial mask to fade it out edges, and add a faint, blurred ambient glow (gradient blob) at the top or behind key elements.
Typography: Use a sans-serif font (Inter/Geist style). Use small text sizes (text-sm, text-xs) with muted colors (text-gray-500) for secondary information.
Components:
Cards: Flat backgrounds with thin, subtle borders.
Buttons: Use 'Ghost' or 'Outline' variants for secondary actions.
Icons: Use Lucide-react icons, sized small (w-4 h-4).
Interactivity: Add subtle hover states (e.g., hover:bg-white/5) and smooth transitions (transition-all).
Layout: Use Flexbox and Grid for a responsive dashboard-like structure."
···
3. JavaScript逻辑请写在<script>标签中。
4. 界面美观，交互流畅，默认白色背景，主题色是蓝色，小程序占满全屏幕，外围没有border和margin。
5. 请在代码的关键逻辑处添加 console.log/error/warn 日志，但是界面上不要显示这些日志，不要有日志面板。
6. 请直接输出代码，每一行代码上都要加上注释。
7. 如果需要修改现有代码，请输出完整的修改后的代码。
8. 代码应该尽可能的少，样式应该尽可能的少，功能应该尽可能的少，仅仅满足用户提出的问题即可。
9. 生成的代码越少，功能才会越正确。
10. 请务必将代码包裹在 \`\`\`html ... \`\`\` 代码块中。
当前已有代码（如果有）：
\${generatedCode}
`;
