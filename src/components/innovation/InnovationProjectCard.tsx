"use client";

// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { Calendar, ExternalLink, MapPin, Users, X } from "lucide-react";
import { useState } from "react";

interface ProjectCardProps {
  name: string;
  description: string;
  image: string;
  detailedDescription: string;
  members: number;
  established: string;
  location: string;
  projects: string[];
  contact: string;
  website?: string;
}

export function ProjectCard({
  name,
  description,
  image,
  detailedDescription,
  // members,
  // established,
  // location,
  // projects,
  // contact,
  // website,
}: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer max-w-sm overflow-hidden relative h-[360px] w-[320px] md:w-[360px] flex flex-col justify-end p-0 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Background Image or Placeholder */}
          <div className="absolute inset-0">
            {image ? (
              <img
                src={image}
                alt={`${name} Project`}
                className="h-full w-full object-cover"
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
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            {name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Detailed Description */}
          <div>
            <h4 className="text-lg font-semibold mb-2">About</h4>
            <p className="text-muted-foreground leading-relaxed">
              {detailedDescription}
            </p>
          </div>

          {/* Department Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="font-semibold">{members}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Established</p>
                <p className="font-semibold">{established}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{location}</p>
              </div>
            </div>
          </div> */}

          {/* Current Projects */}
          {/* <div>
            <h4 className="text-lg font-semibold mb-3">Current Projects</h4>
            <div className="flex flex-wrap gap-2">
              {projects.map((project, index) => (
                <Badge key={index} variant="secondary">
                  {project}
                </Badge>
              ))}
            </div>
          </div> */}

          {/* Contact Information */}
          {/* <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h4 className="font-semibold mb-1">Contact</h4>
                <p className="text-muted-foreground">{contact}</p>
              </div>

              {website && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  asChild
                >
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
