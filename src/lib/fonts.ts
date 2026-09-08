import {
  Bangers,
  Lora,
  Luckiest_Guy,
  Playfair_Display,
  Press_Start_2P,
  UnifrakturMaguntia,
} from "next/font/google"

export const comicFont = Bangers({ weight: "400", subsets: ["latin"], display: "swap" })

export const comicNumberFont = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export const teletextFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export const newspaperMastheadFont = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export const newspaperHeadlineFont = Playfair_Display({ subsets: ["latin"], display: "swap" })

export const newspaperBodyFont = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
})
