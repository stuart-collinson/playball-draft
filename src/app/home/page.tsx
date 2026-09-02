import type { Metadata } from "next"
import type { JSX } from "react"
import { HomeVariantGallery } from "@pbd/components/HomeVariantGallery"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Home Concepts" }

const HomePage = (): JSX.Element => <HomeVariantGallery />

export default HomePage
