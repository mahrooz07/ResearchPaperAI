import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api';
import { MessageSquare, Send } from 'lucide-react';

const ChatAssistant = ({ editorContent, setEditorContent }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello! I am your AI editor assistant. Ask me questions about your paper or tell me to rewrite/edit specific parts of the text!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const { data } = await sendChatMessage(userMessage, editorContent);
            setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);

            if (data.updated_content) {
                setEditorContent(data.updated_content);
                setMessages(prev => [...prev, { role: 'ai', text: 'I have updated the editor content for you!' }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-sidebar">
            <div className="chat-header">
                <MessageSquare size={20} color="#818cf8" />
                AI Editor Assistant
            </div>

            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role}`}>
                        {msg.text}
                    </div>
                ))}
                {loading && (
                    <div className="chat-message ai" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask AI to edit paper..."
                    disabled={loading}
                />
                <button onClick={handleSend} disabled={loading || !input.trim()}>
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatAssistant;
