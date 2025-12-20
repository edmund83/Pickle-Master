declare module 'bwip-js' {
  interface BwipOptions {
    bcid: string
    text: string
    scale?: number
    height?: number
    width?: number
    includetext?: boolean
    textxalign?: 'offleft' | 'left' | 'center' | 'right' | 'offright' | 'justify'
    textyalign?: 'below' | 'center' | 'above'
    textsize?: number
    textfont?: string
    textgaps?: number
    alttext?: string
    showborder?: boolean
    borderwidth?: number
    backgroundcolor?: string
    barcolor?: string
    textcolor?: string
    padding?: number
    paddingwidth?: number
    paddingheight?: number
  }

  export function toCanvas(
    canvas: HTMLCanvasElement,
    options: BwipOptions
  ): void

  export function toBuffer(options: BwipOptions): Promise<Buffer>

  export function toDataURL(options: BwipOptions): Promise<string>

  export function toSVG(options: BwipOptions): string
}
