export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'

export const SUPPORTED_CHAIN_ID = import.meta.env.VITE_CHAIN_ID || 11155111

export const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

export const USER_ROLES = {
  ADMIN: 'admin',
  ISSUER: 'issuer',
  STUDENT: 'student',
  EMPLOYER: 'employer'
}
