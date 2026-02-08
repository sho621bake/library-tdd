export class Book {
  readonly isbn: string
  readonly genre: string
  readonly title: string
  readonly author: string
  private _isAvailable: boolean

  constructor(isbn: string, genre: string, title: string, author: string) {
    this.isbn = isbn
    this.genre = genre
    this.title = title
    this.author = author
    this._isAvailable = true
  }

  get isAvailable(): boolean {
    return this._isAvailable
  }

  /**
   * 本を貸し出す
   */
  checkout(): void {
    if (!this._isAvailable) {
      throw new Error('この本はすでに貸出中です。')
    }

    this._isAvailable = false
  }

  /**
   * 本を返却する
   */
  returnBook(): void {
    this._isAvailable = true
  }

  /**
   * 同じISBNの本は同一とみなす
   * @param {string} isbn
   * @returns {boolean}
   */
  equals(isbn: string): boolean {
    return this.isbn === isbn
  }

  /**
   * 本の情報を文字列で返す
   * @returns {string}
   */
  toString(): string {
    return `〚${this.title}〛(${this.author})`
  }
}
