import { Book } from './Book'

export class Member {
  readonly id: string
  readonly name: string
  private _borrowedBooks: Book[] = []

  constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  get borrowedCount(): number {
    return this._borrowedBooks.length
  }

  /**
   * 貸出中の本一覧(コピーを返し、内部配列を保護する)
   * @returns {Book[]}
   */
  get borrowedBooks(): Book[] {
    return [...this._borrowedBooks]
  }

  /**
   * 本を借りる
   * @param {Book} book
   * @returns {void}
   */
  borrow(book: Book): void {
    if (this.hasBorrowed(book)) {
      throw new Error('この本はすでに借りています。')
    }

    this._borrowedBooks.push(book)
  }

  /**
   * 本を返す
   * @param {Book} book
   * @returns {void}
   */
  returnBook(book: Book): void {
    if (!this.hasBorrowed(book)) {
      throw new Error('この本は借りていません。')
    }

    this._borrowedBooks = this._borrowedBooks.filter(
      (b) => b.isbn !== book.isbn,
    )
  }

  /**
   * 本を借りているかどうか
   * @param {Book} book
   * @returns {boolean}
   */
  hasBorrowed(book: Book): boolean {
    return this._borrowedBooks.some((b) => b.isbn === book.isbn)
  }

  /**
   * 同じIDの会員は同一とみなす
   * @param {string} id
   * @param {string} checkId
   * @returns {boolean}
   */
  equals(id: string, checkId: string): boolean {
    return id === checkId
  }
}
