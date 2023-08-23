import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';


const socket = io('http://localhost:3001'); // Connect to the backend server

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [targetSocketID, setTargetSocketID] = useState('');
  const [userName, setUserName] = useState('');
  const [ isjoined ,setisjooined]=useState(false);
  const [storedname,setstoredname]=useState("");

  const handleJoinRoom = () => {
    if (targetSocketID.trim() !== '' && userName.trim() !== '') {
      setMessages([]); // Clear messages when joining a new room
      socket.emit('join_room', targetSocketID);
      setisjooined(true);
      localStorage.setItem("user",userName);
    }
  };
  useEffect(()=>{
   const data=   localStorage.getItem('user');
   setstoredname(data);
  },[message])

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      const data = {
        targetSocketID,
        message,
        name:userName
      };
      socket.emit('send_message', data);
      setMessage('');
    }
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('receive_message'); // Clean up event listener on component unmount
    };
  }, []);

  return (
    <div className="App">
      <h1>Chat App</h1>
      <h3>Joined with id or can create the new for with friends </h3>
      <div className="join-room">
        <input
          type="text"
          placeholder="Enter target socket ID..."
          value={targetSocketID}
          onChange={(e) => setTargetSocketID(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter your username..."
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
     { isjoined && <div  className="message-container">
     <div className="input-container">
          <input
            type="text"
            placeholder="Enter your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
        <div  className="messages" >
          {messages.map((msg, index) => (
            <div key={index}  style={{display:"flex",width:"250px",alignItems:"center",marginLeft:msg.name==storedname&&"auto",overflow: "hidden" }}>
              <p style={{color:msg.name==storedname && "rgba(0,0,0,.8)",width:"150px",wordWrap: "break-word" }}>
             {msg.message}
              </p>      
              <p style={{color:"black",fontSize:"12px",paddingTop:"5px",marginInline:"5px"}}>  {new Date().toLocaleString().substring(10,15)}</p>
            </div>
          ))}
        </div>
      
      </div>}
    </div>
  );
}

export default App;
