"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ProjectCardProps {
  name: string;
  description: string;
  image: string;
  detailedDescription: string;
}

export function ProjectCard({
  name,
  description,
  image,
  detailedDescription,
}: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer overflow-hidden relative h-full w-full aspect-square flex flex-col justify-end p-0 border-none shadow-lg transition-all">
          {/* Background Image or Placeholder */}
          <div className="absolute inset-0">
            {image ? (
              <img
                src={image}
                alt={`${name} task force`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const placeholder = target.nextElementSibling as HTMLElement;
                  if (placeholder) {
                    placeholder.style.display = "flex";
                  }
                }}
              />
            ) : (
              <div
                className={`h-full w-full bg-accent-foreground ${image ? "hidden" : "flex"} items-center justify-center`}
                style={{ display: image ? "none" : "flex" }}
              >
                <img
                  src="/assets/logo_new_white_standard.png"
                  alt="Placeholder"
                  className="h-3/4 w-3/4 object-contain opacity-50"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            )}
          </div>

          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent" />

          {/* Content */}
          <CardContent className="relative z-10 p-6 text-white">
            <CardTitle className="text-2xl font-bold mb-2 leading-tight drop-shadow-lg">
              {name}
            </CardTitle>
            <CardDescription className="text-sm opacity-95 leading-relaxed line-clamp-3 text-gray-200 drop-shadow-md">
              {description}
            </CardDescription>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto w-[calc(100vw-4rem)]"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text text-foreground flex items-center gap-3">
            {name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">About</h4>
            <p className="text-text-gray leading-relaxed">
              {detailedDescription}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
