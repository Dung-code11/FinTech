"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/fintech/context/AuthContext";
import { WalletProvider } from "@/fintech/context/WalletContext";
import { CategoryProvider } from "@/fintech/context/CategoryContext";
import { TransactionProvider } from "@/fintech/context/TransactionContext";
import { DebtProvider } from "@/fintech/context/DebtContext";
import { SavingsProvider } from "@/fintech/context/SavingsContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <WalletProvider>
        <CategoryProvider>
          <TransactionProvider>
            <DebtProvider>
              <SavingsProvider>{children}</SavingsProvider>
            </DebtProvider>
          </TransactionProvider>
        </CategoryProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

