import { Book } from './Book'
import { Member } from './Member'
import { LibraryError } from './errors'

export class Library {
  private books: Map<string, Book> = new Map()
  private members: Map<string, Member> = new Map()
  private static readonly MAX_LOANS = 3

  /**
   * 蔵書を追加する
   * @param {Book} book
   * @returns {void}
   */
  addBook(book: Book): void {
    this.books.set(book.isbn, book)
  }

  /**
   * 会員を追加する
   * @param {Member} member
   * @returns {void}
   */
  addMember(member: Member): void {
    this.members.set(member.id, member)
  }

  /**
   * 会員に本を貸し出す
   * @param {string} memberId
   * @param {string} isbn
   * @throws {LibraryError}
   * @returns {void}
   */
  checkout(memberId: string, isbn: string): void {
    const book = this.findBookOrThrow(isbn)
    const member = this.findMemberOrThrow(memberId)

    if (!book.isAvailable) {
      throw new LibraryError('BOOK_NOT_AVAILABLE', 'この本はすでに貸出中です。')
    }
    if (member.borrowedCount >= Library.MAX_LOANS) {
      throw new LibraryError('MAX_LOANS_REACHED', `貸出上限に達しています。`)
    }

    book.checkout()
    member.borrow(book)
  }

  /**
   * 会員が本を返却する
   * @param {string} memberId
   * @param {string} isbn
   * @throws {LibraryError}
   * @returns {void}
   */
  returnBook(memberId: string, isbn: string): void {
    const book = this.findBookOrThrow(isbn)
    const member = this.findMemberOrThrow(memberId)

    if (!member.hasBorrowed(book)) {
      throw new LibraryError('NOT_BORROWED', 'この本は借りていません。')
    }
    book.returnBook()
    member.returnBook(book)
  }

  /**
   * ISBNで本を検索し、存在しなければエラーを投げる
   * @param {string} isbn
   * @throws {LibraryError}
   * @returns {Book}
   */
  private findBookOrThrow(isbn: string): Book {
    const book = this.books.get(isbn)
    if (!book) {
      throw new LibraryError('BOOK_NOT_FOUND', '指定された本は存在しません。')
    }
    return book
  }

  /**
   * 会員IDで会員を検索し、存在しなければエラーを投げる
   * @param {string} memberId
   * @returns {Member}
   */
  private findMemberOrThrow(memberId: string): Member {
    const member = this.members.get(memberId)
    if (!member) {
      throw new LibraryError(
        'MEMBER_NOT_FOUND',
        '指定された会員は存在しません。',
      )
    }
    return member
  }
}
