import React, { useEffect, useState } from 'react'

import { AuthenticatedUser } from '../../../auth'
import { CodeMonitorFields } from '../../../graphql-operations'
import { useExperimentalFeatures } from '../../../stores'

import { EmailAction } from './actions/EmailAction'
import { SlackWebhookAction } from './actions/SlackWebhookAction'
import { WebhookAction } from './actions/WebhookAction'

export interface ActionAreaProps {
    actions: CodeMonitorFields['actions']
    actionsCompleted: boolean
    setActionsCompleted: (completed: boolean) => void
    disabled: boolean
    authenticatedUser: AuthenticatedUser
    onActionsChange: (action: CodeMonitorFields['actions']) => void
    monitorName: string
}

export interface ActionProps {
    action?: MonitorAction
    setAction: (action?: MonitorAction) => void
    actionCompleted: boolean
    setActionCompleted: (actionCompleted: boolean) => void
    disabled: boolean
    monitorName: string
}

export type MonitorAction = CodeMonitorFields['actions']['nodes'][number]

/**
 * TODO farhan: this component is built with the assumption that each monitor has exactly one email action.
 * Refactor to accomodate for more than one.
 */
export const FormActionArea: React.FunctionComponent<ActionAreaProps> = ({
    actions,
    actionsCompleted,
    setActionsCompleted,
    disabled,
    authenticatedUser,
    onActionsChange,
    monitorName,
}) => {
    const [emailAction, setEmailAction] = useState<MonitorAction | undefined>(
        actions.nodes.find(action => action.__typename === 'MonitorEmail')
    )
    const [emailActionCompleted, setEmailActionCompleted] = useState(!!emailAction && actionsCompleted)

    const [slackWebhookAction, setSlackWebhookAction] = useState<MonitorAction | undefined>(
        actions.nodes.find(action => action.__typename === 'MonitorSlackWebhook')
    )
    const [slackWebhookActionCompleted, setSlackWebhookActionCompleted] = useState(
        !!slackWebhookAction && actionsCompleted
    )

    // Form is completed only if all set actions are completed and all incomplete actions are unset,
    // and there is at least one completed action.
    useEffect(() => {
        const allExistingActionsCompleted =
            (!emailAction || emailActionCompleted) && (!slackWebhookAction || slackWebhookActionCompleted)

        const atLeastOneActionCompleted = emailActionCompleted || slackWebhookActionCompleted

        setActionsCompleted(allExistingActionsCompleted && atLeastOneActionCompleted)
    }, [emailAction, emailActionCompleted, setActionsCompleted, slackWebhookAction, slackWebhookActionCompleted])

    useEffect(() => {
        const actions: CodeMonitorFields['actions'] = { nodes: [] }
        if (emailAction) {
            actions.nodes.push(emailAction)
        }
        if (slackWebhookAction) {
            actions.nodes.push(slackWebhookAction)
        }
        onActionsChange(actions)
    }, [emailAction, onActionsChange, slackWebhookAction])

    const showWebhooks = useExperimentalFeatures(features => features.codeMonitoringWebHooks)

    return (
        <>
            <h3 className="mb-1">Actions</h3>
            <span className="text-muted">Run any number of actions in response to an event</span>
            <EmailAction
                disabled={disabled}
                action={emailAction}
                setAction={setEmailAction}
                actionCompleted={emailActionCompleted}
                setActionCompleted={setEmailActionCompleted}
                authenticatedUser={authenticatedUser}
                monitorName={monitorName}
            />
            {showWebhooks && (
                <>
                    <SlackWebhookAction
                        disabled={disabled}
                        action={slackWebhookAction}
                        setAction={setSlackWebhookAction}
                        actionCompleted={slackWebhookActionCompleted}
                        setActionCompleted={setSlackWebhookActionCompleted}
                        monitorName={monitorName}
                    />

                    <WebhookAction />
                </>
            )}

            <small className="text-muted">
                What other actions would you like to take?{' '}
                <a href="mailto:feedback@sourcegraph.com" target="_blank" rel="noopener">
                    Share feedback.
                </a>
            </small>
        </>
    )
}
