document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const adminPasswordInput = document.getElementById('adminPassword');
  const togglePasswordButton = document.getElementById('togglePasswordButton');
  const limitSelect = document.getElementById('limitSelect');
  const refreshButton = document.getElementById('refreshButton');
  const exportCsvButton = document.getElementById('exportCsvButton');
  const exportJsonButton = document.getElementById('exportJsonButton');
  const logoutButton = document.getElementById('logoutButton');
  const feedbackMessage = document.getElementById('feedbackMessage');
  const connectionStatus = document.getElementById('connectionStatus');
  const messageCount = document.getElementById('messageCount');
  const latestSubject = document.getElementById('latestSubject');
  const latestSender = document.getElementById('latestSender');
  const lastUpdated = document.getElementById('lastUpdated');
  const messagesList = document.getElementById('messagesList');

  const apiBaseUrls = [''];

  const storageKey = 'portfolio-admin-password';
  let adminPassword = sessionStorage.getItem(storageKey) || '';
  let loadedMessages = [];

  if (adminPassword) {
    adminPasswordInput.value = adminPassword;
    setSignedInState(true);
    loadMessages();
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    adminPassword = adminPasswordInput.value.trim();

    if (!adminPassword) {
      setFeedback('Enter your admin password first.', 'error');
      return;
    }

    sessionStorage.setItem(storageKey, adminPassword);
    setSignedInState(true);
    await loadMessages();
  });

  togglePasswordButton.addEventListener('click', () => {
    const shouldShowPassword = adminPasswordInput.type === 'password';
    adminPasswordInput.type = shouldShowPassword ? 'text' : 'password';
    togglePasswordButton.textContent = shouldShowPassword ? 'Hide' : 'Show';
  });

  refreshButton.addEventListener('click', async () => {
    await loadMessages();
  });

  exportCsvButton.addEventListener('click', () => {
    if (!loadedMessages.length) {
      setFeedback('There are no messages to export yet.', 'error');
      return;
    }

    const lines = [
      ['name', 'email', 'subject', 'message', 'submittedAt', 'createdAt', 'updatedAt']
        .map(toCsvField)
        .join(','),
      ...loadedMessages.map((message) =>
        [
          message.name || '',
          message.email || '',
          message.subject || '',
          message.message || '',
          message.submittedAt || '',
          message.createdAt || '',
          message.updatedAt || '',
        ]
          .map(toCsvField)
          .join(',')
      ),
    ];

    downloadFile(lines.join('\n'), 'portfolio-messages.csv', 'text/csv;charset=utf-8;');
    setFeedback('CSV export downloaded.', 'success');
  });

  exportJsonButton.addEventListener('click', () => {
    if (!loadedMessages.length) {
      setFeedback('There are no messages to export yet.', 'error');
      return;
    }

    downloadFile(
      JSON.stringify(loadedMessages, null, 2),
      'portfolio-messages.json',
      'application/json;charset=utf-8;'
    );
    setFeedback('JSON export downloaded.', 'success');
  });

  logoutButton.addEventListener('click', () => {
    adminPassword = '';
    loadedMessages = [];
    sessionStorage.removeItem(storageKey);
    adminPasswordInput.value = '';
    adminPasswordInput.type = 'password';
    togglePasswordButton.textContent = 'Show';
    setSignedInState(false);
    setStatus('Waiting for sign in');
    setFeedback('Logged out.', 'success');
    renderEmptyState('Locked', 'Enter your admin password to load saved contact submissions.');
    updateStats([]);
  });

  limitSelect.addEventListener('change', async () => {
    if (!adminPassword) {
      return;
    }
    await loadMessages();
  });

  messagesList.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('[data-action="delete-message"]');
    if (!deleteButton) {
      return;
    }

    const messageId = deleteButton.getAttribute('data-id');
    const senderName = deleteButton.getAttribute('data-name') || 'this sender';

    if (!messageId) {
      return;
    }

    const confirmed = window.confirm(`Delete the message from ${senderName}?`);
    if (!confirmed) {
      return;
    }

    deleteButton.disabled = true;
    await deleteMessage(messageId);
  });

  async function loadMessages() {
    if (!adminPassword) {
      setFeedback('Enter your admin password first.', 'error');
      return;
    }

    setBusyState(true);
    setStatus('Loading messages...');
    setFeedback('Fetching latest submissions...', '');

    try {
      const { response, payload } = await fetchWithFallback(
        `/api/admin/messages?limit=${encodeURIComponent(limitSelect.value)}`,
        {
          headers: {
            'x-admin-password': adminPassword,
          },
        }
      );

      if (!response.ok) {
        handleLoadError(response.status, payload);
        return;
      }

      loadedMessages = Array.isArray(payload.messages) ? payload.messages : [];
      renderMessages(loadedMessages);
      updateStats(loadedMessages);
      setStatus('Connected', 'ready');
      setFeedback(`Loaded ${loadedMessages.length} message${loadedMessages.length === 1 ? '' : 's'}.`, 'success');
    } catch (error) {
      setStatus('Server offline', 'error');
      setFeedback('Could not reach the server. Please try again later.', 'error');
    } finally {
      setBusyState(false);
    }
  }

  async function deleteMessage(messageId) {
    try {
      const { response, payload } = await fetchWithFallback(`/api/admin/messages/${encodeURIComponent(messageId)}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': adminPassword,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setSignedInState(false);
          sessionStorage.removeItem(storageKey);
          setStatus('Access denied', 'error');
          setFeedback('Your session is no longer authorized. Sign in again.', 'error');
          return;
        }

        setFeedback(payload.error || 'Could not delete the message right now.', 'error');
        return;
      }

      loadedMessages = loadedMessages.filter((message) => message._id !== messageId);
      renderMessages(loadedMessages);
      updateStats(loadedMessages);
      setFeedback(payload.message || 'Message deleted successfully.', 'success');
    } catch (error) {
      setFeedback('Delete request failed because the backend is not reachable.', 'error');
    }
  }

  async function fetchWithFallback(path, options = {}) {
    let lastError = null;

    for (const apiBaseUrl of apiBaseUrls) {
      try {
        const response = await fetch(`${apiBaseUrl}${path}`, options);
        const payload = await response.json().catch(() => ({}));
        return { response, payload };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Backend unreachable');
  }

  function handleLoadError(statusCode, payload) {
    if (statusCode === 401) {
      setSignedInState(false);
      sessionStorage.removeItem(storageKey);
      setStatus('Access denied', 'error');
      setFeedback('Wrong admin password. Please try again.', 'error');
      renderEmptyState('Access denied', 'The server rejected the password for this admin page.');
      updateStats([]);
      return;
    }

    setStatus('Request failed', 'error');
    setFeedback(payload.error || 'Could not load messages right now.', 'error');
  }

  function renderMessages(messages) {
    if (!messages.length) {
      renderEmptyState('No messages yet', 'New contact submissions will appear here as soon as visitors send them.');
      return;
    }

    messagesList.innerHTML = messages
      .map((message) => {
        const submittedAt = message.submittedAt ? formatDate(message.submittedAt) : 'Unknown time';
        const subject = message.subject ? escapeHtml(message.subject) : 'No subject';
        const safeName = escapeHtml(message.name || 'Unknown sender');
        const safeEmail = escapeHtml(message.email || 'No email');
        const safeMessage = escapeHtml(message.message || '');
        const safeId = escapeHtml(message._id || '');

        return `
          <article class="message-card">
            <div class="message-top">
              <div class="message-top-left">
                <h3 class="message-name">${safeName}</h3>
                <a class="message-email" href="mailto:${safeEmail}">${safeEmail}</a>
              </div>
              <div class="message-meta">${submittedAt}</div>
            </div>

            <div class="message-footer">
              <span class="message-chip">${subject}</span>
              <button
                type="button"
                class="delete-btn"
                data-action="delete-message"
                data-id="${safeId}"
                data-name="${safeName}"
              >
                Delete
              </button>
            </div>

            <p class="message-body">${safeMessage}</p>
          </article>
        `;
      })
      .join('');
  }

  function renderEmptyState(title, body) {
    messagesList.innerHTML = `
      <div class="empty-state">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(body)}</p>
      </div>
    `;
  }

  function updateStats(messages) {
    messageCount.textContent = String(messages.length);
    latestSubject.textContent = messages.length
      ? messages[0].subject || 'No subject'
      : 'No data';
    latestSender.textContent = messages.length
      ? messages[0].name || 'Unknown sender'
      : 'No data';
    lastUpdated.textContent = messages.length
      ? formatDate(new Date().toISOString())
      : 'Not loaded';
  }

  function setSignedInState(isSignedIn) {
    refreshButton.disabled = !isSignedIn;
    exportCsvButton.disabled = !isSignedIn;
    exportJsonButton.disabled = !isSignedIn;
    logoutButton.disabled = !isSignedIn;
  }

  function setBusyState(isBusy) {
    refreshButton.disabled = isBusy || !adminPassword;
    exportCsvButton.disabled = isBusy || !adminPassword;
    exportJsonButton.disabled = isBusy || !adminPassword;
    logoutButton.disabled = isBusy || !adminPassword;
  }

  function setFeedback(message, type) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = type ? `feedback-message ${type}` : 'feedback-message';
  }

  function setStatus(message, tone = '') {
    connectionStatus.textContent = message;
    connectionStatus.className = tone ? `status-pill ${tone}` : 'status-pill';
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Unknown time';
    }
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function toCsvField(value) {
    return `"${String(value || '').replaceAll('"', '""')}"`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
});
