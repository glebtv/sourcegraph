import classNames from 'classnames'
import React, { useCallback, useMemo } from 'react'
import { RouteComponentProps } from 'react-router'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { Link } from '@sourcegraph/shared/src/components/Link'
import { dataOrThrowErrors } from '@sourcegraph/shared/src/graphql/graphql'
import { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { Container, PageHeader } from '@sourcegraph/wildcard'

import { requestGraphQL } from '../../../backend/graphql'
import { FilteredConnection } from '../../../components/FilteredConnection'
import { PageTitle } from '../../../components/PageTitle'
import { Timestamp } from '../../../components/time/Timestamp'
import { UserSettingsAreaRouteContext } from '../../../user/settings/UserSettingsArea'

import styles from './UserEventLogsPage.module.scss'
import { UserEventLogFields, UserEventLogsConnectionFields, UserEventLogsDocument } from './UserEventLogsPage.queries'

interface UserEventNodeProps {
    /**
     * The user to display in this list item.
     */
    node: UserEventLogFields
}

export const UserEventNode: React.FunctionComponent<UserEventNodeProps> = ({ node }: UserEventNodeProps) => (
    <li className={classNames('list-group-item', styles.eventLog)}>
        <div className="d-flex align-items-center justify-content-between">
            <code>{node.name}</code>
            <div>
                <Timestamp date={node.timestamp} />
            </div>
        </div>
        <div className="text-break">
            <small>
                From: {node.source}{' '}
                {node.url && (
                    <span>
                        (<Link to={node.url}>{node.url}</Link>)
                    </span>
                )}
            </small>
        </div>
    </li>
)

export interface UserEventLogsPageProps
    extends Pick<UserSettingsAreaRouteContext, 'user'>,
        Pick<RouteComponentProps, 'history' | 'location'>,
        TelemetryProps {}

/**
 * A page displaying usage statistics for the site.
 */
export const UserEventLogsPage: React.FunctionComponent<UserEventLogsPageProps> = ({
    telemetryService,
    history,
    location,
    user,
}) => {
    useMemo(() => {
        telemetryService.logViewEvent('UserEventLogPage')
    }, [telemetryService])

    const queryUserEventLogs = useCallback(
        (args: { first?: number }): Observable<UserEventLogsConnectionFields> =>
            requestGraphQL(UserEventLogsDocument, {
                first: args.first ?? null,
                user: user.id,
            }).pipe(
                map(dataOrThrowErrors),
                map(data => {
                    if (!data.node) {
                        throw new Error('User not found')
                    }
                    if (data.node.__typename !== 'User') {
                        throw new Error(`Requested node is a ${data.node.__typename}, not a User`)
                    }
                    return data.node.eventLogs
                })
            ),
        [user.id]
    )

    return (
        <>
            <PageTitle title="User event log" />
            <PageHeader path={[{ text: 'Event log' }]} headingElement="h2" className="mb-3" />
            <Container className="mb-3">
                <FilteredConnection<UserEventLogFields, {}>
                    key="chronological"
                    defaultFirst={50}
                    className="list-group list-group-flush"
                    hideSearch={true}
                    noun="user event"
                    pluralNoun="user events"
                    queryConnection={queryUserEventLogs}
                    nodeComponent={UserEventNode}
                    history={history}
                    location={location}
                />
            </Container>
        </>
    )
}
