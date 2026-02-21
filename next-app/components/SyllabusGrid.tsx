"use client";
import React, { useEffect, useState } from 'react';

type Course = {
  id: string;
  title: string;
  modules?: { title: string; topics: string[] }[];
};

export default function SyllabusGrid() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch('/knowledge-pool.json')
      .then((r) => r.json())
      .then((j) => setCourses(j.courses || []))
      .catch((e) => console.error('Failed to load knowledge pool', e));
  }, []);

  if (!courses.length) return <div className="p-4">No syllabus data available.</div>;

  return (
    <div className="p-4">
      {courses.map((course) => (
        <section key={course.id} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{course.title}</h2>
            {('pdfPath' in course) && (
              <a href={(course as any).pdfPath} target="_blank" rel="noreferrer" className="ml-4 px-4 py-2 bg-logic-cyan text-white rounded">
                View syllabus
              </a>
            )}
          </div>

          {course.modules && course.modules.length ? (
            <div className="flex gap-6 overflow-x-auto">
              {course.modules.map((mod) => (
                <div key={mod.title} className="min-w-[220px] bg-white shadow p-4 rounded">
                  <h3 className="font-semibold mb-2">{mod.title}</h3>
                  <ul className="space-y-2">
                    {mod.topics.map((t) => (
                      <li key={t} className="bg-slate-100 px-3 py-2 rounded text-sm">{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-slate-600">This syllabus has been added to the knowledge pool. Text extraction is in progress; open the PDF to view the original document.</p>
              {('rawTextPath' in course) && (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer">Preview extracted text</summary>
                  <pre className="whitespace-pre-wrap max-h-48 overflow-auto p-2 bg-slate-50 rounded mt-2 text-xs">
                    <PreviewText path={(course as any).rawTextPath} />
                  </pre>
                </details>
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function PreviewText({ path }: { path: string }) {
  const [text, setText] = React.useState<string | null>(null);
  React.useEffect(() => {
    fetch(path)
      .then((r) => r.text())
      .then((t) => setText(t.slice(0, 2000)))
      .catch(() => setText(null));
  }, [path]);
  if (text === null) return <em>Loading preview…</em>;
  if (!text) return <em>No extracted text available yet.</em>;
  return <span>{text}</span>;
}
