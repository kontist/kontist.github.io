#!/bin/bash
set -ex

AUTH_HEADER=$1
# TODO: Replace with "graphql-markdown" when https://github.com/exogen/graphql-markdown/pull/48 gets merged
GRAPHQL_MARKDOWN_LIB=github:p-janik/graphql-markdown#607f0f9aae492113456b3612e2207dad8c42fe32

npx ${GRAPHQL_MARKDOWN_LIB} https://api.kontist.com/api/graphql --header "Authorization=${AUTH_HEADER}" --update-file ./docs.markdown --no-toc --no-title
