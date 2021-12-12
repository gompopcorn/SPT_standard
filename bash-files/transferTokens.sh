#!/bin/bash

##########################################################
#                    Input Variables
##########################################################

username=$1
orgName=$2
orgNumber=$3
orgMSP="Org${orgNumber}MSP"
channelName=$4
chaincodeName=$5
utxo_keys=$6
participantsList=$7  # array of participants
ordererPort="7050"
peerPort="7051"   # peer0 of Org1

if [ $orgNumber == 2 ]
then
    peerPort="9051"    # peer0 of Org2
fi


##########################################################
#                         Paths
##########################################################

fabric_samples_dir="/usr/local/go/src/github.com/hyperledger/fabric-samples"
test_network_dir="/usr/local/go/src/github.com/hyperledger/fabric-samples/test-network"

cd $test_network_dir

# export fabric paths
export PATH=$fabric_samples_dir/bin:${PWD}:$PATH
export FABRIC_CFG_PATH=$fabric_samples_dir/config/
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/$orgName.example.com/

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="$orgMSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/${orgName}.example.com/users/${username}@${orgName}.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/${orgName}.example.com/peers/peer0.${orgName}.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:$peerPort
export TARGET_TLS_OPTIONS=(-o localhost:$ordererPort --ordererTLSHostnameOverride orderer.example.com --tls \
--cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
--peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
--peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt")


##########################################################
#                   Transfer Tokens
##########################################################

peer chaincode invoke "${TARGET_TLS_OPTIONS[@]}" -C $channelName -n $chaincodeName -c \
'{"function":"Transfer","Args":["['$utxo_keys']","'$participantsList'"]}'
