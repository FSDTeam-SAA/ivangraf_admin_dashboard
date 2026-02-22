import { Heart, Database } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { databases } from "@/data/dashboard";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Databases"
        description="Select a Database to Continue"
      />
      <div className="grid gap-6 md:grid-cols-2">
        {databases.map((database, index) => (
          <Card
            key={database.id}
            className={
              index === 2
                ? "md:col-span-2 bg-[#fff6ea]"
                : "bg-[#fff6ea]"
            }
          >
            <CardContent className="relative flex flex-col items-center gap-4 p-8">
              <Heart
                className={
                  database.favorite
                    ? "absolute right-6 top-6 h-5 w-5 fill-[#f4a021] text-[#f4a021]"
                    : "absolute right-6 top-6 h-5 w-5 text-[#f4a021]"
                }
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1dfbb]">
                <Database className="h-6 w-6 text-[#c98c1f]" />
              </div>
              <div className="text-lg font-semibold text-[#2f2a21]">{database.name}</div>
              <Button variant="gold" size="lg" className="w-full max-w-xs">
                View List
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}