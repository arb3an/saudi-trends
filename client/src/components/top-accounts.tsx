import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Users, Heart, MapPin } from "lucide-react";
import type { Account } from "@shared/schema";

interface TopAccountsProps {
  accounts: Account[];
  trendHashtag?: string;
}

export function TopAccounts({ accounts, trendHashtag }: TopAccountsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Users className="h-5 w-5 text-primary" />
        <CardTitle className="text-xl font-semibold">
          أبرز الحسابات{trendHashtag ? ` في ${trendHashtag}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد حسابات لعرضها
              </div>
            ) : (
              accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-3 p-3 rounded-md hover-elevate"
                  data-testid={`account-${account.id}`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={account.avatar} alt={account.displayName} />
                    <AvatarFallback>
                      {account.displayName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="font-semibold text-sm truncate">
                        {account.displayName}
                      </h4>
                      {account.verified && (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                      {account.isBot && (
                        <Badge variant="secondary" className="text-xs">
                          بوت
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate" dir="ltr">
                      @{account.username}
                    </p>
                    {account.city && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{account.city}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span className="font-mono" dir="ltr">
                        {account.followers.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
