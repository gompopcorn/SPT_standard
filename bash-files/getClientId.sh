#!/bin/bash

##########################################################
#                    Input Variables
##########################################################

username=$1
orgNumber=$2
orgName="org$orgNumber"
orgMSP="Org${orgNumber}MSP"
channelName="mychannel"         # only needed for the query. NOT affects the result
chaincodeName="token_utxo"      # only needed for the query. NOT affects the result
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
#               Get Client-ID of the User
##########################################################

peer chaincode query -C $channelName -n $chaincodeName -c '{"function":"ClientID","Args":[]}'
