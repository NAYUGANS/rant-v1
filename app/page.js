"use client";
import { useEffect, useMemo, useState } from "react";
import { observeImage, LABELS } from "../lib/visual";
import { predict, updateTaste } from "../lib/taste";

export default function Home() {
  const [preview,setPreview]=useState(null);
  const [report,setReport]=useState(null);
  const [taste,setTaste]=useState({});
  const [feedback,setFeedback]=useState("");
  const [message,setMessage]=useState("Upload gambar pertama untuk memulai.");
  const [history,setHistory]=useState([]);

  useEffect(()=>{
    try {
      setTaste(JSON.parse(localStorage.getItem("rant:taste")||"{}"));
      setHistory(JSON.parse(localStorage.getItem("rant:history")||"[]"));
    } catch {}
  },[]);

  const prediction=useMemo(()=>report?predict(report,taste):null,[report,taste]);

  async function onFile(e) {
    const file=e.target.files?.[0]; if(!file)return;
    if(preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setMessage("Mengukur atribut visual di browser...");
    try {
      const r=await observeImage(file);
      setReport(r); setMessage("Visual report selesai. Nilai ini heuristik terukur, bukan penilaian AI.");
    } catch(err) { setMessage("Gagal membaca gambar: "+err.message); }
  }

  function decide(decision) {
    if(!report)return;
    const result=updateTaste(taste,report,decision,feedback);
    const nextHistory=[{id:crypto.randomUUID(),decision,feedback,attributed:result.attributed,report,created_at:new Date().toISOString()},...history].slice(0,100);
    setTaste(result.taste); setHistory(nextHistory);
    localStorage.setItem("rant:taste",JSON.stringify(result.taste));
    localStorage.setItem("rant:history",JSON.stringify(nextHistory));
    setMessage(result.note || `Tersimpan: ${decision}. Atribusi: ${result.attributed.join(", ")}`);
    setFeedback("");
  }

  function reset() {
    if(!confirm("Hapus seluruh taste memory lokal RANT?"))return;
    localStorage.removeItem("rant:taste"); localStorage.removeItem("rant:history");
    setTaste({}); setHistory([]); setMessage("Taste memory direset.");
  }

  return <main>
    <header><div><b>RANT</b><span>v1.0-alpha</span></div><small>PERSONAL VISUAL TASTE ENGINE</small></header>
    <section className="hero">
      <label className="drop">
        {preview?<img src={preview} alt="Uploaded preview"/>:<><strong>UPLOAD IMAGE</strong><span>tap untuk pilih gambar</span></>}
        <input type="file" accept="image/*" onChange={onFile}/>
      </label>
    </section>

    <section className="card">
      <div className="eyebrow">RANT PREDICTION</div>
      {!prediction?<h2>NO IMAGE</h2>:<>
        <h2>{prediction.status}</h2>
        <div className="score">{prediction.score===null?"—":prediction.score+"%"} <small>rejection signal</small></div>
        <p>Evidence events: {prediction.evidence}. RANT tidak menampilkan confidence palsu saat data belum cukup.</p>
      </>}
    </section>

    {report && <section className="card">
      <div className="eyebrow">VISUAL REPORT · HEURISTIC v0</div>
      {Object.entries(report).map(([k,v])=><div className="metric" key={k}>
        <span>{LABELS[k]||k}</span><progress max="1" value={v}/><b>{Math.round(v*100)}</b>
      </div>)}
    </section>}

    <section className="card">
      <div className="eyebrow">TEACH RANT</div>
      <textarea value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder='Contoh: "garis terlalu banyak dan titik kasarnya balik lagi"'/>
      <div className="actions"><button onClick={()=>decide("ACCEPT")} disabled={!report}>ACCEPT</button><button className="reject" onClick={()=>decide("REJECT")} disabled={!report}>REJECT</button></div>
      <p className="status">{message}</p>
    </section>

    <section className="card">
      <div className="eyebrow">TASTE MEMORY · LOCAL</div>
      {Object.keys(taste).length===0?<p>Belum ada attributed preference.</p>:Object.entries(taste).map(([k,v])=><div className="memory" key={k}><span>{LABELS[k]||k}</span><b>{v.negative_weight>=0?"NEGATIVE":"POSITIVE"} · {v.observations} obs</b></div>)}
      <button className="ghost" onClick={reset}>RESET MEMORY</button>
    </section>

    <section className="card">
      <div className="eyebrow">RECENT EVENTS</div>
      {history.slice(0,5).map(h=><div className="event" key={h.id}><b>{h.decision}</b><span>{h.feedback||"no feedback"}</span></div>)}
      {!history.length&&<p>No decisions yet.</p>}
    </section>
    <footer>RANT alpha · rule-based + browser visual heuristics · no trained personal ML model yet</footer>
  </main>;
}
