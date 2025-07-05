// src/components/PDFViewer.jsx
import React from 'react';
import { Document, Page } from 'react-pdf';

const PDFViewer = ({ fileUrl, onLoadSuccess }) => {
  return (
    <Document
      file={fileUrl}
      onLoadSuccess={onLoadSuccess}
      className="shadow border"
    >
      <Page pageNumber={1} width={600} />
    </Document>
  );
};

export default PDFViewer;
