import { Suspense, HTMLAttributes, ReactElement, MouseEvent } from 'react'

import classNames from 'classnames'

import { ErrorAlert, ErrorMessage } from '@sourcegraph/branded/src/components/alerts'
import { SearchAggregationMode } from '@sourcegraph/shared/src/graphql-operations'
import { lazyComponent } from '@sourcegraph/shared/src/util/lazyComponent'
import { Text, Link, Tooltip } from '@sourcegraph/wildcard'

import { SearchAggregationDatum, GetSearchAggregationResult } from '../../../../graphql-operations'

import type { AggregationChartProps } from './AggregationChart'
import { DataLayoutContainer } from './DataContainer'
import { ErrorContainer } from './ErrorContainer'

import styles from './AggregationChartCard.module.scss'

const LazyAggregationChart = lazyComponent<AggregationChartProps<SearchAggregationDatum>, string>(
    () => import('./AggregationChart'),
    'AggregationChart'
)

const getName = (datum: SearchAggregationDatum): string => datum.label ?? ''
const getValue = (datum: SearchAggregationDatum): number => datum.count
const getColor = (datum: SearchAggregationDatum): string => (datum.label ? 'var(--primary)' : 'var(--text-muted)')
const getLink = (datum: SearchAggregationDatum): string => datum.query ?? ''

/**
 * Nested aggregation results types from {@link AGGREGATION_SEARCH_QUERY} GQL query
 */
type SearchAggregationResult = GetSearchAggregationResult['searchQueryAggregate']['aggregations']

function getAggregationError(aggregation?: SearchAggregationResult): Error | undefined {
    if (aggregation?.__typename === 'SearchAggregationNotAvailable') {
        return new Error(aggregation.reason)
    }

    return
}

export function getAggregationData(aggregations: SearchAggregationResult): SearchAggregationDatum[] {
    switch (aggregations?.__typename) {
        case 'ExhaustiveSearchAggregationResult':
        case 'NonExhaustiveSearchAggregationResult':
            return aggregations.groups

        default:
            return []
    }
}

export function getOtherGroupCount(aggregations: SearchAggregationResult): number {
    switch (aggregations?.__typename) {
        case 'ExhaustiveSearchAggregationResult':
            return aggregations.otherGroupCount ?? 0
        case 'NonExhaustiveSearchAggregationResult':
            return aggregations.approximateOtherGroupCount ?? 0

        default:
            return 0
    }
}

interface AggregationChartCardProps extends HTMLAttributes<HTMLDivElement> {
    data?: SearchAggregationResult
    error?: Error
    loading: boolean
    mode?: SearchAggregationMode | null
    size?: 'sm' | 'md'
    onBarLinkClick?: (query: string) => void
}

export function AggregationChartCard(props: AggregationChartCardProps): ReactElement | null {
    const { data, error, loading, mode, className, size = 'sm', 'aria-label': ariaLabel, onBarLinkClick } = props

    if (loading) {
        return (
            <DataLayoutContainer size={size} className={classNames(styles.loading, className)}>
                Loading...
            </DataLayoutContainer>
        )
    }

    // Internal error
    if (error) {
        return (
            <DataLayoutContainer size={size} className={className}>
                <ErrorAlert error={error} className={styles.errorAlert} />
            </DataLayoutContainer>
        )
    }

    const aggregationError = getAggregationError(data)

    if (aggregationError) {
        return (
            <ErrorContainer size={size} className={className}>
                We couldn’t provide an aggregation for this query. <ErrorMessage error={aggregationError} />{' '}
                <Link to="">Learn more</Link>
            </ErrorContainer>
        )
    }

    if (!data) {
        return null
    }

    if (getAggregationData(data).length === 0) {
        return (
            <ErrorContainer size={size} className={className}>
                No data to display
            </ErrorContainer>
        )
    }

    const missingCount = getOtherGroupCount(data)
    const handleDatumLinkClick = (event: MouseEvent, datum: SearchAggregationDatum): void => {
        event.preventDefault()
        onBarLinkClick?.(getLink(datum))
    }

    return (
        <Suspense>
            <LazyAggregationChart
                aria-label={ariaLabel}
                data={getAggregationData(data)}
                mode={mode}
                getDatumValue={getValue}
                getDatumColor={getColor}
                getDatumName={getName}
                getDatumLink={getLink}
                onDatumLinkClick={handleDatumLinkClick}
                className={classNames(className, styles.container)}
            />

            {!!missingCount && (
                <Tooltip content={`Aggregation is not exhaustive, there are ${missingCount} groups more`}>
                    <Text size="small" className={styles.missingLabelCount}>
                        +{missingCount}
                    </Text>
                </Tooltip>
            )}
        </Suspense>
    )
}
