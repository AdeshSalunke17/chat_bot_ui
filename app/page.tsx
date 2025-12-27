'use client'

import { ChatDemo } from "@/comp/ChatDemo";
import { getAnswer } from "@/serverFunctions/getAnswer";
import { useState } from "react";


export default function Home() {
  const [userInput, setUserInput] = useState('');
  return (
    // <form action="" onSubmit={e => {e.preventDefault();handleSubmit()}}>
    //   <input type="text" onChange={e=> setUserInput(e.target.value)} value={userInput}/>
    //   <button type="submit">Submit</button>
    // </form>
    <ChatDemo/>
  );
}
