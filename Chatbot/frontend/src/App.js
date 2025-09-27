import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Bot, User, Loader2 } from 'lucide-react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Web3 AI agent. I can help you with token swaps, NFT minting, sending money, and other blockchain operations. Just speak or type your request!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [interimText, setInterimText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setInterimText('');
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInputText(finalTranscript);
          setInterimText('');
          setIsListening(false);
        } else {
          setInterimText(interimTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimText('');
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const processUserInput = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/process-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: text.trim() }),
      });

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing query:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error processing your request. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processUserInput(inputText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processUserInput(inputText);
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-content">
            <Bot className="bot-icon" />
            <h1>DecentraBot</h1>
          </div>
        </div>

        <div className="messages-container">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`message ${message.sender}`}
              >
                <div className="message-avatar">
                  {message.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="message bot"
            >
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="message-text">
                  <Loader2 className="spinner" />
                  Processing your request...
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Interim speech text display */}
        {isListening && (
          <div className="interim-text-container">
            <div className="interim-text">
              <div className="interim-label">
                🎤 Listening...
                <div className="listening-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              {interimText && (
                <div className="interim-content">{interimText}</div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your Web3 request or click the mic to speak..."
              className="text-input"
              rows="1"
              disabled={isProcessing}
            />
            <div className="input-buttons">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`voice-button ${isListening ? 'listening' : ''}`}
                disabled={isProcessing}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                type="submit"
                className="send-button"
                disabled={!inputText.trim() || isProcessing}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
