import { Library } from '../src/Library'
import { Book } from '../src/Book'
import { Member } from '../src/Member'
import { LibraryError } from '../src/errors'

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
      }).toThrow('この本はすでに貸出中です。')
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
      }).toThrow('貸出上限に達しています。')
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
  })
})
