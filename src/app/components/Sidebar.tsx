"use client";

import { Timestamp, collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { IoIosLogOut } from "react-icons/io";
import { db } from '../../../firebase';
import { useAppContext } from '@/context/AppContext';

type Room = {
  id: string;
  name: string;
  createdAt: Timestamp;
}

const Sidebar = () => {

  const {user, userId, setSelectedRoom} = useAppContext();

  const [rooms, setRooms ] = useState<Room[]>([]);
  useEffect(() => {
    if(user) {
      const fetchRooms = async () => {
        const roomCollectionRef = collection(db, "rooms");
        const q = query(roomCollectionRef, where("userId", "==", userId), orderBy("createdAt"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const newRooms: Room[] = snapshot.docs.map((doc) => (
            {
              id: doc.id,
              name: doc.data().name,
              createdAt: doc.data().createdAt,
            }
          ));
          setRooms(newRooms);
        })
        // アンマンウトしたらonSnapshot関数をストップする（=メモリリークを防ぐ）
        return () => {
          unsubscribe();
        }
      };
      fetchRooms();
    }
  }, [userId]);

  const selectRoom = (roomId: string) => {
    setSelectedRoom(roomId);
  }
  
  return (
    <div className="h-full overflow-y-auto px-5 flex flex-col" style={{ backgroundColor: "#0093E9", backgroundImage: "linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)"}}>
      <div className="flex-grow">
        <div className="cursor-pointer flex items-center justify-evenly border mt-2 rounded-md hover:bg-blue-500 duration-150">
          <span className="text-white text-2xl font-semibold py-4">+</span>
          <h1 className="text-white text-l font-semibold py-4">Add New Chat</h1>
        </div>
        <ul className="mt-5">
          {rooms.map((room) => (
            <li 
              key={room.id} 
              className="cursor-pointer border-b p-2 text-slate-100 hover:bg-slate-400 duration-150"
              onClick={() => selectRoom(room.id)}
            >{room.name}</li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-evenly mb-4 cursor-pointer p-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-700 hover:text-slate-200">
        <IoIosLogOut />
        <span className="font-semibold">ログアウト</span>
      </div>
    </div>
  )
}

export default Sidebar
Sidebar
