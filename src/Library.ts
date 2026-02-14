import { Book } from './Book'
import {
  BookAvailableRule,
  LendingContext,
  LendingRule,
  MaxLoansRule,
  NoOverdueRule,
} from './LendingRule'
import { Loan } from './Loan'
import { Member } from './Member'
import { Notifier } from './Notifier'
import { LibraryError } from './errors'

export class Library {
  private books: Map<string, Book> = new Map()
  private members: Map<string, Member> = new Map()
  private activeLoans: Loan[] = []
  private lendingrules: LendingRule[] = []
  private notifier?: Notifier
  private static readonly MAX_LOANS = 3

  constructor(rules?: LendingRule[], notifier?: Notifier) {
    // デフォルトルールを設定。外部からカスタムルールも注入可能
    this.lendingrules = rules ?? [
      new BookAvailableRule(),
      new MaxLoansRule(Library.MAX_LOANS),
      new NoOverdueRule(),
    ]
    this.notifier = notifier
  }

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
  checkout(
    memberId: string,
    isbn: string,
    currentDate: Date = new Date(),
  ): void {
    const book = this.findBookOrThrow(isbn)
    const member = this.findMemberOrThrow(memberId)

    const context: LendingContext = {
      book,
      member,
      activeLoans: this.activeLoans,
      currentDate,
    }

    for (const rule of this.lendingrules) {
      const result = rule.check(context)
      if (!result.ok) {
        throw new LibraryError('RULE_VIOLATION', result.reason)
      }
    }

    // 不変条件：book.checkout() と loan追加は必ずセット
    const loan = new Loan(book, member, currentDate)
    this.activeLoans.push(loan)
    book.checkout()
    member.borrow(book)

    // 通知(失敗しても貸出を巻き戻さない)
    try {
      this.notifier?.send(member, `「${book.title}」を貸出ました。`)
    } catch {}
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

    // 不変条件：book.returnBook() と loan削除は必ずセット
    this.activeLoans = this.activeLoans.filter(
      (loan) => !(loan.book.isbn === isbn && loan.member.id === memberId),
    )
    book.returnBook()
    member.returnBook(book)
  }

  /**
   * 会員が期限切れの貸出を持っているかどうか
   * @param {string} memberId
   * @param {Date} currentDate
   * @returns {boolean}
   */
  private hasOverdueLoans(memberId: string, currentDate: Date): boolean {
    return this.activeLoans.some(
      (loan) => loan.member.id === memberId && loan.isOverdue(currentDate),
    )
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
