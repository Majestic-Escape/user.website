import Link from "next/link"
import { ChevronRight } from 'lucide-react'
import Heading from '@/components/ui/heading'


export default function Component() {
  return (
    <div className="min-h-screen font-publicSans bg-white">
      <main className="container mx-auto py-12 sm:py-24 ">
        <div className="mx-auto max-w-7xl">
            <Heading text="Sitemap"/>
          <div className="grid gap-16 mt-16 sm:grid-cols-2 lg:grid-cols-4">
            {/* Company Section */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-primary">Company</h2>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/about"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/partners"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Partners
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blogs"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            {/* Host Section */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-primary">Host</h2>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/host"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Host your property
                  </Link>
                </li>
                <li>
                  <Link
                    href="/host"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Host an experience
                  </Link>
                </li>
                <li>
                  <Link
                    href="/host/guide"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Hosting Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guides"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="/safety"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Safety
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-primary">Legal</h2>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/privacy"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cancellation"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Cancellation Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/trust-safety"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Trust & Safety
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Cookies Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Section */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-primary">Support</h2>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/faq"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/complaints"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Complaints
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="group flex items-center text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="mr-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}