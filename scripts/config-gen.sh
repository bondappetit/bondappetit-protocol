#!/usr/bin/env bash

NETWORK="development"
POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -n|--network)
    NETWORK="$2"
    shift
    shift
    ;;
    *)
    POSITIONAL+=("$1")
    shift
    ;;
esac
done
set -- "${POSITIONAL[@]}"

node gen.js --network ${NETWORK} --config gen.config.json --out networks/${NETWORK}/gen --abi networks/abi