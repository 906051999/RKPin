import React from 'react';
import DOMPurify from 'dompurify';

const Card = ({ rawHtml }) => {
  const sanitizeConfig = {
    ALLOWED_TAGS: ['div', 'span', 'p', 'br', 'strong', 'em', 'u', 's', 'a', 'img', 'i', 'b', 'svg', 'path', 'g'],
    ALLOWED_ATTR: ['class', 'href', 'target', 'src', 'alt', 'style', 'fill', 'width', 'height', 'viewBox', 'd'],
    ADD_ATTR: ['target'],
  };

  const extractMessageContent = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const messageBubble = doc.querySelector('.tgme_widget_message_bubble');
    return messageBubble ? messageBubble.outerHTML : '';
  };

  const messageContent = extractMessageContent(rawHtml);
  const sanitizedHtml = DOMPurify.sanitize(messageContent, sanitizeConfig);
  
  return (
    <div className="card bg-white shadow-md rounded-lg p-4 mb-4 tgme_widget_message_bubble">
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </div>
  );
};

export default Card;