"use client";

import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

export default function Home() {
  // ログインユーザーがいなければログインページにリダイレクトさせる
  const { user } = useAppContext();
  const router = useRouter();
  if(!user) {
    router.push("/auth/login");
  }

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="h-full flex" style={{ width: "100%" }}>
        <div className="w-1/5 h-full border-r">
          <Sidebar />
        </div>
        <div className="w-4/5 h-full">
          <Chat />
        </div>
      </div>
    </div>
  );
}
