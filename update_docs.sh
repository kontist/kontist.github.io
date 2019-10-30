#!/bin/bash
set -ex

AUTH_HEADER=$1
# TODO: Replace with "graphql-markdown" when https://github.com/exogen/graphql-markdown/pull/48 gets merged
GRAPHQL_MARKDOWN_LIB=github:p-janik/graphql-markdown#ab079ebddae13a7cc5625b2f2f2b4e354fbbda1f

npx ${GRAPHQL_MARKDOWN_LIB} https://api.kontist.com/api/graphql --header "Authorization=${AUTH_HEADER}" --update-file ./docs.markdown --no-toc --no-title
