/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus } from "lucide-react";
import { TextReveal } from "@/components/text-reveal";

export function BathroomSelector({ updateFormData, formData }) {
  const [bathrooms, setBathrooms] = useState([
    {
      id: "private",
      title: "Private and attached",
      description: "It's connected to the guest's room and is just for them.",
      count: formData?.bathroomTypes?.private || 0,
    },
    {
      id: "dedicated",
      title: "Dedicated",
      description:
        "It's private, but accessed via a shared space, such as a hallway.",
      count: formData?.bathroomTypes?.dedicated || 0,
    },
    {
      id: "shared",
      title: "Shared",
      description: "It's shared with other people.",
      count: formData?.bathroomTypes?.shared || 0,
    },
  ]);

  useEffect(() => {
    const bathroomTypes = bathrooms.reduce((acc, bathroom) => {
      acc[bathroom.id] = bathroom.count;
      return acc;
    }, {});

    updateFormData({ bathroomTypes });
  }, [bathrooms]);

  const MAX_BATHROOMS = Number(formData?.bathrooms || 0);

  const totalSelected = bathrooms.reduce((sum, b) => sum + b.count, 0);

  // const updateCount = (id, increment) => {
  //   setBathrooms(
  //     bathrooms.map((bathroom) =>
  //       bathroom.id === id
  //         ? {
  //             ...bathroom,
  //             count: Math.max(0, bathroom.count + (increment ? 1 : -1)),
  //           }
  //         : bathroom
  //     )
  //   );
  // };

  const updateCount = (id, increment) => {
    setBathrooms((prev) => {
      const totalSelected = prev.reduce((sum, b) => sum + b.count, 0);

      return prev.map((bathroom) => {
        if (bathroom.id !== id) return bathroom;

        // ❌ Block increment if limit reached
        if (increment && totalSelected >= MAX_BATHROOMS) {
          return bathroom;
        }

        return {
          ...bathroom,
          count: Math.max(0, bathroom.count + (increment ? 1 : -1)),
        };
      });
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="space-y-8 mb-12">
        <TextReveal>
          <h3 className="text-xl md:text-2xl font-bricolage text-absoluteDark font-semibold">
            What kind of bathrooms are available to guests?
          </h3>
        </TextReveal>

        <TextReveal>
          <div className="space-y-4">
            {bathrooms.map((bathroom) => (
              <Card key={bathroom.id} className="p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-medium">{bathroom.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {bathroom.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateCount(bathroom.id, false)}
                      className="transition-all h-9 w-9 bg-gray-50 border border-absoluteDark rounded-full duration-200 ease-in-out"
                      disabled={bathroom.count === 0}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="text-lg w-4 text-center">
                      {bathroom.count}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateCount(bathroom.id, true)}
                      disabled={totalSelected >= MAX_BATHROOMS}
                      className="transition-all h-9 w-9 bg-gray-50 border border-absoluteDark rounded-full duration-200 ease-in-out"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TextReveal>
      </div>
    </div>
  );
}
