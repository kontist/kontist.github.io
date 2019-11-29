#!/bin/bash
set -e

AUTH_HEADER=$1

npx graphql-markdown https://api.kontist.com/api/graphql --header "Authorization=Bearer ${AUTH_HEADER}" --update-file ./docs.markdown --no-toc --no-title
