#!/bin/sh

set -e

egrep -Rho "\b_\.\w+" src | sort | uniq
