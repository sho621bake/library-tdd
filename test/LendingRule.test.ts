import { Book } from '../src/Book'
import {
  BookAvailableRule,
  LendingContext,
  MaxLoansRule,
  NoOverdueRule,
} from '../src/LendingRule'
import { Loan } from '../src/Loan'
import { Member } from '../src/Member'

describe('LendingRule(貸出ルール)', () => {
  let book: Book
  let member: Member

  beforeEach(() => {
    book = new Book('978-4-00-000001-0', '文学', '吾輩は猫である', '夏目漱石')
    member = new Member('M001', '山田太郎')
  })

  function createContext(
    overrides: Partial<LendingContext> = {},
  ): LendingContext {
    return {
      book,
      member,
      activeLoans: [],
      currentDate: new Date('2026-02-08'),
      ...overrides,
    }
  }

  describe('BookAvailableRule', () => {
    const rule = new BookAvailableRule()

    it('貸出可能な本ならパスすること', () => {
      const rusult = rule.check(createContext())

      expect(rusult.ok).toBe(true)
    })

    it('貸出中の本なら失敗すること', () => {
      book.checkout()
      const result = rule.check(createContext())

      expect(result.ok).toBe(false)
      expect(result.reason).toBe('この本は現在貸出中です')
    })
  })

  describe('MaxLoansRule', () => {
    it('上限未満ならパスすること', () => {
      const rule = new MaxLoansRule(3)
      const result = rule.check(createContext())

      expect(result.ok).toBe(true)
    })

    it('上限に達している場合は失敗すること', () => {
      const rule = new MaxLoansRule(3)
      // 3冊借りている状態をシュミレート
      member.borrow(new Book('978-0-01', 'ジャンル1', '本A', '著者A'))
      member.borrow(new Book('978-0-02', 'ジャンル2', '本B', '著者B'))
      member.borrow(new Book('978-0-03', 'ジャンル3', '本C', '著者C'))

      const result = rule.check(createContext())

      expect(result.ok).toBe(false)
      expect(result.reason).toBe('貸出上限に達しています')
    })

    it('上限を変えてテストできること(例：5冊上限)', () => {
      const rule = new MaxLoansRule(5)
      member.borrow(new Book('978-0-01', 'ジャンル1', '本A', '著者A'))
      member.borrow(new Book('978-0-02', 'ジャンル2', '本B', '著者B'))
      member.borrow(new Book('978-0-03', 'ジャンル3', '本C', '著者C'))

      const result = rule.check(createContext())

      expect(result.ok).toBe(true) // 3冊 < 5冊上限
    })
  })

  describe('NoOverdueRule', () => {
    it('延滞がなければパスすること', () => {
      const rule = new NoOverdueRule()
      const result = rule.check(createContext())

      expect(result.ok).toBe(true)
    })

    it('延滞中の貸出があれば失敗する', () => {
      const rule = new NoOverdueRule()
      const overdueLoan = new Loan(book, member, new Date('2026-01-01'))
      const context = createContext({
        activeLoans: [overdueLoan],
        currentDate: new Date('2026-02-08'),
      })

      const result = rule.check(context)

      expect(result.ok).toBe(false)
      expect(result.reason).toBe('延滞中のため貸出できません')
    })
  })
})
