import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

const empty = { students: 0, teachers: 0, classes: 0, activities: 0, completed: 0, overall: null };

export default function OwnerDashboard() {
  const [stats, setStats] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [students, teachers, classes, reading, writing, vocabulary, grammar, results] = await Promise.all([
          supabase.from("student_profiles").select("id", { count: "exact", head: true }),
          supabase.from("teacher_profiles").select("id", { count: "exact", head: true }),
          supabase.from("classes").select("id", { count: "exact", head: true }).eq("is_archived", false),
          supabase.from("reading_passages").select("id", { count: "exact", head: true }),
          supabase.from("writing_activities").select("id", { count: "exact", head: true }),
          supabase.from("vocabulary_activities").select("id", { count: "exact", head: true }),
          supabase.from("grammar_activities").select("id", { count: "exact", head: true }),
          supabase.from("student_results").select("percentage")
        ]);

        const failed = [students, teachers, classes, reading, writing, vocabulary, grammar, results].find(x => x.error);
        if (failed) throw failed.error;
        const percentages = (results.data || []).map(r => Number(r.percentage)).filter(Number.isFinite);
        const overall = percentages.length ? percentages.reduce((a,b) => a+b, 0) / percentages.length : null;

        setStats({
          students: students.count || 0,
          teachers: teachers.count || 0,
          classes: classes.count || 0,
          activities: (reading.count || 0) + (writing.count || 0) + (vocabulary.count || 0) + (grammar.count || 0),
          completed: percentages.length,
          overall
        });
      } catch (e) {
        setError(e.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <main className="owner-shell"><h2>Loading Owner Dashboard...</h2></main>;

  return (
    <main className="owner-shell">
      <section className="owner-hero">
        <div><span className="eyebrow">ENGLISH LEARNING HUB</span><h1>Owner Dashboard</h1><p>Zayed Educational Complex – Al Kharran</p></div>
        <div className="owner-badge"><strong>T. Wafa Al Hebsi</strong><span>Platform Owner</span></div>
      </section>
      {error && <div className="dashboard-error">{error}</div>}
      <section className="owner-grid">
        <Stat label="Total Students" value={stats.students} />
        <Stat label="Total Teachers" value={stats.teachers} />
        <Stat label="Active Classes" value={stats.classes} />
        <Stat label="Total Activities" value={stats.activities} />
        <Stat label="Activities Completed" value={stats.completed} />
        <Stat label="Overall Average" value={stats.overall == null ? "No results yet" : `${stats.overall.toFixed(1)}%`} />
      </section>
      <section className="owner-panel"><h2>Administration</h2><p>Manage students, teachers, classes, CEFR content, assignments, results and analytics from one secure workspace.</p><div className="admin-actions"><a href="/teacher/students">Student Management</a><a href="/teacher">Performance & Classes</a></div></section>
    </main>
  );
}

function Stat({ label, value }) {
  return <article className="owner-stat"><span>{label}</span><strong>{value}</strong></article>;
}
