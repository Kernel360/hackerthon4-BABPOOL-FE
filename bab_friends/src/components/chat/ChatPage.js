import { useEffect, useState, useRef } from "react";
import { Stomp } from "@stomp/stompjs";
import { Link, useParams, BrowserRouter } from "react-router-dom";
import "./ChatPage.css";
import { getAccessToken } from "../login/authService";

const API_BASE_URL = "3.38.71.28:8080";

export function ChatPage({roomId, userId}) {
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const stompClient = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth"})
    }
  }, [messages])

  useEffect(() => {
      connect();
    return () => disconnect();
  }, [roomId]);

  const connect = () => {
    console.log("userId",userId)
    console.log("roomId", roomId)
    const socket = new WebSocket(`ws://${API_BASE_URL}/ws/websocket`);
    stompClient.current = Stomp.over(socket);

    stompClient.current.connect({}, () => {
      stompClient.current.subscribe(`/sub/chat/rooms/${roomId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    }, (error) => console.error("stomp error:", error));
  };

  const disconnect = () => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.disconnect();
    }
  };

  const sendMessage = (e) => {
    if (stompClient && newMessage) {
      const chatMessage = {
        userId,
        nicnkname: nickname,
        content: newMessage
      };
      stompClient.current.send(`/pub/chat/rooms/${roomId}`, {}, JSON.stringify(chatMessage))
      
      setNewMessage("");
    }
  };

  return (
    <BrowserRouter>
    <div className="chat-container">
      <div className="chat-header">
        <h2>채팅방 #{roomId}</h2>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`message ${msg.userId == userId ? 'my-message' : 'other-message'}`}
          >
            <span className="message-writer">{msg.nickname}</span>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-area">
        <form onSubmit={sendMessage} className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
          />
          <button type="submit" className="send-button">
            전송
          </button>
        </form>
      </div>
    </div>
    </BrowserRouter>
  );
}

