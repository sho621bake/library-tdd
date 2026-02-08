import { Book } from '../src/Book'

describe('Book(蔵書)', () => {
  it('ISBN・ジャンル・タイトル・著者を保持する', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    expect(book.isbn).toBe('978-4-00-000001-0')
    expect(book.genre).toBe('文学')
    expect(book.title).toBe('吾輩は猫である')
    expect(book.author).toBe('夏目漱石')
  })

  it('初期状態では貸出可能であること', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    expect(book.isAvailable).toBe(true)
  })

  it('checkout()で貸出中になること', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    book.checkout()

    expect(book.isAvailable).toBe(false)
  })

  it('returnBook()で貸出可能に戻ること', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    book.checkout()
    book.returnBook()

    expect(book.isAvailable).toBe(true)
  })

  it('貸出中にcheckout()するとエラーになること', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    book.checkout()

    expect(() => {
      book.checkout()
    }).toThrow('この本はすでに貸出中です。')
  })

  it('ISBNが同じならequals()はtrueを返すこと', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    expect(book.equals('978-4-00-000001-0')).toBe(true)
  })

  it('toString()で〚タイトル〛(著者)形式の文字列を返すこと', () => {
    const book = new Book(
      '978-4-00-000001-0',
      '文学',
      '吾輩は猫である',
      '夏目漱石',
    )

    expect(book.toString()).toBe('〚吾輩は猫である〛(夏目漱石)')
  })
})
