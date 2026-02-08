/**
 * 図書館ドメイン固有のエラー
 * codeでエラー種別を識別し、messageは人間向けの説明
 */
export class LibraryError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'LibraryError'
  }
}
