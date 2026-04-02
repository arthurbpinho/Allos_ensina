import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function parseFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  switch (extension) {
    case 'txt':
      return await file.text();
    case 'pdf':
      return await parsePDF(file);
    case 'docx':
      return await parseDOCX(file);
    default:
      throw new Error(`Formato não suportado: .${extension}. Use PDF, TXT ou DOCX.`);
  }
}

async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    pages.push(text);
  }

  return pages.join('\n\n');
}

async function parseDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
