export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type Theme = 'auto' | 'light' | 'dark'

export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type DismissReason = 'close' | 'timer' | 'click' | 'api' | 'replace'

export interface CustomClass {
  dock?: string
  item?: string
  icon?: string
  title?: string
  text?: string
  close?: string
}

export interface Options {
  id?: string
  type?: ToastType
  title?: string
  text?: string
  html?: string
  theme?: Theme
  position?: Position
  duration?: number
  closable?: boolean
  recede?: boolean
  pauseOnHover?: boolean
  icon?: boolean
  href?: string
  hrefTarget?: string
  width?: number
  gap?: number
  offsetX?: number
  offsetY?: number
  customClass?: string | CustomClass | null
  onShow?: ((toast: { id: string }) => void) | null
  onDismiss?: ((result: ToastResult) => void) | null
}

export interface ToastResult {
  id: string
  dismiss: DismissReason
}

export interface ToastHandle extends Promise<ToastResult> {
  id: string
  dismiss(): Promise<ToastResult>
}

export type Helper = (
  title?: string,
  text?: string,
  extra?: Options
) => ToastHandle

export interface ModernToastAPI {
  show(options?: Options): ToastHandle
  show(title: string, text?: string, type?: ToastType): ToastHandle
  dismiss(id?: string): Promise<ToastResult | ToastResult[] | void>
  dismissAll(): Promise<ToastResult[]>
  setDefaults(options?: Partial<Options>): Options
  getDefaults(): Options
  isVisible(): boolean
  success: Helper
  error: Helper
  warning: Helper
  info: Helper
}

declare const ModernToast: ModernToastAPI

export as namespace ModernToast
export { ModernToast }
export default ModernToast

declare global {
  interface Window {
    ModernToast: ModernToastAPI
    ModernToastIcons?: Record<string, string>
  }

  const ModernToast: ModernToastAPI
}
