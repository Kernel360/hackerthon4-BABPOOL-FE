// import axios from "axios";
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import './ChatRoomPage.css';

// export function ChatRoomPage() {
//   const [chatRoomList, setChatRoomList] = useState([]);

//   useEffect(() => {
//     const loadChatRoomHistory = async () => {
//       try {
//         const response = await axios.get("http://localhost:8080/api/v1/rooms");
//         const chatRoomList = response.data.data.map((item) => {
//           return { roomId: item.roomId }
//         });
//         setChatRoomList(chatRoomList);
//       } catch (error) {
//         console.error("채팅 내역 로드 실패", error);
//       }
//     };
//     loadChatRoomHistory();
//   }, []);
//   return (
//     <>
//       <div className="ChatRoomPage">
//         <ul className="chatRoomList">
//           {chatRoomList.map((chatRoom, idx) => (
//             <div key={idx}>
//               <li>
//                 <Link to={`/rooms/${chatRoom.roomId}`}>{chatRoom.roomId} 번 채팅방</Link>
//               </li>
//             </div>
//           ))}
//         </ul>
//       </div>
//     </>
//   );
// }