import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" data-theme="dark">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
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