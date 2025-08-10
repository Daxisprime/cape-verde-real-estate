"use client";

import { useState, useEffect, useMemo } from "react";

// TypeScript declarations for Web3/Ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
    };
  }
}
import { Shield, Link, FileText, CheckCircle, AlertTriangle, Clock, Zap, Key, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface BlockchainProperty {
  id: string;
  tokenId: string;
  contractAddress: string;
  blockchain: 'ethereum' | 'polygon' | 'binance' | 'cardano';
  status: 'verified' | 'pending' | 'unverified';
  owner: {
    address: string;
    verified: boolean;
    name?: string;
  };
  transactionHistory: BlockchainTransaction[];
  smartContracts: SmartContract[];
  nftMetadata?: {
    name: string;
    description: string;
    imageUrl: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

interface BlockchainTransaction {
  id: string;
  hash: string;
  type: 'transfer' | 'sale' | 'verification' | 'contract';
  from: string;
  to: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  blockNumber: number;
  gasUsed: number;
  gasPrice: number;
  status: 'confirmed' | 'pending' | 'failed';
}

interface SmartContract {
  id: string;
  type: 'ownership' | 'rental' | 'escrow' | 'insurance';
  address: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  terms: {
    duration?: number;
    amount: number;
    currency: string;
    conditions: string[];
  };
  parties: Array<{
    role: string;
    address: string;
    name?: string;
  }>;
  createdAt: string;
  expiresAt?: string;
}

interface VerificationDocument {
  id: string;
  type: 'deed' | 'survey' | 'inspection' | 'appraisal';
  hash: string;
  ipfsHash: string;
  verified: boolean;
  verifiedBy?: string;
  timestamp: string;
}

interface BlockchainIntegrationProps {
  propertyId: string;
  propertyTitle: string;
}

export default function BlockchainIntegration({ propertyId, propertyTitle }: BlockchainIntegrationProps) {
  const [blockchainProperty, setBlockchainProperty] = useState<BlockchainProperty | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // Sample blockchain data
  const sampleBlockchainProperty: BlockchainProperty = useMemo(() => ({
    id: propertyId,
    tokenId: "PROCV-001",
    contractAddress: "0x742d35cc6635c0532925a3b8d0b93d3c89b1b69e",
    blockchain: "polygon",
    status: "verified",
    owner: {
      address: "0x742d35cc6635c0532925a3b8d0b93d3c89b1b69e",
      verified: true,
      name: "João Silva"
    },
    transactionHistory: [
      {
        id: "tx1",
        hash: "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b",
        type: "verification",
        from: "0x0000000000000000000000000000000000000000",
        to: "0x742d35cc6635c0532925a3b8d0b93d3c89b1b69e",
        timestamp: "2024-12-28T10:30:00Z",
        blockNumber: 55123456,
        gasUsed: 21000,
        gasPrice: 20,
        status: "confirmed"
      },
      {
        id: "tx2",
        hash: "0x8fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8c",
        type: "transfer",
        from: "0x641d35cc6635c0532925a3b8d0b93d3c89b1b123",
        to: "0x742d35cc6635c0532925a3b8d0b93d3c89b1b69e",
        amount: 450000,
        currency: "EUR",
        timestamp: "2024-11-15T14:20:00Z",
        blockNumber: 55023456,
        gasUsed: 45000,
        gasPrice: 25,
        status: "confirmed"
      }
    ],
    smartContracts: [
      {
        id: "contract1",
        type: "ownership",
        address: "0x742d35cc6635c0532925a3b8d0b93d3c89b1b69e",
        status: "active",
        terms: {
          amount: 450000,
          currency: "EUR",
          conditions: [
            "Property ownership transfer upon payment completion",
            "Automated escrow release upon document verification",
            "Insurance coverage included for 12 months"
          ]
        },
        parties: [
          { role: "buyer", address: "0x742d35cc6635c0532925a3b8d0b93d3c89b1b69e", name: "João Silva" },
          { role: "seller", address: "0x641d35cc6635c0532925a3b8d0b93d3c89b1b123", name: "Maria Santos" },
          { role: "agent", address: "0x841d35cc6635c0532925a3b8d0b93d3c89b1b456", name: "ProCV Escrow" }
        ],
        createdAt: "2024-11-01T10:00:00Z"
      }
    ],
    nftMetadata: {
      name: `ProCV Property #001 - ${propertyTitle}`,
      description: "Verified Cape Verde property ownership NFT with complete documentation and legal verification on blockchain",
      imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      attributes: [
        { trait_type: "Location", value: "Santa Maria, Sal" },
        { trait_type: "Property Type", value: "Villa" },
        { trait_type: "Bedrooms", value: "4" },
        { trait_type: "Area", value: "280 m²" },
        { trait_type: "Year Built", value: "2020" },
        { trait_type: "Verification Status", value: "Verified" }
      ]
    }
  }), [propertyId, propertyTitle]);

  const verificationDocuments: VerificationDocument[] = [
    {
      id: "doc1",
      type: "deed",
      hash: "0x1234567890abcdef",
      ipfsHash: "QmX1234567890abcdef",
      verified: true,
      verifiedBy: "Cape Verde Land Registry",
      timestamp: "2024-12-20T10:00:00Z"
    },
    {
      id: "doc2",
      type: "survey",
      hash: "0x2345678901bcdefg",
      ipfsHash: "QmX2345678901bcdefg",
      verified: true,
      verifiedBy: "Licensed Surveyor",
      timestamp: "2024-12-22T14:30:00Z"
    },
    {
      id: "doc3",
      type: "inspection",
      hash: "0x3456789012cdefgh",
      ipfsHash: "QmX3456789012cdefgh",
      verified: true,
      verifiedBy: "Certified Inspector",
      timestamp: "2024-12-25T09:15:00Z"
    }
  ];

  useEffect(() => {
    // Load blockchain property data
    setBlockchainProperty(sampleBlockchainProperty);

    // Check wallet connection
    checkWalletConnection();
  }, [sampleBlockchainProperty]);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.log('Wallet not connected');
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        }) as string[];
        setWalletConnected(true);
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('Failed to connect wallet');
      }
    } else {
      alert('MetaMask wallet not found. Please install MetaMask to use blockchain features.');
    }
  };

  const verifyProperty = async () => {
    setIsVerifying(true);
    setVerificationProgress(0);

    const steps = [
      "Connecting to blockchain network...",
      "Verifying property documents...",
      "Checking ownership records...",
      "Validating legal documentation...",
      "Creating blockchain certificate...",
      "Minting property NFT...",
      "Recording verification on-chain..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setVerificationProgress(((i + 1) / steps.length) * 100);
    }

    setIsVerifying(false);

    // Update property status
    if (blockchainProperty) {
      setBlockchainProperty({
        ...blockchainProperty,
        status: 'verified'
      });
    }
  };

  const getBlockchainExplorerUrl = (hash: string) => {
    const explorers = {
      ethereum: 'https://etherscan.io',
      polygon: 'https://polygonscan.com',
      binance: 'https://bscscan.com',
      cardano: 'https://cardanoscan.io'
    };

    return `${explorers[blockchainProperty?.blockchain || 'polygon']}/tx/${hash}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'confirmed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'unverified':
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!blockchainProperty) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Blockchain Verification</h3>
          <p className="text-gray-600 mb-4">This property is not yet verified on the blockchain.</p>
          <Button onClick={verifyProperty} className="bg-purple-600 hover:bg-purple-700">
            Start Blockchain Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Blockchain Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 mr-2 text-purple-600" />
                Blockchain Verification
                <Badge className={`ml-2 ${getStatusColor(blockchainProperty.status)}`}>
                  {blockchainProperty.status.charAt(0).toUpperCase() + blockchainProperty.status.slice(1)}
                </Badge>
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Property ownership and documentation verified on {blockchainProperty.blockchain} blockchain
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Token ID</div>
              <div className="font-mono text-sm">{blockchainProperty.tokenId}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {blockchainProperty.transactionHistory.length}
              </div>
              <div className="text-sm text-gray-600">Blockchain Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {blockchainProperty.smartContracts.length}
              </div>
              <div className="text-sm text-gray-600">Active Smart Contracts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {verificationDocuments.filter(d => d.verified).length}
              </div>
              <div className="text-sm text-gray-600">Verified Documents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Connection */}
      {!walletConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Connect Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-800 mb-3">
                Connect your Web3 wallet to interact with blockchain features and view your property ownership.
              </p>
              <Button onClick={connectWallet} className="bg-amber-600 hover:bg-amber-700">
                <Key className="h-4 w-4 mr-2" />
                Connect MetaMask Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property NFT */}
      {blockchainProperty.nftMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Property NFT Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={blockchainProperty.nftMetadata.imageUrl}
                  alt={blockchainProperty.nftMetadata.name}
                  className="w-full rounded-lg border"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{blockchainProperty.nftMetadata.name}</h3>
                  <p className="text-gray-600 text-sm">{blockchainProperty.nftMetadata.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Property Attributes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {blockchainProperty.nftMetadata.attributes.map((attr, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                        <div className="text-gray-500">{attr.trait_type}</div>
                        <div className="font-medium">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-gray-500 mb-1">Contract Address</div>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {formatAddress(blockchainProperty.contractAddress)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Information Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="ownership">Ownership</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Transaction History</h3>
                {blockchainProperty.transactionHistory.map((tx) => (
                  <div key={tx.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          tx.status === 'confirmed' ? 'bg-green-500' :
                          tx.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium capitalize">{tx.type}</span>
                        <Badge className={`ml-2 ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">From:</span>
                        <span className="ml-2 font-mono">{formatAddress(tx.from)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">To:</span>
                        <span className="ml-2 font-mono">{formatAddress(tx.to)}</span>
                      </div>
                      {tx.amount && (
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <span className="ml-2 font-semibold">€{tx.amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Block:</span>
                        <span className="ml-2">{tx.blockNumber}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getBlockchainExplorerUrl(tx.hash), '_blank')}
                      >
                        <Link className="h-3 w-3 mr-1" />
                        View on Explorer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contracts" className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Smart Contracts</h3>
                {blockchainProperty.smartContracts.map((contract) => (
                  <div key={contract.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="font-medium capitalize">{contract.type} Contract</span>
                        <Badge className={`ml-2 ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedContract(contract);
                          setIsContractModalOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="ml-2 font-semibold">€{contract.terms.amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Parties:</span>
                        <span className="ml-2">{contract.parties.length} participants</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-xs text-gray-500">Contract Address</div>
                      <div className="font-mono text-sm">{formatAddress(contract.address)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Verified Documents</h3>
                {verificationDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium capitalize">{doc.type}</span>
                        {doc.verified && (
                          <Badge className="ml-2 bg-green-100 text-green-800">Verified</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(doc.timestamp).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-gray-500">Verified by:</span>
                        <span className="ml-2">{doc.verifiedBy}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Document Hash:</span>
                        <span className="ml-2 font-mono text-xs">{doc.hash}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">IPFS Hash:</span>
                        <span className="ml-2 font-mono text-xs">{doc.ipfsHash}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ownership" className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Ownership Information</h3>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{blockchainProperty.owner.name || 'Anonymous Owner'}</div>
                      <div className="text-sm text-gray-600 font-mono">
                        {formatAddress(blockchainProperty.owner.address)}
                      </div>
                      {blockchainProperty.owner.verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                          Verified Owner
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ownership Status:</span>
                      <span className="font-medium">Verified on Blockchain</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Registration Date:</span>
                      <span>{new Date(blockchainProperty.transactionHistory[0]?.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Blockchain Network:</span>
                      <Badge variant="outline" className="capitalize">
                        {blockchainProperty.blockchain}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Verification Progress Modal */}
      {isVerifying && (
        <Dialog open={isVerifying} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Blockchain Verification in Progress</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <Zap className="h-12 w-12 mx-auto text-purple-600 animate-pulse mb-4" />
                <div className="text-lg font-semibold mb-2">
                  {Math.round(verificationProgress)}% Complete
                </div>
                <Progress value={verificationProgress} className="w-full" />
              </div>
              <div className="text-sm text-gray-600 text-center">
                Verifying property documents and recording on blockchain...
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Smart Contract Details Modal */}
      <Dialog open={isContractModalOpen} onOpenChange={setIsContractModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Smart Contract Details</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Contract Type</Label>
                  <div className="capitalize">{selectedContract.type}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedContract.status)}>
                    {selectedContract.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Contract Terms</Label>
                <div className="bg-gray-50 p-3 rounded mt-1">
                  <div className="flex justify-between mb-2">
                    <span>Amount:</span>
                    <span className="font-semibold">€{selectedContract.terms.amount.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    {selectedContract.terms.conditions.map((condition, index) => (
                      <div key={index} className="text-sm flex items-start">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        {condition}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Contract Parties</Label>
                <div className="space-y-2 mt-1">
                  {selectedContract.parties.map((party, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium capitalize">{party.role}</div>
                        <div className="text-sm text-gray-600">{party.name || 'Anonymous'}</div>
                      </div>
                      <div className="font-mono text-xs">
                        {formatAddress(party.address)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => window.open(getBlockchainExplorerUrl(selectedContract.address), '_blank')}
                  className="w-full"
                >
                  <Link className="h-4 w-4 mr-2" />
                  View Contract on Blockchain
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
