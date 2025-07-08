import React from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Info, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

export default function Page() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-24 md:py-32 md:px-6 lg:px-8 font-publicSans">
        <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bricolage font-semibold mb-1 text-center">Stay Confirmed</h1>
              <p className="text-lg md:text-xl text-muted-foreground text-center">Thanks for choosing us</p>
            </div>

          </div>
          </div>
  );
}
