import { Member } from './Member'

/**
 * 通知を送るインターフェース。
 * 実際のメール送信やSMS送信の実装はここでは行わず、
 * テスト時はスパイ（jest.fn()）で代替する。
 */
export interface Notifier {
  send(member: Member, message: string): void
}
