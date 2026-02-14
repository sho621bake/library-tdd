import { Loan } from './Loan'

export class Fine {
  private static readonly DAILY_RATE = 50
  readonly amount: number

  constructor(amount: number) {
    if (amount < 0) {
      throw new Error('料金は0以上でなければなりません')
    }
    this.amount = amount
  }

  static calcurate(loan: Loan, returnDate: Date): Fine {
    if (returnDate <= loan.dueDate) {
      return new Fine(0)
    }

    const diffMs = returnDate.getTime() - loan.dueDate.getTime()
    const overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    return new Fine(overdueDays * Fine.DAILY_RATE)
  }

  isZero(): boolean {
    return this.amount === 0
  }

  equals(other: Fine): boolean {
    return this.amount === other.amount
  }

  add(other: Fine): Fine {
    return new Fine(this.amount + other.amount)
  }

  toString(): string {
    return `${this.amount}円`
  }
}
