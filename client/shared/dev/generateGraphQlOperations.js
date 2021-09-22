// @ts-check

const path = require('path')

const { generate } = require('@graphql-codegen/cli')
const nearOperationFilePreset = require('@graphql-codegen/near-operation-file-preset')

const ROOT_FOLDER = path.resolve(__dirname, '../../../')

const WEB_FOLDER = path.resolve(ROOT_FOLDER, './client/web')
const BROWSER_FOLDER = path.resolve(ROOT_FOLDER, './client/browser')
const SHARED_FOLDER = path.resolve(ROOT_FOLDER, './client/shared')
const SCHEMA_PATH = path.join(ROOT_FOLDER, './cmd/frontend/graphqlbackend/*.graphql')

const SHARED_DOCUMENTS_GLOB = [
  `${SHARED_FOLDER}/src/**/*.{ts,tsx}`,
  `!${SHARED_FOLDER}/src/testing/**/*.*`,
  `!${SHARED_FOLDER}/src/graphql/schema.ts`,
]

const WEB_DOCUMENTS_GLOB = [
  `${WEB_FOLDER}/src/**/*.{ts,tsx}`,
  `!${WEB_FOLDER}/src/regression/**/*.*`,
  `!${WEB_FOLDER}/src/end-to-end/**/*.*`,
]

const BROWSER_DOCUMENTS_GLOB = [
  `${BROWSER_FOLDER}/src/**/*.{ts,tsx}`,
  `!${BROWSER_FOLDER}/src/end-to-end/**/*.*`,
  '!**/*.d.ts',
]

const GRAPHQL_DOCUMENTS_GLOB = ['./client/**/*.graphql']

// Define ALL_DOCUMENTS_GLOB as the union of the previous glob arrays.
const ALL_DOCUMENTS_GLOB = [...new Set([...SHARED_DOCUMENTS_GLOB, ...WEB_DOCUMENTS_GLOB, ...BROWSER_DOCUMENTS_GLOB])]

const SHARED_PLUGINS = [
  `${SHARED_FOLDER}/dev/extractGraphQlOperationCodegenPlugin.js`,
  'typescript',
  'typescript-operations',
]

const BASE_CONFIG = {
  schema: SCHEMA_PATH,
  hooks: {
    afterOneFileWrite: ['prettier --write'],
  },
  errorsOnly: true,
  config: {
    preResolveTypes: true,
    operationResultSuffix: 'Result',
    omitOperationSuffix: true,
    skipTypename: true,
    namingConvention: {
      typeNames: 'keep',
      enumValues: 'keep',
      transformUnderscore: true,
    },
    declarationKind: 'interface',
    avoidOptionals: {
      field: true,
      inputValue: false,
      object: true,
    },
    scalars: {
      DateTime: 'string',
      JSON: 'object',
      JSONValue: 'unknown',
      GitObjectID: 'string',
      JSONCString: 'string',
      PublishedValue: "boolean | 'draft'",
      BigInt: 'string',
    },
  },
}

/**
 * Generates TypeScript files with types for all GraphQL operations.
 */
async function generateGraphQlOperations() {
  await generate(
    {
      ...BASE_CONFIG,
      generates: {
        [path.join(BROWSER_FOLDER, './src/graphql-operations.ts')]: {
          documents: BROWSER_DOCUMENTS_GLOB,
          config: {
            onlyOperationTypes: true,
            noExport: false,
            enumValues: '@sourcegraph/shared/src/graphql-operations',
            interfaceNameForOperations: 'BrowserGraphQlOperations',
          },
          plugins: SHARED_PLUGINS,
        },

        [path.join(WEB_FOLDER, './src/graphql-operations.ts')]: {
          documents: WEB_DOCUMENTS_GLOB,
          config: {
            onlyOperationTypes: true,
            noExport: false,
            enumValues: '@sourcegraph/shared/src/graphql-operations',
            interfaceNameForOperations: 'WebGraphQlOperations',
          },
          plugins: SHARED_PLUGINS,
        },

        [path.join(SHARED_FOLDER, './src/graphql-operations.ts')]: {
          documents: SHARED_DOCUMENTS_GLOB,
          config: {
            onlyOperationTypes: true,
            noExport: false,
            interfaceNameForOperations: 'SharedGraphQlOperations',
          },
          plugins: SHARED_PLUGINS,
        },
      },
    },
    true
  )
}

/**
 * Generates TypeScript files with types for all GraphQL operations.
 */
async function generateGraphQlDocuments() {
  await generate(
    {
      ...BASE_CONFIG,
      generates: {
        TypedDocumentNodes: {
          documents: GRAPHQL_DOCUMENTS_GLOB,
          preset: 'near-operation-file',
          presetConfig: {
            extension: '.queries.ts',
            baseTypesPath: '~@sourcegraph/shared/src/graphql-operations',
          },
          plugins: ['typescript-operations', 'typed-document-node'],
        },
      },
    },
    true
  )
}

module.exports = {
  generateGraphQlOperations,
  generateGraphQlDocuments,
  SHARED_DOCUMENTS_GLOB,
  WEB_DOCUMENTS_GLOB,
  ALL_DOCUMENTS_GLOB,
  GRAPHQL_DOCUMENTS_GLOB,
}
