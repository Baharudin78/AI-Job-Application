// Ambient types for the classic pdf-parse v1 internal entrypoint, which we
// import directly to avoid the package index's debug-mode file read.
declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PdfParseResult {
    text: string
    numpages: number
    numrender: number
    info: unknown
    metadata: unknown
    version: string
  }
  function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>
  export = pdfParse
}
