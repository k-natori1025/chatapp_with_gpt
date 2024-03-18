"use client";

import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react'
import { IoMdSend } from "react-icons/io";
import { db } from '../../../firebase';
import { useAppContext } from '@/context/AppContext';
import OpenAI from 'openai';
import LoadingIcons from 'react-loading-icons';

type Message = {
  text: string;
  sender: string;
  createdAt: Timestamp; 
}

const Chat = () => {

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_I_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const { selectedRoom, selectedRoomName } = useAppContext();
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const scrollDiv = useRef<HTMLDivElement>(null);


  // 各ルームに紐づくメッセージを取得
  useEffect(() => {
    if(selectedRoom) {
      const fetchMessages = async () => {
        const roomDocRef = doc(db, "rooms", selectedRoom);
        const messageCollectionRef = collection(roomDocRef, "messages")

        const q = query(messageCollectionRef, orderBy("createdAt"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => doc.data() as Message);
          setMessages(newMessages);
        });
        // アンマンウトしたらonSnapshot関数をストップする（=メモリリークを防ぐ）
        return () => {
          unsubscribe();
        }
      };
      fetchMessages();
    }
  }, [selectedRoom])

  // messagesが更新されるたびに一番下にスクロールされるようにする
  useEffect(() => {
    if(scrollDiv.current) {
      const element = scrollDiv.current;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages]);

  const sendMessage = async () => {
    if(!inputMessage.trim()) return;

    const messageData = {
      text: inputMessage,
      sender: "user",
      createdAt: serverTimestamp(),
    }

    // userのメッセージをfirestoreに保存
    const roomDocRef = doc(db, "rooms", selectedRoom!);
    const messageCollectionRef = collection(roomDocRef, "messages");
    await addDoc(messageCollectionRef, messageData);

    setInputMessage("");
    setIsLoading(true);
    // open aiからの回答
    const gpt3Response = await openai.chat.completions.create({
      messages: [{role: "user", content: inputMessage}],
      model: 'gpt-3.5-turbo',
    });
    setIsLoading(false);

    const botResponse = gpt3Response.choices[0].message.content;
    // open aiからの回答をfirestoreに保存
    await addDoc(messageCollectionRef, {
      text: botResponse,
      sender: "bot",
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div className="h-full p-4 flex flex-col" style={{backgroundColor: "#F4F5F7"}}>
      <h1 className="font-semibold text-2xl mb-4">{selectedRoomName}</h1>
      <div className="flex-grow overflow-y-auto mb-4" ref={scrollDiv}>
        {messages.map((message, index) => (
          <div key={index} className={ message.sender === "user" ? "text-right" : "text-left"}>
            <div className={ 
                message.sender === "user" 
                  ? "bg-blue-500 inline-block rounded px-4 py-2 mb-4" 
                  : "bg-gray-300 inline-block rounded px-4 py-2 mb-4"
              }
            >
              <p className={ 
                  message.sender === "user" 
                    ? "text-white font-medium" 
                    : "font-medium"
                }
              >
                {message.text}
              </p>
            </div>
          </div>
        ))}
        {isLoading && <LoadingIcons.TailSpin stroke="#98ff98"/>}
      </div>
      <div className="flex-shrink-0 relative">
        <input 
          type="text" 
          placeholder="Send a Message" 
          className="border-2 rounded w-full focus:outline-none p-2"
          onChange={(e) => setInputMessage(e.target.value)}
          value={inputMessage}
          // enterキーで送信されるようにする
          // onKeyDown={(e) => {
          //   if(e.key === "Enter") {
          //     sendMessage();
          //   }
          // }}
        />
        <button 
          className="absolute right-4 items-center inset-y-0"
          onClick={() => sendMessage()} 
        >
          <IoMdSend />
        </button>
      </div>
    </div>
  )
}

export default Chat
Chat
