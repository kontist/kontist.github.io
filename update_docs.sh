#!/bin/bash
set -ex

AUTH_HEADER=$1

npx graphql-markdown https://api.kontist.com/api/graphql --header "Authorization=${AUTH_HEADER}" --update-file ./docs.markdown
