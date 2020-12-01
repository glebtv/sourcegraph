import { describe, test, before, beforeEach, after } from 'mocha'
import { afterEachSaveScreenshotIfFailed } from '../../../shared/src/testing/screenshotReporter'
import { afterEachRecordCoverage } from '../../../shared/src/testing/coverage'
import { createDriverForTest, Driver } from '../../../shared/src/testing/driver'
import { ExternalServiceKind } from '../../../shared/src/graphql/schema'
import { getConfig } from '../../../shared/src/testing/config'

const { gitHubToken, sourcegraphBaseUrl } = getConfig('gitHubToken', 'sourcegraphBaseUrl')

describe('End-to-end test suite', () => {
    let driver: Driver

    before(async () => {
        const config = getConfig('headless', 'slowMo', 'testUserPassword')
        // Start browser
        driver = await createDriverForTest({
            sourcegraphBaseUrl,
            logBrowserConsole: true,
            ...config,
        })
        const clonedRepoSlugs = [
            'sourcegraph/java-langserver',
            'gorilla/mux',
            'gorilla/securecookie',
            'sourcegraph/jsonrpc2',
            'sourcegraph/go-diff',
            'sourcegraph/appdash',
            'sourcegraph/sourcegraph-typescript',
            'sourcegraph-testing/automation-e2e-test',
            'sourcegraph/e2e-test-private-repository',
        ]
        const alwaysCloningRepoSlugs = ['sourcegraphtest/AlwaysCloningTest']
        await driver.ensureLoggedIn({ username: 'test', password: config.testUserPassword, email: 'test@test.com' })
        await driver.resetUserSettings()
        await driver.ensureHasExternalService({
            kind: ExternalServiceKind.GITHUB,
            displayName: 'test-test-github',
            config: JSON.stringify({
                url: 'https://github.com',
                token: gitHubToken,
                repos: clonedRepoSlugs.concat(alwaysCloningRepoSlugs),
            }),
            ensureRepos: clonedRepoSlugs.map(slug => `github.com/${slug}`),
            alwaysCloning: alwaysCloningRepoSlugs.map(slug => `github.com/${slug}`),
        })
    })

    after('Close browser', () => driver?.close())

    afterEachSaveScreenshotIfFailed(() => driver.page)
    afterEachRecordCoverage(() => driver)

    beforeEach(async () => {
        if (driver) {
            // Clear local storage to reset sidebar selection (files or tabs) for each test
            await driver.page.evaluate(() => {
                localStorage.setItem('repo-revision-sidebar-last-tab', 'files')
            })

            await driver.resetUserSettings()
        }
    })

    describe('Core functionality', () => {
        test('Check allowed usernames', async () => {
            await driver.page.goto(sourcegraphBaseUrl + '/users/test/settings/profile')
            await driver.page.waitForSelector('.test-UserProfileFormFields-username')

            const name = 'alice.bob-chris-'

            await driver.replaceText({
                selector: '.test-UserProfileFormFields-username',
                newText: name,
                selectMethod: 'selectall',
            })

            await driver.page.click('#test-EditUserProfileForm__save')
            await driver.page.waitForSelector('.test-EditUserProfileForm__success', { visible: true })

            await driver.page.goto(sourcegraphBaseUrl + `/users/${name}/settings/profile`)
            await driver.replaceText({
                selector: '.test-UserProfileFormFields-username',
                newText: 'test',
                selectMethod: 'selectall',
            })

            await driver.page.click('#test-EditUserProfileForm__save')
            await driver.page.waitForSelector('.test-EditUserProfileForm__success', { visible: true })
        })
    })
})
