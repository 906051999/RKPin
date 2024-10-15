let abortController = null;

async function chatWithGLM4(messages, useWebSearch = false, customSearchQuery = null, useStream = true) {
  try {
    // 如果存在之前的 AbortController，先中止它
    if (abortController) {
      abortController.abort();
    }

    // 创建新的 AbortController
    abortController = new AbortController();
    const signal = abortController.signal;

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        messages: messages,
        stream: useStream,
        tools: useWebSearch ? [{
          type: "web_search",
          web_search: {
            enable: true,
          }
        }] : undefined
      }),
      signal: signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return useStream ? response.body : await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fetch aborted');
    } else {
      console.error('Chat error:', error);
    }
    throw error;
  }
}

// 添加中止函数
function abortChat() {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
}

export { chatWithGLM4, abortChat };
