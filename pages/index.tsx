import { useState } from "react";
import ReactMarkdown from "react-markdown";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();

      const cleaned = data.reply.replace(/<think>[\s\S]*?<\/think>/g, "");

      setMessages((prev) => [...prev, { role: "assistant", content: cleaned }]);
      setInput("");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Terjadi kesalahan saat memproses jawaban.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-800">
          Chatbot Alkitab
        </h1>

        <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto pr-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border prose prose-sm max-w-none ${
                msg.role === "user"
                  ? "bg-blue-50 text-black"
                  : "bg-green-50 text-gray-800"
              }`}
            >
              {msg.role === "user" ? (
                <p>
                  <strong>🧍‍♂️:</strong> {msg.content}
                </p>
              ) : (
                <>
                  <strong>🙏:</strong>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pertanyaan Anda..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Menjawab..." : "Kirim"}
          </button>
        </div>
      </div>
    </main>
  );
}
