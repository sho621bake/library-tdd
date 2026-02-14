import { Library } from '../src/Library'
import { Book } from '../src/Book'
import { Member } from '../src/Member'
import { LibraryError } from '../src/errors'
import { Notifier } from '../src/Notifier'

describe('Library(図書館)', () => {
  let library: Library
  let member: Member
  let book: Book

  beforeEach(() => {
    library = new Library()
    book = new Book('978-4-00-000001-0', '文学', '吾輩は猫である', '夏目漱石')
    member = new Member('M001', '山田太郎')
    library.addBook(book)
    library.addMember(member)
  })

  describe('貸出', () => {
    it('会員が蔵書を借りられること', () => {
      library.checkout(member.id, book.isbn)

      expect(book.isAvailable).toBe(false)
      expect(member.hasBorrowed(book)).toBe(true)
    })

    it('存在しない本を借りようとするとエラーになること', () => {
      expect(() => {
        library.checkout(member.id, '999-UNKNOW')
      }).toThrow(LibraryError)

      try {
        library.checkout(member.id, '999-UNKNOW')
      } catch (e) {
        expect(e).toBeInstanceOf(LibraryError)
        expect((e as LibraryError).code).toBe('BOOK_NOT_FOUND')
      }
    })

    it('存在しない会員が本を借りようとするとエラーになること', () => {
      expect(() => {
        library.checkout('UNKNOWN_MEMBER', book.isbn)
      })
    })

    it('貸出中の本は借りられないこと', () => {
      library.checkout(member.id, book.isbn)
      const member2 = new Member('M002', '鈴木次郎')
      library.addMember(member2)

      expect(() => {
        library.checkout(member2.id, book.isbn)
      }).toThrow('この本は現在貸出中です')
    })

    it('貸出上限(3冊)を超えて借りようとするとエラーになること', () => {
      // テストデータ準備用ヘルパー
      const addBooks = (...isbns: string[]) => {
        return isbns.map((isbns, i) => {
          const b = new Book(
            isbns,
            `ジャンル${i + 1}`,
            `タイトル${i + 1}`,
            `著者${i + 1}`,
          )
          library.addBook(b)
          return b
        })
      }

      const [book2, book3, book4] = addBooks(
        '978-4-00-000002-0',
        '978-4-00-000003-0',
        '978-4-00-000004-0',
      )

      library.checkout(member.id, book.isbn)
      library.checkout(member.id, book2.isbn)
      library.checkout(member.id, book3.isbn)

      expect(() => {
        library.checkout(member.id, book4.isbn)
      }).toThrow('貸出上限に達しています')
    })

    it('上限まで借りて1冊返却すると、再度借りられること', () => {
      const book2 = new Book(
        '978-4-00-000002-0',
        '文学',
        '坊っちゃん',
        '夏目漱石',
      )
      const book3 = new Book('978-4-00-000003-0', '文学', 'こころ', '夏目漱石')
      const book4 = new Book('978-4-00-000004-0', '文学', '三四郎', '夏目漱石')
      library.addBook(book2)
      library.addBook(book3)
      library.addBook(book4)

      library.checkout(member.id, book.isbn)
      library.checkout(member.id, book2.isbn)
      library.checkout(member.id, book3.isbn)
      // 1冊返却
      library.returnBook(member.id, book.isbn)

      expect(() => {
        library.checkout(member.id, book4.isbn)
      }).not.toThrow()
    })
  })

  describe('返却', () => {
    it('借りた本を返却できること', () => {
      library.checkout(member.id, book.isbn)
      library.returnBook(member.id, book.isbn)

      expect(book.isAvailable).toBe(true)
      expect(member.hasBorrowed(book)).toBe(false)
    })

    it('借りていない本を返却しようとするとエラーになること', () => {
      expect(() => {
        library.returnBook(member.id, book.isbn)
      }).toThrow('この本は借りていません。')
    })

    it('他の会員が借りている本を返却しようとするとエラーになること', () => {
      library.checkout(member.id, book.isbn)
      const member2 = new Member('M002', '鈴木次郎')
      library.addMember(member2)

      expect(() => {
        library.returnBook(member2.id, book.isbn)
      }).toThrow('この本は借りていません。')
    })

    it('返却後は別の会員が借りられること', () => {
      library.checkout(member.id, book.isbn)
      library.returnBook(member.id, book.isbn)
      const member2 = new Member('M002', '鈴木次郎')
      library.addMember(member2)

      expect(() => {
        library.checkout(member2.id, book.isbn)
      }).not.toThrow()
      expect(member2.hasBorrowed(book)).toBe(true)
    })

    it('期限内の返却では延滞料金が0円であること', () => {
      const checkOutDate = new Date('2026-02-01')
      library.checkout(member.id, book.isbn, checkOutDate)

      const returnDate = new Date('2026-02-10')
      const result = library.returnBook(member.id, book.isbn, returnDate)

      expect(result.fine.amount).toBe(0)
    })

    it('延滞した返却では延滞料金が発生する', () => {
      const checkoutDate = new Date('2026-02-01')
      library.checkout(member.id, book.isbn, checkoutDate)

      const returnDate = new Date('2026-02-20')
      const result = library.returnBook(member.id, book.isbn, returnDate)

      expect(result.fine.amount).toBe(250)
      expect(result.returnDate).toEqual(returnDate)
    })
  })

  describe('延滞チェック', () => {
    it('延滞中の会員は新たに本を借りられないこと', () => {
      // 2月1日に貸出
      const checkoutDate = new Date('2026-02-01')
      library.checkout(member.id, book.isbn, checkoutDate)

      // 2月20日(延滞中)に別の本を借りようとする
      const book2 = new Book(
        '978-4-00-000002-0',
        '文学',
        '坊っちゃん',
        '夏目漱石',
      )
      library.addBook(book2)
      const today = new Date('2026-02-20')

      expect(() => {
        library.checkout(member.id, book2.isbn, today)
      }).toThrow('延滞中のため貸出できません')
    })

    it('返却期限内であれば追加で借りられること', () => {
      // 2月1日に貸出
      const checkoutDate = new Date('2026-02-01')
      library.checkout(member.id, book.isbn, checkoutDate)

      const book2 = new Book(
        '978-4-00-000002-0',
        '文学',
        '坊っちゃん',
        '夏目漱石',
      )
      library.addBook(book2)
      const today = new Date('2026-02-10') // 返却期限前

      expect(() => {
        library.checkout(member.id, book2.isbn, today)
      }).not.toThrow()
    })

    it('延滞中の本を返却すれば再度借りられること', () => {
      library.checkout(member.id, book.isbn, new Date('2026-02-01'))

      // 延滞状態で返却
      library.returnBook(member.id, book.isbn)

      // 返却後は借りられる
      const book2 = new Book(
        '978-4-00-000002-0',
        '文学',
        '坊っちゃん',
        '夏目漱石',
      )
      library.addBook(book2)

      expect(() => {
        library.checkout(member.id, book2.isbn, new Date('2026-02-20'))
      }).not.toThrow()
    })
  })

  describe('通知', () => {
    it('貸出時にNotifierが呼ばれる', () => {
      const notifier: Notifier = {
        send: jest.fn(),
      }
      const libraryWithNotifier = new Library(undefined, notifier)
      const b = new Book(
        '978-4-00-000001-0',
        '文学',
        '吾輩は猫である',
        '夏目漱石',
      )
      const m = new Member('M001', '田中太郎')
      libraryWithNotifier.addBook(b)
      libraryWithNotifier.addMember(m)

      libraryWithNotifier.checkout(m.id, b.isbn)

      expect(notifier.send).toHaveBeenCalledWith(
        m,
        '「吾輩は猫である」を貸出ました。',
      )
    })

    it('Notifierが設定されていなくれも貸出は成功する', () => {
      library.checkout(member.id, book.isbn)

      expect(book.isAvailable).toBe(false)
    })

    it('Notifierが例外を投げても貸出は成功する', () => {
      const failedNotifier: Notifier = {
        send: jest.fn(() => {
          throw new Error('通知サービスダウン中')
        }),
      }
      const lib = new Library(undefined, failedNotifier)
      const b = new Book(
        '978-4-00-000001-0',
        '文学',
        '吾輩は猫である',
        '夏目漱石',
      )
      const m = new Member('M001', '田中太郎')
      lib.addBook(b)
      lib.addMember(m)

      expect(() => lib.checkout(m.id, b.isbn)).not.toThrow()
      expect(b.isAvailable).toBe(false)
    })
  })
})
