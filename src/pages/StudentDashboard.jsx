import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

const skills = ["reading", "writing", "vocabulary", "grammar"];

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Please sign in to continue."); setLoading(false); return; }
      const profile = await supabase.from("student_profiles").select("id,student_name,cefr_level,class_id,classes(name)").eq("auth_user_id", user.id).maybeSingle();
      if (profile.error || !profile.data) { setError(profile.error?.message || "Student profile not found."); setLoading(false); return; }
      const [p, r] = await Promise.all([
        supabase.from("student_progress").select("skill,cefr_level,activities_completed,average_percentage,updated_at").eq("student_id", profile.data.id),
        supabase.from("student_results").select("id,skill,percentage,created_at").eq("student_id", profile.data.id).order("created_at", { ascending: false }).limit(8)
      ]);
      setStudent(profile.data); setProgress(p.data || []); setResults(r.data || []); setLoading(false);
    }
    load();
  }, []);

  const overall = useMemo(() => {
    const vals = results.map(r => Number(r.percentage)).filter(Number.isFinite);
    return vals.length ? vals.reduce((a,b) => a+b,0)/vals.length : null;
  }, [results]);

  const recommendation = overall == null ? "Complete your first assigned activity to begin your progress journey." : overall >= 85 ? "Excellent performance – you may be ready for the next challenge." : overall >= 70 ? "Good progress – continue practising at this level." : "Additional practice is recommended before progressing.";

  if (loading) return <main className="student-dashboard"><h2>Loading your learning dashboard...</h2></main>;
  if (error) return <main className="student-dashboard"><div className="dashboard-error">{error}</div></main>;

  return <main className="student-dashboard">
    <header className="student-welcome"><div><span className="eyebrow">MY LEARNING</span><h1>Welcome, {student.student_name}</h1><p>{student.classes?.name || "Class not assigned"} · CEFR {student.cefr_level}</p></div><div className="cefr-chip">{student.cefr_level}</div></header>
    <section className="student-summary"><article><span>Overall Average</span><strong>{overall == null ? "No results yet" : `${overall.toFixed(1)}%`}</strong></article><article><span>Activities Completed</span><strong>{results.length}</strong></article><article><span>Current CEFR</span><strong>{student.cefr_level}</strong></article></section>
    <section className="skill-progress"><h2>Skill Progress</h2><div className="skill-grid">{skills.map(skill => { const item=progress.find(p=>p.skill===skill); const pct=Number(item?.average_percentage)||0; return <article key={skill}><div className="skill-row"><strong>{skill[0].toUpperCase()+skill.slice(1)}</strong><span>{item?.average_percentage == null ? "No results" : `${pct.toFixed(1)}%`}</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${Math.min(100,pct)}%`}} /></div></article>; })}</div></section>
    <section className="next-step"><h2>Recommended Next Step</h2><p>{recommendation}</p><div className="student-actions"><Link to="/reading">Reading</Link><Link to="/writing">Writing</Link><Link to="/vocabulary">Vocabulary</Link><Link to="/grammar">Grammar</Link><Link to="/progress">My Progress</Link></div></section>
    <section className="recent-results"><h2>Recent Results</h2>{results.length===0 ? <p>No results available yet.</p> : <div className="result-list">{results.map(r=><div key={r.id}><span>{r.skill || "Activity"}</span><strong>{Number(r.percentage).toFixed(1)}%</strong></div>)}</div>}</section>
  </main>;
}
