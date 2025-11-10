import { useMemo } from "react";

import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFHECounter, UseFHECounterResult } from "@/hooks/useFHECounter";

export type UseFHEWorkflowResult = {
  chainId: number | undefined;
  isConnected: boolean;
  provider: ReturnType<typeof useMetaMaskEthersSigner>["provider"];
  ethersSigner: ReturnType<typeof useMetaMaskEthersSigner>["ethersSigner"];
  ethersReadonlyProvider: ReturnType<typeof useMetaMaskEthersSigner>["ethersReadonlyProvider"];
  sameChain: ReturnType<typeof useMetaMaskEthersSigner>["sameChain"];
  sameSigner: ReturnType<typeof useMetaMaskEthersSigner>["sameSigner"];
  connect: ReturnType<typeof useMetaMaskEthersSigner>["connect"];
  fhevmStatus: ReturnType<typeof useFhevm>["status"];
  fhevmError: ReturnType<typeof useFhevm>["error"];
  fheCounter: UseFHECounterResult;
  isConnectedWallet: boolean;
};

export function useFHEWorkflow(): UseFHEWorkflowResult {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const metamask = useMetaMaskEthersSigner();

  const fhevm = useFhevm({
    provider: metamask.provider,
    chainId: metamask.chainId,
    initialMockChains: metamask.initialMockChains,
    enabled: true,
  });

  const fheCounter = useFHECounter({
    instance: fhevm.instance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: metamask.provider,
    chainId: metamask.chainId,
    ethersSigner: metamask.ethersSigner,
    ethersReadonlyProvider: metamask.ethersReadonlyProvider,
    sameChain: metamask.sameChain,
    sameSigner: metamask.sameSigner,
  });

  return useMemo(
    () => ({
      chainId: metamask.chainId,
      provider: metamask.provider,
      ethersSigner: metamask.ethersSigner,
      ethersReadonlyProvider: metamask.ethersReadonlyProvider,
      sameChain: metamask.sameChain,
      sameSigner: metamask.sameSigner,
      connect: metamask.connect,
      fhevmStatus: fhevm.status,
      fhevmError: fhevm.error,
      fheCounter,
      isConnected: metamask.isConnected,
      isConnectedWallet: metamask.isConnected,
    }),
    [metamask.chainId, metamask.provider, metamask.ethersSigner, metamask.ethersReadonlyProvider, metamask.sameChain, metamask.sameSigner, metamask.connect, metamask.isConnected, fhevm.status, fhevm.error, fheCounter]
  );
}
