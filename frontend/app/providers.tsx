"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { hardhat, sepolia } from "wagmi/chains";

import { MetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";
import { MetaMaskEthersSignerProvider } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { OperationLogProvider } from "@/hooks/useOperationLog";

type Props = {
  children: ReactNode;
};

const queryClient = new QueryClient();

const defaultLocalRpc = process.env.NEXT_PUBLIC_LOCAL_RPC_URL ?? "http://127.0.0.1:8545";
const defaultSepoliaRpc =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "https://sepolia.infura.io/v3/8f7d90378a814251afabcf6425269276";

const chains = [hardhat, sepolia] as const;

export function Providers({ children }: Props) {
  const wagmiConfig = useMemo(() => {
    const transports = {
      [hardhat.id]: http(defaultLocalRpc),
      [sepolia.id]: http(defaultSepoliaRpc),
    } as const;

    return createConfig({
      chains,
      connectors: [injected()],
      transports,
      ssr: true,
    });
  }, []);

  const initialMockChains = useMemo(() => ({ 31337: defaultLocalRpc }), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <MetaMaskProvider>
            <MetaMaskEthersSignerProvider initialMockChains={initialMockChains}>
              <OperationLogProvider>
                <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
              </OperationLogProvider>
            </MetaMaskEthersSignerProvider>
          </MetaMaskProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
