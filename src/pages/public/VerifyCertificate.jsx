import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, CheckCircle, XCircle, FileText, Calendar, User, Building, Award, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { publicService } from '@/services/api'
import { useWeb3 } from '@/contexts/Web3Context'
import { formatDate, formatAddress } from '@/lib/utils'
import { IPFS_GATEWAY } from '@/utils/constants'

export default function VerifyCertificate() {
  const [certId, setCertId] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [certificate, setCertificate] = useState(null)
  const [verificationResult, setVerificationResult] = useState(null)
  const { toast } = useToast()
  const { contract } = useWeb3()

  const handleVerify = async () => {
    if (!certId.trim()) {
      toast({
        title: "Certificate ID required",
        description: "Please enter a certificate ID",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)
    setCertificate(null)

    try {
      // Try blockchain verification first if contract is connected
      if (contract) {
        try {
          const result = await contract.verifyCertificate(certId)
          const [
            isValid,
            issuer,
            studentName,
            rollNo,
            course,
            year,
            ipfsHash,
            timestamp,
            isRevoked
          ] = result

          if (isValid && !isRevoked) {
            setCertificate({
              id: certId,
              studentName,
              rollNo,
              course,
              year,
              issuer,
              ipfsHash,
              timestamp: timestamp.toString(),
              isRevoked
            })
            setVerificationResult('valid')
          } else if (isRevoked) {
            setVerificationResult('revoked')
          } else {
            setVerificationResult('invalid')
          }
        } catch (error) {
          console.error('Blockchain verification error:', error)
          // Fall back to API
          await verifyViaAPI()
        }
      } else {
        // Use API if no contract connection
        await verifyViaAPI()
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast({
        title: "Verification failed",
        description: error.message || "Unable to verify certificate",
        variant: "destructive"
      })
      setVerificationResult('error')
    } finally {
      setIsVerifying(false)
    }
  }

  const verifyViaAPI = async () => {
    const response = await publicService.verifyCertificate(certId)
    if (response.data.valid) {
      setCertificate(response.data.certificate)
      setVerificationResult('valid')
    } else {
      setVerificationResult('invalid')
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg opacity-20" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Verify <span className="gradient-text">Certificate</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Enter the certificate ID to verify its authenticity on the blockchain
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Enter Certificate ID (e.g., CERT-2024-001)"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                  className="flex-1 h-12"
                />
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  variant="gradient"
                  size="lg"
                  className="gap-2 sm:w-auto w-full"
                >
                  <Search className="w-5 h-5" />
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification Result */}
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            {verificationResult === 'valid' && certificate && (
              <Card className="border-2 border-green-500/30 bg-green-500/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-green-500">Certificate Verified</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        This certificate is authentic and valid
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        Student Name
                      </div>
                      <p className="text-lg font-semibold">{certificate.studentName}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        Roll Number
                      </div>
                      <p className="text-lg font-semibold">{certificate.rollNo}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="w-4 h-4" />
                        Course
                      </div>
                      <p className="text-lg font-semibold">{certificate.course}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Year
                      </div>
                      <p className="text-lg font-semibold">{certificate.year}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="w-4 h-4" />
                        Issued By
                      </div>
                      <p className="text-sm font-mono">{formatAddress(certificate.issuer)}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        Issue Date
                      </div>
                      <p className="text-lg font-semibold">{formatDate(certificate.timestamp)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={`${IPFS_GATEWAY}${certificate.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full gap-2">
                          <FileText className="w-4 h-4" />
                          View Certificate PDF
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                      <Badge variant="success" className="px-4 py-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verified on Blockchain
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {verificationResult === 'invalid' && (
              <Card className="border-2 border-red-500/30 bg-red-500/5">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-500 mb-2">Certificate Not Found</h3>
                  <p className="text-muted-foreground">
                    This certificate ID does not exist in our blockchain records
                  </p>
                </CardContent>
              </Card>
            )}

            {verificationResult === 'revoked' && (
              <Card className="border-2 border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-500 mb-2">Certificate Revoked</h3>
                  <p className="text-muted-foreground">
                    This certificate has been revoked by the issuer
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Sample IDs for Testing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 rounded-lg glass border border-white/10"
        >
          <h3 className="text-sm font-semibold mb-3">Sample Certificate IDs for Testing:</h3>
          <div className="flex flex-wrap gap-2">
            {['CERT-2024-001', 'CERT-2024-002', 'CERT-2024-003'].map((id) => (
              <button
                key={id}
                onClick={() => setCertId(id)}
                className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-sm font-mono transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
