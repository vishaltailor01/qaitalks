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
          <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
          <div className="flex gap-6 overflow-x-auto">
            {course.modules?.map((mod) => (
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
        </section>
      ))}
    </div>
  );
}
