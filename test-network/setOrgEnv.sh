#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0




# default to using OrgClient
ORG=${1:-OrgClient}

# Exit on first error, print all commands.
set -e
set -o pipefail

# Where am I?
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

ORDERER_CA=${DIR}/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
PEER0_ORG1_CA=${DIR}/test-network/organizations/peerOrganizations/orgClient.example.com/tlsca/tlsca.orgClient.example.com-cert.pem
PEER0_ORG2_CA=${DIR}/test-network/organizations/peerOrganizations/orgPlatform.example.com/tlsca/tlsca.orgPlatform.example.com-cert.pem
PEER0_ORG3_CA=${DIR}/test-network/organizations/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem


if [[ ${ORG,,} == "orgClient" || ${ORG,,} == "digibank" ]]; then

   CORE_PEER_LOCALMSPID=OrgClientMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/orgClient.example.com/users/Admin@orgClient.example.com/msp
   CORE_PEER_ADDRESS=localhost:7051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/test-network/organizations/peerOrganizations/orgClient.example.com/tlsca/tlsca.orgClient.example.com-cert.pem

elif [[ ${ORG,,} == "orgPlatform" || ${ORG,,} == "magnetocorp" ]]; then

   CORE_PEER_LOCALMSPID=OrgPlatformMSP
   CORE_PEER_MSPCONFIGPATH=${DIR}/test-network/organizations/peerOrganizations/orgPlatform.example.com/users/Admin@orgPlatform.example.com/msp
   CORE_PEER_ADDRESS=localhost:9051
   CORE_PEER_TLS_ROOTCERT_FILE=${DIR}/test-network/organizations/peerOrganizations/orgPlatform.example.com/tlsca/tlsca.orgPlatform.example.com-cert.pem

else
   echo "Unknown \"$ORG\", please choose OrgClient/Digibank or OrgPlatform/Magnetocorp"
   echo "For example to get the environment variables to set upa OrgPlatform shell environment run:  ./setOrgEnv.sh OrgPlatform"
   echo
   echo "This can be automated to set them as well with:"
   echo
   echo 'export $(./setOrgEnv.sh OrgPlatform | xargs)'
   exit 1
fi

# output the variables that need to be set
echo "CORE_PEER_TLS_ENABLED=true"
echo "ORDERER_CA=${ORDERER_CA}"
echo "PEER0_ORG1_CA=${PEER0_ORG1_CA}"
echo "PEER0_ORG2_CA=${PEER0_ORG2_CA}"
echo "PEER0_ORG3_CA=${PEER0_ORG3_CA}"

echo "CORE_PEER_MSPCONFIGPATH=${CORE_PEER_MSPCONFIGPATH}"
echo "CORE_PEER_ADDRESS=${CORE_PEER_ADDRESS}"
echo "CORE_PEER_TLS_ROOTCERT_FILE=${CORE_PEER_TLS_ROOTCERT_FILE}"

echo "CORE_PEER_LOCALMSPID=${CORE_PEER_LOCALMSPID}"
