interface RazorpayInstance {
  open(): void
  on(event: string, cb: () => void): void
}

declare global {
  interface Window {
    Razorpay: new (opts: unknown) => RazorpayInstance
  }
}

export {}
