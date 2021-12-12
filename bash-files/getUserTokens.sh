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
# export FABRIC_CA_CLIENT_TLS_CERTFILES=$FABRIC_CA_CLIENT_HOME/ca/ca.$orgName.example.com-cert.pem

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="$orgMSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/${orgName}.example.com/users/${username}@${orgName}.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/${orgName}.example.com/peers/peer0.${orgName}.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:$peerPort


##########################################################
#               get the list of user tokens
##########################################################

peer chaincode query -C $channelName -n $chaincodeName -c '{"function":"ClientUTXOs","Args":[]}'
