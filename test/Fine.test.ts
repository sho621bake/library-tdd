import { Book } from '../src/Book'
import { Loan } from '../src/Loan'
import { Member } from '../src/Member'
import { Fine } from '../src/Fine'

describe('Fine(延滞料金)', () => {
  const book = new Book(
    '978-4-00-000001-0',
    '文学',
    '吾輩は猫である',
    '夏目漱石',
  )
  const member = new Member('M001', '田中太郎')

  it('延滞していなければ料金は0円', () => {
    const loan = new Loan(book, member, new Date('2026-02-01'))
    const returnDate = new Date('2026-02-10')

    const fine = Fine.calcurate(loan, returnDate)

    expect(fine.amount).toBe(0)
    expect(fine.isZero()).toBe(true)
  })

  it('1日延滞で250円', () => {
    const loan = new Loan(book, member, new Date('2026-02-01'))
    const returnDate = new Date('2026-02-16')
    const fine = Fine.calcurate(loan, returnDate)

    expect(fine.amount).toBe(50)
  })

  it('5日延滞で250円', () => {
    const loan = new Loan(book, member, new Date('2026-02-01'))
    const returnDate = new Date('2026-02-20')

    const fine = Fine.calcurate(loan, returnDate)

    expect(fine.amount).toBe(250)
  })

  it('期限当日の返却は0円(境界値)', () => {
    const loan = new Loan(book, member, new Date('2026-02-01'))
    const returnDate = new Date('2026-02-15')

    const fine = Fine.calcurate(loan, returnDate)

    expect(fine.amount).toBe(0)
  })

  it('同じ金額のFineは等しい', () => {
    const fine1 = new Fine(100)
    const fine2 = new Fine(100)

    expect(fine1.equals(fine2)).toBe(true)
  })

  it('Fineを加算できる(新しいFineが返える)', () => {
    const fine1 = new Fine(100)
    const fine2 = new Fine(250)

    const total = fine1.add(fine2)

    expect(total.amount).toBe(350)
    expect(fine1.amount).toBe(100)
  })

  it('負の金額ではエラーになる', () => {
    expect(() => new Fine(-100)).toThrow('料金は0以上でなければなりません')
  })
})
