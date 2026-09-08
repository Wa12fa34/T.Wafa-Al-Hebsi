import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

const LEVELS=["A1","A2","B1","B2","C1","C2"];
export default function OwnerStudentControl(){
 const [students,setStudents]=useState([]),[classes,setClasses]=useState([]),[mastery,setMastery]=useState([]),[q,setQ]=useState("");
 async function load(){const [s,c,m]=await Promise.all([supabase.from("student_profiles").select("id,student_name,cefr_level,class_id,is_active,classes(class_name)").order("student_name"),supabase.from("classes").select("id,class_name").eq("is_archived",false).order("class_name"),supabase.from("student_skill_mastery").select("*")]);setStudents(s.data||[]);setClasses(c.data||[]);setMastery(m.data||[])}
 useEffect(()=>{load()},[]);
 async function patch(id,values){const {error}=await supabase.from("student_profiles").update({...values,updated_at:new Date().toISOString()}).eq("id",id);if(error)alert(error.message);else load()}
 const visible=students.filter(s=>s.student_name.toLowerCase().includes(q.toLowerCase()));
 return <main className="owner-shell"><section className="owner-hero"><div><span className="eyebrow">OWNER CONTROL CENTER</span><h1>Students & CEFR Progress</h1><p>Manage student settings and monitor mastery in every English skill.</p></div></section>
 <section className="owner-panel"><input className="owner-search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search students..."/>
 <div className="owner-table-wrap"><table className="owner-table"><thead><tr><th>Student</th><th>Class</th><th>CEFR</th><th>Reading</th><th>Writing</th><th>Vocabulary</th><th>Grammar</th><th>Status</th></tr></thead><tbody>{visible.map(s=><tr key={s.id}><td>{s.student_name}</td><td><select value={s.class_id||""} onChange={e=>patch(s.id,{class_id:e.target.value||null})}>{classes.map(c=><option key={c.id} value={c.id}>{c.class_name}</option>)}</select></td><td><select value={s.cefr_level} onChange={e=>patch(s.id,{cefr_level:e.target.value})}>{LEVELS.map(x=><option key={x}>{x}</option>)}</select></td>{["reading","writing","vocabulary","grammar"].map(skill=>{const m=mastery.find(x=>x.student_id===s.id&&x.skill===skill);return <td key={skill}>{m?`${Number(m.mastery_percentage).toFixed(1)}%`:"—"}</td>})}<td><button className={s.is_active?"status-on":"status-off"} onClick={()=>patch(s.id,{is_active:!s.is_active})}>{s.is_active?"Active":"Inactive"}</button></td></tr>)}</tbody></table></div></section></main>
}