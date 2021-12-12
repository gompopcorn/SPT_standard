#!/bin/bash

##########################################################
#                    Input Variables
##########################################################

username=$1
orgName=$2
orgNumber=$3
userPass="${username}pw"
caName="ca-${orgName}"
caPort="7054"   # peer0 of Org1

if [ $orgNumber == 2 ]
then
    caPort="8054"    # peer0 of Org2
fi


##########################################################
#                         Paths
##########################################################

fabric_samples_dir="/usr/local/go/src/github.com/hyperledger/fabric-samples"
test_network_dir="/usr/local/go/src/github.com/hyperledger/fabric-samples/test-network"

cd $test_network_dir

userMSPfolder="${PWD}/organizations/peerOrganizations/$orgName.example.com/users/$username@$orgName.example.com/msp"
orgConfigFile="${PWD}/organizations/peerOrganizations/$orgName.example.com/msp/config.yaml"
orgCertFile="${PWD}/organizations/fabric-ca/$orgName/tls-cert.pem"

# export fabric paths
export PATH=$fabric_samples_dir/bin:${PWD}:$PATH
export FABRIC_CFG_PATH=$fabric_samples_dir/config/
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/$orgName.example.com/


##########################################################
#                   Register & Enroll
##########################################################

# register the user
fabric-ca-client register --caname $caName --id.name $username --id.secret $userPass --id.type client \
--tls.certfiles "$orgCertFile"

# enroll the user
fabric-ca-client enroll -u https://$username:$userPass@localhost:$caPort --caname $caName \
-M "$userMSPfolder" --tls.certfiles "$orgCertFile"

# copy the Node OU configuration file into the user MSP folder
cp "$orgConfigFile" "$userMSPfolder/config.yaml"
