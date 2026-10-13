import {
  Bangers,
  Berkshire_Swash,
  Cherry_Bomb_One,
  Creepster,
  Fredoka,
  Henny_Penny,
  Josefin_Sans,
  Limelight,
  Lora,
  Luckiest_Guy,
  Mountains_of_Christmas,
  Playfair_Display,
  Press_Start_2P,
  UnifrakturMaguntia,
} from "next/font/google"

export const comicFont = Bangers({ weight: "400", subsets: ["latin"], display: "swap" })

export const luckiestGuyFont = Luckiest_Guy({
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

export const halloweenTitleFont = Creepster({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export const halloweenBodyFont = Henny_Penny({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export const christmasTitleFont = Mountains_of_Christmas({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export const christmasBodyFont = Berkshire_Swash({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export const easterTitleFont = Cherry_Bomb_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export const easterBodyFont = Fredoka({ subsets: ["latin"], display: "swap", preload: false })

export const newYearTitleFont = Limelight({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export const newYearBodyFont = Josefin_Sans({ subsets: ["latin"], display: "swap", preload: false })
