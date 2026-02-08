import { Book } from './Book'
import { Loan } from './Loan'
import { Member } from './Member'

/** ルール検証に必要な情報をまとめたオブジェクト */
export interface LendingContext {
  book: Book
  member: Member
  activeLoans: Loan[]
  currentDate: Date
}

/** ルール検証結果 */
// prettier-ignore
export type RuleResult =
  | { ok: true; reason?: never }
  | { ok: false; reason: string }

export interface LendingRule {
  check(context: LendingContext): RuleResult
}

// 本が貸出可能かどうかを検証する
export class BookAvailableRule implements LendingRule {
  check(context: LendingContext): RuleResult {
    if (!context.book.isAvailable) {
      return { ok: false, reason: 'この本は現在貸出中です' }
    }
    return { ok: true }
  }
}

// 貸出上限を検証する
export class MaxLoansRule implements LendingRule {
  constructor(private readonly maxLoans: number) {}
  check(context: LendingContext): RuleResult {
    if (context.member.borrowedCount >= this.maxLoans) {
      return { ok: false, reason: '貸出上限に達しています' }
    }
    return { ok: true }
  }
}

// 延滞がないことを検証する
export class NoOverdueRule implements LendingRule {
  check(context: LendingContext): RuleResult {
    const hasOverdue = context.activeLoans.some(
      (loan) =>
        loan.member.id === context.member.id &&
        loan.isOverdue(context.currentDate),
    )
    if (hasOverdue) {
      return { ok: false, reason: '延滞中のため貸出できません' }
    }
    return { ok: true }
  }
}
