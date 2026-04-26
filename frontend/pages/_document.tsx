import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" data-theme="dark">
      <Head>
        {/* FIX: This one line makes the page fill the phone screen correctly.
            viewport-fit=cover handles the iPhone notch and home bar. */}
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('ccg-theme') || 'dark';
            document.documentElement.setAttribute('data-theme', t);
          })();
        `}} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
