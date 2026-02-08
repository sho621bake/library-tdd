import { Book } from './Book'
import { Member } from './Member'

export class Loan {
  private static readonly LOAN_PERIOD_DAYS = 14

  readonly book: Book
  readonly member: Member
  readonly checkoutDate: Date
  readonly dueDate: Date

  constructor(book: Book, member: Member, checkoutDate: Date) {
    this.book = book
    this.member = member
    this.checkoutDate = checkoutDate
    this.dueDate = this.calculateDueDate(checkoutDate)
  }

  /**
   * 期限内かどうかを判定する
   * @param {Date} currentDate
   * @returns {boolean}
   */
  isOverdue(currentDate: Date): boolean {
    return currentDate > this.dueDate
  }

  /**
   * 期限日を計算する
   * @param {Date} from
   * @returns {Date}
   */
  private calculateDueDate(from: Date): Date {
    const dueDate = new Date(from)
    dueDate.setDate(dueDate.getDate() + Loan.LOAN_PERIOD_DAYS)
    return dueDate
  }
}
