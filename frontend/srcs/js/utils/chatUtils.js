export function saveChatHistory(chatHistory) {
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

export function loadChatHistory() {
  const storedChatHistory = localStorage.getItem("chatHistory");
  return storedChatHistory ? JSON.parse(storedChatHistory) : [];
}

export function updateChatHistory(newMessage) {
  let chatHistory = loadChatHistory();

  if (chatHistory.length >= 200) {
    chatHistory.shift();
  }

  chatHistory.push(newMessage);
  saveChatHistory(chatHistory);
}

export function clearChatHistory() {
  localStorage.removeItem("chatHistory");
}
