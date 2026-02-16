import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="prose mx-auto p-8">
      <h1>Privacy Policy</h1>
      <p>QAi Talks is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights under GDPR and other privacy laws.</p>
      <h2>What We Collect</h2>
      <ul>
        <li>Account information (name, email, OAuth provider)</li>
        <li>Uploaded CVs and job descriptions</li>
        <li>Usage analytics (anonymized)</li>
      </ul>
      <h2>How We Use Your Data</h2>
      <ul>
        <li>To provide mentorship and CV review services</li>
        <li>To improve our platform</li>
        <li>To comply with legal obligations</li>
      </ul>
      <h2>Your Rights</h2>
      <ul>
        <li>Access your data (via your account dashboard)</li>
        <li>Request deletion of your data (via account settings or support)</li>
        <li>Withdraw consent at any time</li>
      </ul>
      <h2>Data Retention</h2>
      <ul>
        <li>Uploaded CVs are deleted after 30 days or upon user request</li>
        <li>Account data is deleted upon account closure</li>
      </ul>
      <h2>Cookies & Tracking</h2>
      <ul>
        <li>We use cookies for authentication and analytics</li>
        <li>You can manage cookies in your browser settings</li>
      </ul>
      <h2>Contact</h2>
      <p>For privacy questions or requests, contact <a href="mailto:privacy@qaitalks.com">privacy@qaitalks.com</a></p>
      <p><em>Last updated: 2026-02-15</em></p>
    </main>
  );
}
