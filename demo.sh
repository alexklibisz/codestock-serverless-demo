#!/bin/bash

rm -rf demo/*
rm -rf sls-albums-demo
cp -r sls-albums sls-albums-demo
rm -rf sls-albums-demo/album
rm -rf sls-albums-demo/image
rm -rf sls-albums-demo/album-builder
cd sls-albums-demo && npm install
