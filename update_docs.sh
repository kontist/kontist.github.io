#!/bin/bash
set -e

AUTH_HEADER=$1

npx graphql-markdown@5.2.0 https://api.kontist.com/api/graphql --header "Authorization=Bearer ${AUTH_HEADER}" --update-file ./docs.markdown --no-toc --no-title --heading-level 2
