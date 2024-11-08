export function saveMessages(messages: any[]) {
  try {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
}

export function loadMessages() {
  try {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
}