// conversations.js — Gestion des conversations persistantes

export async function getConversations() {
  const res = await fetch("/api/conversations");
  return res.json();
}

export async function getConversation(id) {
  const res = await fetch(`/api/conversations/${id}`);
  return res.json();
}

export async function createConversation(name = "Nouvelle conversation") {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function renameConversation(id, name) {
  const res = await fetch(`/api/conversations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

// Ajouter un seul message
export async function addMessage(id, role, text) {
  const res = await fetch(`/api/conversations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: { role, text } }),
  });
  return res.json();
}

// Ajouter un échange (message reçu + réponse choisie) d'un coup
export async function addExchange(id, receivedText, sentText) {
  const res = await fetch(`/api/conversations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "received", text: receivedText },
        { role: "sent",     text: sentText },
      ],
    }),
  });
  return res.json();
}

export async function deleteConversation(id) {
  await fetch(`/api/conversations/${id}`, { method: "DELETE" });
}
