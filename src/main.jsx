import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Sparkles, Lightbulb, Globe2, ArrowRight, Swords, ExternalLink, Compass, Send } from "lucide-react";
import "./style.css";

function IdeaInput({ onSubmit }) {
  const [mode, setMode] = useState(null);
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || !mode) return;
    onSubmit({ mode, value: value.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="idea-input">
      <div className="mode-grid">
        <button type="button" onClick={() => { setMode("idea"); setValue(""); }} className={`mode-card ${mode === "idea" ? "active" : ""}`}>
          <Lightbulb size={26} /><strong>I have an idea</strong><span>Describe your concept and we'll search for similar things</span>
        </button>
        <button type="button" onClick={() => { setMode("url"); setValue(""); }} className={`mode-card ${mode === "url" ? "active" : ""}`}>
          <Globe2 size={26} /><strong>I already built something</strong><span>Paste your site link and we'll check who's doing the same</span>
        </button>
      </div>
      {mode && (
        <div className="input-area">
          {mode === "idea" ? (
            <textarea autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="Describe your idea in a few sentences…" />
          ) : (
            <input autoFocus type="url" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Paste your website link here…" />
          )}
          <button className="submit-button" disabled={!value.trim()}>
            {mode === "idea" ? "Check my idea" : "Analyze my site"} <ArrowRight size={20} />
          </button>
        </div>
      )}
    </form>
  );
}

const similarityClass = {"Very similar":"danger","Somewhat similar":"warning","Slightly similar":"success"};

function SimilarIdeasResult({ items }) {
  if (!items?.length) return null;
  return <section className="section-card"><h2>We found these similar ideas already online</h2><p className="muted">These already exist online and overlap with your concept to some degree.</p><div className="stack">{items.map((item,i)=><div key={i} className="similar-row"><div><strong>{item.name}</strong><p>{item.description}</p></div><span className={`pill ${similarityClass[item.similarity] || ""}`}>{item.similarity}</span></div>)}</div></section>;
}

function OriginalityVerdict({ originality }) {
  const verdicts = {
    unique:["🎉","Your idea appears unique","We couldn't find many things doing exactly what you described. That's a great sign — you might be onto something fresh.","success-box"],
    some_competition:["👀","Your idea has some competition","There are a few things out there doing something similar, but there's still room for your take on it.","warning-box"],
    already_exists:["⚠️","This idea already exists in many forms","Lots of similar things already exist. That doesn't mean you can't do it — but you'll need a clear reason why yours is better.","danger-box"]
  };
  const v = verdicts[originality] || verdicts.some_competition;
  return <section className="section-card"><h2>How original is this idea?</h2><div className={`verdict ${v[3]}`}><h3>{v[0]} {v[1]}</h3><p>{v[2]}</p></div></section>;
}

function CompetitorCards({ competitors }) {
  if (!competitors?.length) return null;
  return <section className="section-card"><h2>Your main competition right now</h2><p className="muted">These are the top players doing something most similar to your idea.</p><div className="competitor-grid">{competitors.map((c,i)=><div key={i} className="competitor"><div className="competitor-title"><Swords size={18}/><strong>{c.name}</strong></div>{c.url && <a href={c.url} target="_blank" rel="noreferrer" className="small-link">Visit site <ExternalLink size={13}/></a>}<h4>What they do</h4><p>{c.what_they_do}</p><h4>Your opportunity</h4><p>{c.your_edge}</p></div>)}</div></section>;
}

function NextStepsResult({ nextStep }) {
  if (!nextStep) return null;
  return <section className="section-card next-step"><Compass size={24}/><div><h2>What should you do next?</h2><p>{nextStep}</p></div></section>;
}

function FollowUpChat({ results }) {
  const [messages,setMessages]=useState([]), [input,setInput]=useState(""), [loading,setLoading]=useState(false);
  async function handleSend(e){
    e.preventDefault(); if(!input.trim()||loading)return;
    const question=input.trim(); setInput(""); setMessages(p=>[...p,{role:"user",text:question}]); setLoading(true);
    try{
      const response=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,results})});
      const data=await response.json();
      setMessages(p=>[...p,{role:"assistant",text:data.answer||data.error||"Sorry, I couldn't answer right now."}]);
    }catch{setMessages(p=>[...p,{role:"assistant",text:"Sorry, I couldn't answer right now."}]);}
    setLoading(false);
  }
  return <section className="section-card"><h2>Still have questions?</h2><p className="muted">Ask anything about your competitors or idea.</p><div className="chat">{messages.map((m,i)=><div key={i} className={`message ${m.role}`}>{m.text}</div>)}{loading&&<div className="message assistant">Thinking…</div>}<form onSubmit={handleSend} className="chat-form"><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask anything about your competitors or idea…" /><button disabled={!input.trim()||loading}><Send size={16}/></button></form></div></section>;
}

function Home() {
  const [isLoading,setIsLoading]=useState(false), [submitted,setSubmitted]=useState(false), [results,setResults]=useState(null);
  async function handleSubmit({mode,value}){
    setIsLoading(true); setSubmitted(true); setResults(null);
    try{
      const response=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,value})});
      const data=await response.json(); if(!response.ok) throw new Error(data.error||"Request failed"); setResults(data);
    }catch(err){setResults({error:err.message||"Something went wrong"});}
    setIsLoading(false);
  }
  function handleReset(){setSubmitted(false); setResults(null);}
  return <div className="page"><div className="dots"></div><div className="glow"></div><header className="header"><Link to="/" className="brand"><span className="logo"><Sparkles size={16}/></span><span>Biancalytics</span></Link><nav><Link to="/how-it-works">How it works</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></nav>{submitted&&!isLoading&&<button onClick={handleReset} className="reset">← Start over</button>}</header><main className="main">{!submitted?<div className="intro"><div className="badge"><Sparkles size={14}/> AI IDEA VALIDATOR</div><h1>Does your website idea <span>already exist?</span></h1><p className="subtitle">Tell us your idea or paste your site link — we'll search and give you an honest, friendly answer.</p><IdeaInput onSubmit={handleSubmit}/></div>:<div className="results-wrap">{isLoading?<div className="loading"><div className="spinner"></div><p>Searching and preparing your results… this can take a few seconds.</p></div>:results?.error?<section className="section-card"><h2>Something went wrong</h2><p className="muted">{results.error}</p><button onClick={handleReset} className="submit-button">Try again</button></section>:results?<>{results.provider_used&&<div className="provider-note">Powered by {results.provider_used}</div>}<SimilarIdeasResult items={results.similar}/><OriginalityVerdict originality={results.originality}/><CompetitorCards competitors={results.competitors}/><NextStepsResult nextStep={results.next_step}/><FollowUpChat results={results}/></>:null}</div>}</main><footer><Link to="/about">About</Link><Link to="/how-it-works">How It Works</Link><Link to="/contact">Contact</Link></footer></div>;
}

function SimplePage({title,text}){return <div className="simple"><Link to="/" className="back">← Back home</Link><h1>{title}</h1><p>{text}</p></div>;}

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><BrowserRouter><Routes><Route path="/" element={<Home/>}/><Route path="/about" element={<SimplePage title="About Biancalytics" text="Biancalytics helps creators and builders check whether an app or website idea already exists."/>}/><Route path="/how-it-works" element={<SimplePage title="How it works" text="Enter an idea or website link. Biancalytics uses AI to compare similar tools, competitors, and give you a clear next step."/>}/><Route path="/contact" element={<SimplePage title="Contact" text="Add your email, contact form, or social links here."/>}/></Routes></BrowserRouter></React.StrictMode>);
