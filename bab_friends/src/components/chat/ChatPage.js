import { useEffect, useState, useRef } from "react";
import { Stomp } from "@stomp/stompjs";
import { Link, useParams, BrowserRouter } from "react-router-dom";
import "./ChatPage.css";

export function ChatPage({roomId}) {
    const userId = 1; // TODO
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
    connect()
    return () => disconnect()
  }, [roomId]);

  const connect = () => {
    const socket = new WebSocket("ws://localhost:8080/ws/websocket");
    stompClient.current = Stomp.over(socket);

    stompClient.current.connect({}, () => {
      stompClient.current.subscribe(`/sub/chat/rooms/${roomId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    }, (error) => console.error("stomp error:", error));
  };

  const disconnect = () => {
    if (stompClient.current) {
      stompClient.current.disconnect();
    }
  };

  const sendMessage = (e) => {
    if (stompClient && newMessage && nickname) {
      const chatMessage = {
        userId: 1,
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
        {/* <Link to="/rooms" className="back-button">
          뒤로 가기
        </Link> */}
        <h2>채팅방 #{roomId}</h2>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`message ${msg.userId === userId ? 'my-message' : 'other-message'}`}
          >
            <span className="message-writer">{msg.nickname}</span>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-area">
        <div className="username-input">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
          />
        </div>
        
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

