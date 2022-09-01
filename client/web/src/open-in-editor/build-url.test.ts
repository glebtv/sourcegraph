import { buildEditorUrl } from './build-url'
import { EditorSettings } from './editor-settings'

function buildSettings({ editorId, projectsPaths, ...props }: EditorSettings = {}): EditorSettings {
    return {
        editorId: editorId || 'vscode',
        projectsPaths: projectsPaths || { default: '/home/user/projects' },
        ...props,
    }
}

describe('buildUrl tests', () => {
    const defaultRange = { start: { line: 43, character: 0 }, end: { line: 43, character: 0 } }
    const defaultPath = 'sourcegraph/.gitignore'
    const baseUrl = 'https://sourcegraph.com'
    describe('happy paths', () => {
        it('builds the correct URL for some basic settings and VS Code', () => {
            const url = buildEditorUrl(defaultPath, defaultRange, buildSettings(), baseUrl)
            expect(url.toString()).toBe('vscode://file/home/user/projects/sourcegraph/.gitignore:43:0')
        })

        it('builds the correct URL for some basic settings and IDEA', () => {
            const url = buildEditorUrl(defaultPath, defaultRange, buildSettings({ editorId: 'idea' }), baseUrl)
            expect(url.toString()).toBe('idea://open?file=/home/user/projects/sourcegraph/.gitignore&line=43&column=0')
        })

        it('builds the correct URL for some basic settings and Atom', () => {
            const url = buildEditorUrl(defaultPath, defaultRange, buildSettings({ editorId: 'atom' }), baseUrl)
            expect(url.toString()).toBe(
                'atom://core/open/file?filename=/home/user/projects/sourcegraph/.gitignore:43:0'
            )
        })

        it('builds the correct URL for some basic settings and Sublime', () => {
            const url = buildEditorUrl(defaultPath, defaultRange, buildSettings({ editorId: 'sublime' }), baseUrl)
            expect(url.toString()).toBe('subl://open?url=/home/user/projects/sourcegraph/.gitignore&line=43&column=0')
        })

        it('builds the correct URL for some basic settings and PyCharm', () => {
            const url = buildEditorUrl(defaultPath, defaultRange, buildSettings({ editorId: 'pycharm' }), baseUrl)
            expect(url.toString()).toBe(
                'pycharm://open?file=/home/user/projects/sourcegraph/.gitignore&line=43&column=0'
            )
        })

        it('rewrites default project path with OS specific one', () => {
            const oldUserAgent = navigator.userAgent
            Object.defineProperty(navigator, 'userAgent', { value: 'MacOS', writable: true })
            const url = buildEditorUrl(
                defaultPath,
                defaultRange,
                buildSettings({
                    editorId: 'goland',
                    projectsPaths: { default: '/home/user/projects', mac: '/Users/user/projects' },
                }),
                baseUrl
            )
            expect(url.toString()).toBe(
                'goland://open?file=/Users/user/projects/sourcegraph/.gitignore&line=43&column=0'
            )
            Object.defineProperty(navigator, 'userAgent', { value: oldUserAgent, writable: true })
        })

        it('performs replacements', () => {
            const url = buildEditorUrl(
                defaultPath,
                defaultRange,
                buildSettings({ replacements: { projects: 'new-projects' } }),
                baseUrl
            )
            expect(url.toString()).toBe('vscode://file/home/user/new-projects/sourcegraph/.gitignore:43:0')
        })

        it('forces JetBrains built-in server', () => {
            const url = buildEditorUrl(
                defaultPath,
                defaultRange,
                buildSettings({
                    editorId: 'goland',
                    jetbrains: { forceApi: 'builtInServer' },
                }),
                baseUrl
            )
            expect(url.toString()).toBe(
                'http://localhost:63342/api/file/home/user/projects/sourcegraph/.gitignore:43:0'
            )
        })

        it('handles UNC paths for VS Code', () => {
            const url = buildEditorUrl(
                defaultPath,
                defaultRange,
                buildSettings({
                    projectsPaths: { default: '/server/projects' },
                    vscode: { isBasePathUNCPath: true },
                }),
                baseUrl
            )
            expect(url.toString()).toBe('vscode://file//server/projects/sourcegraph/.gitignore:43:0')
        })

        it('handles Windows paths for VS Code', () => {
            const url = buildEditorUrl(
                defaultPath,
                defaultRange,
                buildSettings({ projectsPaths: { default: 'C:\\Projects' } }),
                baseUrl
            )
            expect(url.toString()).toBe('vscode://file/C:\\Projects/sourcegraph/.gitignore:43:0')
        })

        it('handles no range', () => {
            const url = buildEditorUrl(defaultPath, undefined, buildSettings(), baseUrl)
            expect(url.toString()).toBe('vscode://file/home/user/projects/sourcegraph/.gitignore:1:1')
        })

        it('can use insiders build of VS Code', () => {
            const url = buildEditorUrl(
                defaultPath,
                defaultRange,
                buildSettings({ vscode: { useInsiders: true } }),
                baseUrl
            )
            expect(url.toString()).toBe('vscode-insiders://file/home/user/projects/sourcegraph/.gitignore:43:0')
        })

        it('can use SSH with VS Code', () => {
            const url = buildEditorUrl(
                defaultPath,
                defaultRange,
                buildSettings({
                    vscode: {
                        useSSH: true,
                        remoteHostForSSH: '127.0.0.1',
                    },
                }),
                baseUrl
            )
            expect(url.toString()).toBe(
                'vscode://vscode-remote/ssh-remote+127.0.0.1/home/user/projects/sourcegraph/.gitignore:43:0'
            )
        })

        it('can use SSH with VS Code Insiders', () => {
            const url = buildEditorUrl(
                defaultPath,
                defaultRange,
                buildSettings({
                    vscode: {
                        useInsiders: true,
                        useSSH: true,
                        remoteHostForSSH: '127.0.0.1',
                    },
                }),
                baseUrl
            )
            expect(url.toString()).toBe(
                'vscode-insiders://vscode-remote/ssh-remote+127.0.0.1/home/user/projects/sourcegraph/.gitignore:43:0'
            )
        })

        it('can use a custom URL pattern', () => {
            const url = buildEditorUrl(
                defaultPath,
                defaultRange,
                buildSettings({
                    editorId: 'custom',
                    custom: { urlPattern: 'idea://test?file=%file&line=%line&column=%col' },
                }),
                baseUrl
            )
            expect(url.toString()).toBe('idea://test?file=/home/user/projects/sourcegraph/.gitignore&line=43&column=0')
        })
    })

    describe('unhappy paths', () => {
        it('recognizes missing editor settings', () => {
            expect(() => {
                buildEditorUrl(defaultPath, defaultRange, undefined, baseUrl)
            }).toThrow()
        })

        it('recognizes missing project path', () => {
            expect(() => {
                buildEditorUrl(defaultPath, defaultRange, { editorId: 'vscode' }, baseUrl)
            }).toThrow()
        })

        it('recognizes non-absolute project path', () => {
            expect(() => {
                buildEditorUrl(
                    defaultPath,
                    defaultRange,
                    buildSettings({ projectsPaths: { default: '../projects' } }),
                    baseUrl
                )
            }).toThrow()
        })

        it('recognizes missing editor ID', () => {
            expect(() => {
                buildEditorUrl(
                    defaultPath,
                    defaultRange,
                    { projectsPaths: { default: '/home/user/projects' } },
                    baseUrl
                )
            }).toThrow()
        })

        it('recognizes missing customUrlPattern in case of custom editor setting', () => {
            expect(() => {
                buildEditorUrl(
                    defaultPath,
                    defaultRange,
                    buildSettings({
                        editorId: 'custom',
                        projectsPaths: { default: '/home/user/projects' },
                    }),
                    baseUrl
                )
            }).toThrow()
        })

        it('recognizes missing editor settings', () => {
            expect(() => {
                buildEditorUrl(defaultPath, defaultRange, { editorId: 'vscode' }, baseUrl)
            }).toThrow()
        })

        it('recognizes missing SSH remote setting if vscode SSH mode is enabled', () => {
            expect(() => {
                buildEditorUrl(defaultPath, defaultRange, buildSettings({ vscode: { useSSH: true } }), baseUrl)
            }).toThrow()
        })

        it('builds the right "Learn more" URL', () => {
            expect(() => {
                buildEditorUrl(defaultPath, defaultRange, { editorId: 'vscode' }, baseUrl)
            }).toThrow(/https:\/\/sourcegraph\.com\/extensions\/sourcegraph\/open-in-editor/)
        })
    })
})
