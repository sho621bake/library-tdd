import { Loan } from '../src/Loan'
import { Book } from '../src/Book'
import { Member } from '../src/Member'

describe('Loan(貸出記録)', () => {
  let book: Book
  let member: Member

  beforeEach(() => {
    book = new Book('978-4-00-000001-0', '文学', '吾輩は猫である', '夏目漱石')
    member = new Member('M001', '山田太郎')
  })

  it('貸出日と返却期限(14日後)を保持すること', () => {
    const checkoutDate = new Date('2026-02-08')
    const loan = new Loan(book, member, checkoutDate)

    expect(loan.checkoutDate).toEqual(checkoutDate)
    expect(loan.dueDate).toEqual(new Date('2026-02-22'))
  })

  it('返却期限内であれば延滞ではないこと', () => {
    const loan = new Loan(book, member, new Date('2026-02-010'))

    expect(loan.isOverdue(new Date('2026-02-20'))).toBe(false)
  })

  it('返却期限を過ぎると延滞になること', () => {
    const loan = new Loan(book, member, new Date('2026-02-01'))

    expect(loan.isOverdue(new Date('2026-02-16'))).toBe(true)
  })

  it('返却期限当日は延滞ではないこと (境界値テスト)', () => {
    const loan = new Loan(book, member, new Date('2026-02-01'))

    // 期限：2026-02-15 2026-02-15はまだセーフ
    expect(loan.isOverdue(new Date('2026-02-15'))).toBe(false)
  })

  it('返却期限翌日から延滞になること (境界値テスト)', () => {
    const loan = new Loan(book, member, new Date('2026-02-01'))

    // 期限：2026-02-15 2026-02-16からアウト
    expect(loan.isOverdue(new Date('2026-02-16'))).toBe(true)
  })
})
