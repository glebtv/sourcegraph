import { Suspense, HTMLAttributes, ReactElement, MouseEvent, FC, SVGProps, forwardRef } from 'react'

import classNames from 'classnames'
import PlayIcon from 'mdi-react/PlayIcon'

import { ErrorAlert, ErrorMessage } from '@sourcegraph/branded/src/components/alerts'
import { NotAvailableReasonType, SearchAggregationMode } from '@sourcegraph/shared/src/graphql-operations'
import { lazyComponent } from '@sourcegraph/shared/src/util/lazyComponent'
import { Text, Link, Tooltip, ForwardReferenceComponent, Button } from '@sourcegraph/wildcard'

import { SearchAggregationDatum, GetSearchAggregationResult } from '../../../../graphql-operations'

import type { AggregationChartProps } from './AggregationChart'

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

function getAggregationError(
    aggregation?: SearchAggregationResult
): { error: Error; type: NotAvailableReasonType } | undefined {
    if (aggregation?.__typename === 'SearchAggregationNotAvailable') {
        return { error: new Error(aggregation.reason), type: aggregation.reasonType }
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
    onExtendTimeout: () => void
}

export function AggregationChartCard(props: AggregationChartCardProps): ReactElement | null {
    const {
        data,
        error,
        loading,
        mode,
        className,
        size = 'sm',
        'aria-label': ariaLabel,
        onBarLinkClick,
        onExtendTimeout,
    } = props

    if (loading) {
        return (
            <DataLayoutContainer
                data-error-layout={true}
                size={size}
                className={classNames(styles.aggregationErrorContainer, className)}
            >
                <BarsBackground size={size} />
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
            <DataLayoutContainer
                data-error-layout={true}
                size={size}
                className={classNames(styles.aggregationErrorContainer, className)}
            >
                <BarsBackground size={size} />
                <div className={styles.errorMessageLayout}>
                    <div className={styles.errorMessage}>
                        {aggregationError.type === NotAvailableReasonType.TIMEOUT_EXTENSION_AVAILABLE ? (
                            <Button variant="link" className={styles.errorButton} onClick={onExtendTimeout}>
                                <PlayIcon />
                                Run aggregation
                            </Button>
                        ) : (
                            <>
                                We couldn’t provide an aggregation for this query.{' '}
                                <ErrorMessage error={aggregationError.error} /> <Link to="">Learn more</Link>
                            </>
                        )}
                    </div>
                </div>
            </DataLayoutContainer>
        )
    }

    if (!data) {
        return null
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

interface DataLayoutContainerProps {
    size?: 'sm' | 'md'
}

const DataLayoutContainer = forwardRef(function DataLayoutContainerRef(props, ref) {
    const { as: Component = 'div', size = 'md', className, ...attributes } = props

    return (
        <Component
            {...attributes}
            ref={ref}
            className={classNames(className, styles.errorContainer, {
                [styles.errorContainerSmall]: size === 'sm',
            })}
        />
    )
}) as ForwardReferenceComponent<'div', DataLayoutContainerProps>

const BAR_VALUES_FULL_UI = [95, 88, 83, 70, 65, 45, 35, 30, 30, 30, 30, 27, 27, 27, 27, 24, 10, 10, 10, 10, 10]
const BAR_VALUES_SIDEBAR_UI = [95, 80, 75, 70, 68, 68, 55, 40, 38, 33, 30, 25, 15, 7]

interface BarsBackgroundProps extends SVGProps<SVGSVGElement> {
    size: 'sm' | 'md'
}

const BarsBackground: FC<BarsBackgroundProps> = props => {
    const { size, className, ...attributes } = props

    const padding = size === 'md' ? 1 : 2
    const data = size === 'md' ? BAR_VALUES_FULL_UI : BAR_VALUES_SIDEBAR_UI
    const barWidth = (100 - padding * (data.length - 1)) / data.length

    return (
        <svg
            {...attributes}
            className={classNames(className, styles.zeroStateBackground)}
            xmlns="http://www.w3.org/2000/svg"
        >
            {data.map((bar, index) => (
                <rect
                    key={index}
                    x={`${index * (barWidth + padding)}%`}
                    y={`${100 - bar}%`}
                    height={`${bar}%`}
                    width={`${barWidth}%`}
                />
            ))}
        </svg>
    )
}
