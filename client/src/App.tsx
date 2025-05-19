"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Terminal, ChevronRight, Loader, X, Minus, Square } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const App: React.FC = () => {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load and when clicking terminal
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleTerminalClick = () => {
    inputRef.current?.focus()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!input.trim()) return

  const userMessage: Message = { role: "user", content: input, timestamp: new Date() }
  setMessages((prev) => [...prev, userMessage])
  setInput("")
  setIsLoading(true)

  const newAssistantMessage: Message = {
    role: "assistant",
    content: "",
    timestamp: new Date(),
  }
  setMessages((prev) => [...prev, newAssistantMessage])

  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: input }),
    })

    if (!response.body) throw new Error("No response body")

    const reader = response.body.getReader()
    const decoder = new TextDecoder("utf-8")

    let partialContent = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      partialContent += chunk

      // Update last assistant message
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages]
        updatedMessages[updatedMessages.length - 1] = {
          ...newAssistantMessage,
          content: partialContent,
        }
        return updatedMessages
      })
    }
  } catch (error) {
    console.error("Streaming error:", error)
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Error: Connection failed. Please check your API server and try again.",
        timestamp: new Date(),
      },
    ])
  } finally {
    setIsLoading(false)
  }
}


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        padding: "1rem",
        fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          height: "90vh",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(10, 10, 30, 0.7) inset",
          display: "flex",
          flexDirection: "column",
          background: "rgba(16, 16, 28, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(100, 100, 150, 0.2)",
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
            background: "rgba(30, 30, 50, 0.8)",
            borderBottom: "1px solid rgba(100, 100, 150, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Terminal
              size={18}
              style={{
                color: "#64ffda",
                filter: "drop-shadow(0 0 5px rgba(100, 255, 218, 0.5))",
              }}
            />
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#e4f1ff",
                textShadow: "0 0 10px rgba(228, 241, 255, 0.3)",
              }}
            >
              Sahil's AI Terminal
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#ff5f57",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <X size={8} style={{ opacity: 0, margin: "2px" }} />
            </div>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#febc2e",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Minus size={8} style={{ opacity: 0, margin: "2px" }} />
            </div>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#28c840",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Square size={8} style={{ opacity: 0, margin: "2px" }} />
            </div>
          </div>
        </div>

        {/* Terminal Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            background: "linear-gradient(180deg, rgba(22, 22, 35, 0.95) 0%, rgba(16, 16, 28, 0.98) 100%)",
          }}
          onClick={handleTerminalClick}
          ref={terminalRef}
        >
          {messages.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "rgba(100, 255, 218, 0.7)",
                textAlign: "center",
              }}
            >
              <Terminal
                size={40}
                style={{
                  marginBottom: "1rem",
                  opacity: 0.7,
                  filter: "drop-shadow(0 0 8px rgba(100, 255, 218, 0.4))",
                }}
              />
              <h2
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "0.5rem",
                  color: "#e4f1ff",
                  textShadow: "0 0 10px rgba(228, 241, 255, 0.3)",
                }}
              >
                Sahil's AI Terminal v1.0
              </h2>
              <p style={{ maxWidth: "500px", lineHeight: 1.6, opacity: 0.8 }}>
                Welcome to the terminal interface. Type your query below and press Enter to begin.
              </p>
              <div
                style={{
                  marginTop: "2rem",
                  padding: "0.5rem 1rem",
                  background: "rgba(100, 255, 218, 0.1)",
                  borderRadius: "4px",
                  border: "1px solid rgba(100, 255, 218, 0.2)",
                  fontFamily: "monospace",
                }}
              >
                <code> gemini --interactive --mode=chat</code>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "1rem",
                    animation: "fadeIn 0.3s ease-out",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "0.25rem",
                      opacity: 0.7,
                      fontSize: "0.7rem",
                    }}
                  >
                    <span
                      style={{
                        color: message.role === "user" ? "#bd93f9" : "#64ffda",
                      }}
                    >
                      {message.role === "user" ? "user@gemini" : "gemini@ai"}
                    </span>
                    <span style={{ color: "#6272a4", margin: "0 0.25rem" }}>:</span>
                    <span style={{ color: "#f1fa8c" }}>~$</span>
                    <span style={{ marginLeft: "auto", color: "#6272a4" }}>{formatTime(message.timestamp)}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      padding: "0.75rem 1rem",
                      borderRadius: "6px",
                      background: message.role === "user" ? "rgba(189, 147, 249, 0.1)" : "rgba(100, 255, 218, 0.05)",
                      border:
                        message.role === "user"
                          ? "1px solid rgba(189, 147, 249, 0.2)"
                          : "1px solid rgba(100, 255, 218, 0.1)",
                      boxShadow:
                        message.role === "user"
                          ? "0 2px 10px rgba(189, 147, 249, 0.1)"
                          : "0 2px 10px rgba(100, 255, 218, 0.05)",
                    }}
                  >
                    <div
                      style={{
                        marginRight: "0.75rem",
                        color: message.role === "user" ? "#bd93f9" : "#64ffda",
                        fontWeight: "bold",
                      }}
                    >
                      {message.role === "user" ? ">" : "$"}
                    </div>
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.6,
                        color: message.role === "user" ? "#f8f8f2" : "#f8f8f2",
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div
                  style={{
                    display: "flex",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    background: "rgba(100, 255, 218, 0.05)",
                    border: "1px solid rgba(100, 255, 218, 0.1)",
                    animation: "pulse 1.5s infinite",
                  }}
                >
                  <div
                    style={{
                      marginRight: "0.75rem",
                      color: "#64ffda",
                      fontWeight: "bold",
                    }}
                  >
                    $
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "#f8f8f2",
                    }}
                  >
                    <Loader
                      size={16}
                      style={{
                        marginRight: "0.75rem",
                        animation: "spin 1s linear infinite",
                        color: "#64ffda",
                      }}
                    />
                    <span>Processing request...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0.5rem 1rem",
            fontSize: "0.7rem",
            background: "rgba(30, 30, 50, 0.8)",
            borderTop: "1px solid rgba(100, 100, 150, 0.2)",
            color: "#6272a4",
          }}
        >
          <div>gemini-terminal v1.0</div>
          <div>{new Date().toLocaleDateString()}</div>
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "1rem",
            background: "rgba(20, 20, 35, 0.95)",
            borderTop: "1px solid rgba(100, 100, 150, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.75rem 1rem",
              borderRadius: "6px",
              background: "rgba(30, 30, 50, 0.6)",
              border: "1px solid rgba(100, 100, 150, 0.2)",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <ChevronRight
              size={18}
              style={{
                marginRight: "0.5rem",
                color: "#bd93f9",
                flexShrink: 0,
              }}
            />
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                color: "#f8f8f2",
                fontSize: "0.9rem",
                fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
                maxHeight: "150px",
                minHeight: "24px",
              }}
              placeholder="Type your message..."
              rows={1}
            />
            <span
              style={{
                height: "16px",
                width: "8px",
                backgroundColor: "#bd93f9",
                marginLeft: "0.25rem",
                opacity: cursorVisible ? 1 : 0,
                transition: "opacity 0.2s",
                boxShadow: "0 0 8px rgba(189, 147, 249, 0.5)",
              }}
            ></span>
          </div>
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.7rem",
              color: "#6272a4",
              textAlign: "right",
            }}
          >
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          background-color: #1a1a2e;
          color: #f8f8f2;
          overflow: hidden;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(30, 30, 50, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(100, 100, 150, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 100, 150, 0.7);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        ::placeholder {
          color: rgba(248, 248, 242, 0.5);
        }
      `}</style>
    </div>
  )
}

export default App

