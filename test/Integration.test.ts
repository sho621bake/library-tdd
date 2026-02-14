import { Book } from '../src/Book'
import { Library } from '../src/Library'
import { Member } from '../src/Member'
import { Notifier } from '../src/Notifier'

describe('統合テスト：図書シナリオ', () => {
  let notifier: Notifier

  function createLibraryWithFixture() {
    const books = {
      neko: new Book('978-4-00-000001-0', '文学', '吾輩は猫である', '夏目漱石'),
      botchan: new Book('978-4-00-000002-0', '文学', '坊っちゃん', '夏目漱石'),
      kokoro: new Book('978-4-00-000003-0', '文学', 'こころ', '夏目漱石'),
      sanshiro: new Book('978-4-00-000004-0', '文学', '三四郎', '夏目漱石'),
    }

    const members = {
      tanaka: new Member('M001', '田中太郎'),
      sato: new Member('M002', '佐藤花子'),
    }

    notifier = { send: jest.fn() }
    const library = new Library(undefined, notifier)

    Object.values(books).forEach((b) => library.addBook(b))
    Object.values(members).forEach((m) => library.addMember(m))

    return { library, books, members }
  }

  it('正常な貸出・返却フロー', () => {
    const { library, books } = createLibraryWithFixture()
    const now = new Date('2026-02-01')

    library.checkout('M001', books.neko.isbn, now)
    library.checkout('M001', books.botchan.isbn, now)

    expect(books.neko.isAvailable).toBe(false)
    expect(books.botchan.isAvailable).toBe(false)

    // 通知が2回呼ばれた
    expect(notifier.send).toHaveBeenCalledTimes(2)

    // 期限内に返却
    const result = library.returnBook(
      'M001',
      books.neko.isbn,
      new Date('2026-02-10'),
    )
    expect(result.fine.amount).toBe(0)
    expect(books.neko.isAvailable).toBe(true)
  })

  it('延滞 → 貸出ブロック → 返却 → 貸出可能になる', () => {
    const { library, books } = createLibraryWithFixture()

    library.checkout('M001', books.neko.isbn, new Date('2026-02-01'))

    expect(() => {
      library.checkout('M001', books.botchan.isbn, new Date('2026-02-20'))
    }).toThrow('延滞中のため貸出できません')

    const result = library.returnBook(
      'M001',
      books.neko.isbn,
      new Date('2026-02-20'),
    )
    expect(result.fine.amount).toBe(250)

    expect(() => {
      library.checkout('M001', books.botchan.isbn, new Date('2026-02-20'))
    }).not.toThrow()
  })

  it('異なる会員は独立して操作できる', () => {
    const { library, books } = createLibraryWithFixture()
    const now = new Date('2026-02-01')

    library.checkout('M001', books.neko.isbn, now)
    library.checkout('M002', books.botchan.isbn, now)

    expect(books.neko.isAvailable).toBe(false)
    expect(books.botchan.isAvailable).toBe(false)

    // M001が延滞してもM002は影響なし
    expect(() => {
      library.checkout('M002', books.kokoro.isbn, new Date('2026-02-14'))
    }).not.toThrow()
  })
})
