const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

interface ImportMetaEnv {
    readonly VITE_CONTRACT_ADDRESS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}