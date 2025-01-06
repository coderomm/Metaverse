import React, { createContext, useEffect, useState, ReactNode } from 'react';

export interface WebSocketContextType {
  socket: WebSocket | null;
  sendMessage: (message: unknown) => void;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_WS_URL || "ws://localhost:3001");

    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = (event) => console.log('Message received:', event.data);
    ws.onclose = () => console.log('WebSocket disconnected');

    setSocket(ws);

    return () => ws.close();
  }, []);

  const sendMessage = (message: unknown) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
