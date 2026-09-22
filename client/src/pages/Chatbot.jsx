import { useState } from "react";
import "./Chatbot.css";

export default function Chatbot({ embedded = false }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I'm your CourieGo assistant. How can I help you?",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    const userMessage = {
      sender: "user",
      text: trimmedQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data = await response.json();

      const botMessage = {
        sender: "bot",
        text:
          data.reply ||
          data.message ||
          "Sorry, I could not understand that.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={embedded ? "chatbot-embedded" : "chatbot-page"}>
      <div className="chatbot-container">

        <div className="chatbot-header">
          <div>
            <h1>CourieGo Assistant</h1>
            <p>How can we help you today?</p>
          </div>

          <div className="chatbot-status">
            <span className="status-dot"></span>
            Online
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-row ${message.sender}`}
            >
              <div className={`message ${message.sender}`}>
                <span className="message-label">
                  {message.sender === "user"
                    ? "You"
                    : "CourieGo Bot"}
                </span>

                <p>{message.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row bot">
              <div className="message bot thinking">
                <span className="message-label">
                  CourieGo Bot
                </span>
                <p>Thinking...</p>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            rows="1"
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={!question.trim() || loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>

      </div>
    </div>
  );
}