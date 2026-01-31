
import type { ShikiTransformer } from 'shiki'

export function transformerHover(): ShikiTransformer {
    return {
        name: 'custom:hover',
        preprocess(code, options) {
            // Logic to remove v-pre if the code contains our trigger
            const regex = /^\s*(?:--|\/\/|#|;)\s*\^/m
            if (regex.test(code)) {
                const vPre = options.transformers?.find(i => i.name === 'vitepress:v-pre')
                if (vPre && options.transformers) {
                    options.transformers.splice(options.transformers.indexOf(vPre), 1)
                }
            }
        },

        code(code) {
            // code is the HAST element <code>
            const lineNodes: any[] = []
            code.children.forEach((child: any) => {
                if (child.type === 'element' && child.tagName === 'span' && child.properties.class && typeof child.properties.class === 'string' && child.properties.class.includes('line')) {
                    lineNodes.push(child)
                }
                else if (child.type === 'element' && child.tagName === 'span' && Array.isArray(child.properties.class) && child.properties.class.includes('line')) {
                    lineNodes.push(child)
                }
            })

            const linesToRemove = new Set<any>()

            for (let i = 1; i < lineNodes.length; i++) {
                const lineNode = lineNodes[i]
                // Get text content recursively
                let text = ''
                const visit = (n: any) => {
                    if (n.type === 'text') text += n.value
                    if (n.children) n.children.forEach(visit)
                }
                visit(lineNode)

                const match = text.match(/^(\s*(?:--|\/\/|#|;)\s*)\^(.*)/)
                if (match) {
                    const prefix = match[1]
                    const tooltip = match[2].trim()

                    const colIndex = prefix.length

                    const prevLine = lineNodes[i - 1]

                    let currentLen = 0
                    let targetToken = null
                    let targetTokenIdx = -1

                    for (let j = 0; j < prevLine.children.length; j++) {
                        const token = prevLine.children[j]
                        if (token.type !== 'element' || token.tagName !== 'span') {
                            if (token.type === 'text') currentLen += token.value.length
                            continue
                        }

                        let tokenText = ''
                        const visitToken = (n: any) => {
                            if (n.type === 'text') tokenText += n.value
                            if (n.children) n.children.forEach(visitToken)
                        }
                        visitToken(token)

                        const tokenLen = tokenText.length

                        if (currentLen <= colIndex && colIndex < currentLen + tokenLen) {
                            targetToken = token
                            targetTokenIdx = j
                            break
                        }
                        currentLen += tokenLen
                    }

                    if (targetToken) {
                        const vMenu = {
                            type: 'element',
                            tagName: 'v-menu',
                            properties: {
                                'class': 'twoslash-hover',
                                'popper-class': 'vp-code shiki floating-vue-theme-twoslash',
                                'theme': 'twoslash',
                                'tag': 'span', // Force inline wrapper
                            },
                            children: [
                                targetToken,
                                {
                                    type: 'element',
                                    tagName: 'template',
                                    properties: { 'v-slot:popper': '{}' },
                                    content: {
                                        type: 'root',
                                        children: [
                                            {
                                                type: 'element',
                                                tagName: 'div',
                                                properties: { class: 'custom-hover-popup' },
                                                children: [
                                                    { type: 'text', value: tooltip }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            ]
                        }

                        prevLine.children[targetTokenIdx] = vMenu
                        linesToRemove.add(lineNode)
                    }
                }
            }

            const childrenToRemove = new Set<any>()
            linesToRemove.forEach(line => {
                childrenToRemove.add(line)
                const idx = code.children.indexOf(line)
                if (idx > 0) {
                    const prev = code.children[idx - 1]
                    if (prev.type === 'text' && prev.value === '\n') {
                        childrenToRemove.add(prev)
                    }
                }
            })

            code.children = code.children.filter((n: any) => !childrenToRemove.has(n))
        }
    }
}
