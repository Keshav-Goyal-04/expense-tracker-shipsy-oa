'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerUIView({ spec }) {
  return (
    <>
      <style>{`body { background-color: white; }`}</style>
      <SwaggerUI spec={spec} />
    </>
  );
}
