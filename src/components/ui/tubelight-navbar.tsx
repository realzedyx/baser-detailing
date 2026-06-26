"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon, User } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [, setIsMobile] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsSignedIn(!!data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsSignedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleNav = (e: React.MouseEvent, item: NavItem) => {
    setActiveTab(item.name)

    // Top of page
    if (item.url === "#") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    // "Why us?" is a GSAP-pinned, scrubbed section. A native anchor jump lands on
    // the pin START (progress 0 — nothing animated in yet). Instead jump straight to
    // the END of the pin so all the card animations are settled. We use an instant
    // jump (not smooth) because native smooth-scroll gets absorbed at the pin boundary;
    // the scrub then eases the reveal over ~1s from wherever we were.
    if (item.url === "#services") {
      const st = ScrollTrigger.getAll().find(
        (t) => t.vars.pin && (t.trigger as HTMLElement | undefined)?.id === "services",
      )
      if (st) {
        e.preventDefault()
        window.scrollTo({ top: Math.max(0, st.end - 2) })
        return
      }
    }

    // Other hash links are plain-scroll sections — let the native anchor handle them.
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6 pointer-events-none",
        className,
      )}
    >
      <div className="pointer-events-auto flex items-center gap-1 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={(e) => handleNav(e, item)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}

        {/* Divider */}
        <div className="w-px h-5 mx-1 rounded-full bg-border/60" />

        {/* Account */}
        <Link
          href={isSignedIn ? "/account" : "/signin"}
          aria-label="My account"
          className="relative cursor-pointer flex items-center justify-center w-9 h-9 rounded-full transition-colors text-foreground/60 hover:text-[#CBA65C]"
          style={{ background: "rgba(203,166,92,0.07)", border: "1px solid rgba(203,166,92,0.18)" }}
        >
          <User size={16} strokeWidth={2} />
        </Link>
      </div>
    </div>
  )
}
