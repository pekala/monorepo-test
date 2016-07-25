#!/bin/bash
packages_dir=${1-.}
find $packages_dir/* -maxdepth 0 -type d -exec basename {} \; | grep -Ev '^(_)|node_modules'
