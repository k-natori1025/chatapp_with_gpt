"use client";

import { User, onAuthStateChanged } from "firebase/auth";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../firebase";

type AppProviderProps = {
  children: ReactNode;
}

type AppContextType = {
  user: User | null;
  userId: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  selectedRoom: string | null;
  setSelectedRoom: React.Dispatch<React.SetStateAction<string | null>>
}

const defaultContextDate = {
  user: null,
  userId: null,
  setUser: () => {},
  selectedRoom: null,
  setSelectedRoom: () => {},
}

const AppContext = createContext<AppContextType>(defaultContextDate);

export function AppProvider({ children }: AppProviderProps) {
  const [user, setUser] = useState<any | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      setUser(newUser);
      setUserId(newUser? newUser.uid : null);
    });
    // アンマンウトしたらonAuthStateChanged関数をストップする（=メモリリークを防ぐ）
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider 
      value={{user, userId, setUser, selectedRoom, setSelectedRoom}}
    >
      {children}
    </AppContext.Provider>
  )
}

// 各ファイルでいちいちuseContext(AppContext)を記述しなくて済むようにする
export function useAppContext() {
  return useContext(AppContext);
}
