'use client';

import { useEffect, useRef } from 'react';

interface HtmlSandboxProps {
  html: string;
  className?: string;
}

export function HtmlSandbox({ html, className = '' }: HtmlSandboxProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Create the document with the HTML content
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // Inject the HTML content
    doc.open();
    doc.write(html);
    doc.close();

    // Set up postMessage listener for auto-resizing
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      
      if (event.data.type === 'resize') {
        iframe.style.height = `${event.data.height}px`;
      }
    };

    window.addEventListener('message', handleMessage);

    // Inject resize script into iframe
    const script = doc.createElement('script');
    script.textContent = `
      (function() {
        function sendHeight() {
          const height = document.documentElement.scrollHeight || document.body.scrollHeight;
          window.parent.postMessage({ type: 'resize', height }, '*');
        }
        
        // Send initial height
        sendHeight();
        
        // Send height on resize
        window.addEventListener('resize', sendHeight);
        
        // Send height on content changes (MutationObserver)
        if (typeof MutationObserver !== 'undefined') {
          const observer = new MutationObserver(() => {
            sendHeight();
          });
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
          });
        }
        
        // Send height periodically as fallback
        setInterval(sendHeight, 500);
      })();
    `;
    doc.head.appendChild(script);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [html]);

  return (
    <div className={`html-sandbox-host ${className}`}>
      <iframe
        ref={iframeRef}
        className="html-sandbox-frame"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Content sandbox"
      />
    </div>
  );
}
