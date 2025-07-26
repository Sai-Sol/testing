"use client";

import Link from "next/link";
import { LogOut, UserCircle, Bot, Home, PlusSquare, History, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import WalletConnectButton from "./wallet-connect-button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/hooks/use-wallet";
import { AiChat } from "./ai-chat";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  const { user, logout } = useAuth();
  const { disconnectWallet } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    disconnectWallet();
    router.push("/login");
  };

  const navItems = [
      { href: "/dashboard", label: "Home", icon: Home },
      { href: "/dashboard/create", label: "Create Job", icon: PlusSquare },
      { href: "/dashboard/history", label: "Job History", icon: History },
      { href: "/dashboard/contract", label: "Contract Info", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
       <div className="flex items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary p-2 rounded-lg">
            <Bot className="h-6 w-6" />
            </div>
            <span className="font-headline text-lg font-semibold tracking-tight">
            QuantumChain
            </span>
        </Link>
       </div>
        <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                    <Button variant={pathname === item.href ? "secondary" : "ghost"}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                    </Button>
                </Link>
            ))}
        </nav>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <AiChat />
        <WalletConnectButton />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name} ({user.role === 'admin' ? 'Admin' : 'User'})
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
