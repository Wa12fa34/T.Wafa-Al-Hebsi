import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

function Home() {
  const [message, setMessage] = useState("Testing Supabase connection...");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("reading_passages")
        .select("*");

      if (error) {
        console.error(error);
        setMessage(`Supabase error: ${error.message}`);
        return;
      }

      console.log(data);
      setMessage("Supabase connection successful ✅");
    }

    testConnection();
  }, []);

  return (
    <main>
      <h1>English Learning Platform</h1>
      <p>{message}</p>
    </main>
  );
}

export default Home;