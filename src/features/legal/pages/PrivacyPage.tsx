import { LegalLayout } from '../components/LegalLayout';

const sections = [
  { id: 'what-is-stored', label: 'What is stored' },
  { id: 'what-your-browser-stores', label: 'What your browser stores' },
  { id: 'third-party-model-provider', label: 'Third-party model provider' },
  { id: 'analytics-and-cookies', label: 'Analytics and cookies' },
  { id: 'retention-and-deletion', label: 'Retention and deletion' },
  { id: 'contact', label: 'Contact' },
];

export const PrivacyPage = () => {
  return (
    <LegalLayout title="Privacy" updatedAt="16 November 2026" sections={sections}>
      <p>
        Zenith AI is a free assistant for debugging code and learning best practices. This page
        explains what the application stores and what happens to the messages you send.
      </p>

      <h2 id="what-is-stored">What is stored</h2>
      <p>
        The backend stores the account details you provide when you register: your email address,
        your username, and the password in hashed form. It also stores the conversations and
        messages you create so that they can be shown again when you return.
      </p>

      <h2 id="what-your-browser-stores">What your browser stores</h2>
      <ul>
        <li>
          The access token is kept in memory only. It is lost when the page is reloaded and is never
          written to <code>localStorage</code>.
        </li>
        <li>
          The refresh token is kept in <code>sessionStorage</code>. It survives a reload in the same
          tab and is removed when the tab closes.
        </li>
        <li>
          Your theme preference and a cached copy of your public profile (id, email and username)
          are kept in <code>localStorage</code>.
        </li>
        <li>
          Conversation content is not persisted in browser storage. It is fetched from the backend
          when you open a conversation.
        </li>
      </ul>

      <h2 id="third-party-model-provider">Third-party model provider</h2>
      <p>
        When you send a message, its content is sent to the Zenith AI backend and then to a
        third-party model provider operating on a free tier. The provider&apos;s own privacy terms
        apply to that processing. Do not send secrets, credentials, or personal data you do not want
        a third party to process.
      </p>

      <h2 id="analytics-and-cookies">Analytics and cookies</h2>
      <p>
        The frontend does not include analytics or advertising trackers. It does not set cookies.
        The storage described above is used only to keep you signed in, remember your theme, and
        cache your profile.
      </p>

      <h2 id="retention-and-deletion">Retention and deletion</h2>
      <p>
        Conversations remain available until you delete them or the backend operator removes them.
        To request deletion of your account and its data, contact the address below.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Privacy questions and deletion requests can be sent to{' '}
        <a href="mailto:miharisoadavidfils@gmail.com">miharisoadavidfils@gmail.com</a>.
      </p>

      <p>
        This page describes the current behaviour of the application. If that behaviour changes,
        this page is updated with a new date.
      </p>
    </LegalLayout>
  );
};
