import { Member } from '../src/Member'
import { Book } from '../src/Book'

describe('Member(会員)', () => {
  let member: Member

  beforeEach(() => {
    member = new Member('M001', '山田太郎')
  })

  it('IDと名前を保持する', () => {
    expect(member.id).toBe('M001')
    expect(member.name).toBe('山田太郎')
  })

  it('初期状態では貸出中の本が0冊であること', () => {
    expect(member.borrowedCount).toBe(0)
  })

  it('本を借りると貸出中中リストに追加されること', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    member.borrow(book)

    expect(member.borrowedCount).toBe(1)
    expect(member.hasBorrowed(book)).toBe(true)
  })

  it('本を返すと貸出中リストから除外されること', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    member.borrow(book)
    member.returnBook(book)
    expect(member.borrowedCount).toBe(0)
    expect(member.hasBorrowed(book)).toBe(false)
  })

  it('借りていない本を返そうとするとエラーになること', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    expect(() => {
      member.returnBook(book)
    }).toThrow('この本は借りていません。')
  })

  it('同じ本を２重に借りることはできないこと', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    member.borrow(book)

    expect(() => {
      member.borrow(book)
    }).toThrow('この本はすでに借りています。')
  })

  it('borrowedBooksは内部配列のコピーを返すこと(内部漏洩防止)', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    member.borrow(book)

    const list = member.borrowedBooks
    list.length = 0 // 外から破壊しようとする

    expect(member.borrowedCount).toBe(1) // 内部状態は変わらない
  })

  it('equals()で会員IDの比較ができること', () => {
    expect(member.equals(member.id, 'M001')).toBe(true)
    expect(member.equals(member.id, 'M002')).toBe(false)
  })
})
